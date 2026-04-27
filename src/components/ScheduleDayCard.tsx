"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DAY_NAMES, WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";
import LockIcon from "@/components/LockIcon";
import { THEMED_LOCK_BADGE_LG_CLASS } from "@/constants/dayCardVisual";
import { injectScheduleMovementVideoPreload } from "@/lib/schedule-movement-video-prefetch";
import { unoptimizedRemoteImage } from "@/lib/remote-image";

interface ScheduleDayCardProps {
  day: {
    id: string;
    dayIndex: number;
    prayerTitle: string | null;
    workoutTitle: string | null;
    affirmationText: string | null;
    prayerId?: string | null;
    workoutId?: string | null;
    dayImageUrl?: string | null;
    /** Per-day video URL; when set with workoutId, schedule-day player prefers this */
    dayVideoUrl?: string | null;
    daySubtext?: string | null;
    completion: {
      prayerDone: boolean;
      workoutDone: boolean;
      affirmationDone: boolean;
    } | null;
  };
  isToday?: boolean;
  /** When true, show lock icon and block checklist, deep links, and Start (guest or non-subscriber). */
  isLocked?: boolean;
  /** Unlocks CTA when `isLocked` (e.g. `/register` for guests, `/subscribe` for members). */
  lockCtaHref?: string;
  /** Primary button label when locked; defaults from `lockCtaHref`. */
  lockPrimaryLabel?: string;
  /** Tooltip / aria for lock badge. */
  lockHint?: string;
  /**
   * CMS: same visuals as the member card, but checklist is read-only and the primary
   * action opens the editor instead of “Start”.
   */
  cmsMode?: boolean;
  onEditCard?: () => void;
  /** Resolved movement MP4 URL — enables preload hints while browsing the week. */
  movementVideoSrc?: string | null;
}

/** Encouragement row — blank open book (Heroicons outline `book-open`, MIT). */
function IconEncouragement() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}
/** Movement row — butterfly (Phosphor Icons `butterfly` regular, MIT). */
function IconWorkout() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-gray"
      fill="none"
      stroke="currentColor"
      strokeWidth={16}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 256 256"
      aria-hidden
    >
      <line x1="128" y1="56" x2="128" y2="180" />
      <path d="M187.76,151.94c8.05.48,29.5-1.29,37.36-32.23C233.21,87.84,240.22,48,208.93,48S128,95.8,128,127.67C128,95.8,78.36,48,47.07,48S22.79,87.84,30.88,119.71c7.86,30.94,29.31,32.71,37.36,32.23" />
      <path d="M88,144a36.11,36.11,0,1,0,40,36,36,36,0,1,0,40-36" />
    </svg>
  );
}
/** Affirmation row — Latin cross (taller vertical bar, horizontal near the top). */
function IconAffirmation() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 3h3v3.5h5v3h-5v11h-3v-11h-5v-3h5V3z"
      />
    </svg>
  );
}

/** Heroicons outline arrow-path — restart / do again */
function IconRestartDay() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

export default function ScheduleDayCard({
  day,
  isToday = false,
  isLocked = false,
  lockCtaHref = "/subscribe",
  lockPrimaryLabel,
  lockHint,
  cmsMode = false,
  onEditCard,
  movementVideoSrc,
}: ScheduleDayCardProps) {
  const resolvedLockLabel =
    lockPrimaryLabel ??
    (lockCtaHref === "/register" ? "Sign up to unlock" : "Subscribe to unlock");
  const resolvedLockHint =
    lockHint ??
    (lockCtaHref === "/register" ? "Sign up to unlock this week" : "Subscribe to unlock");
  const [prayerDone, setPrayerDone] = useState(day.completion?.prayerDone ?? false);
  const [workoutDone, setWorkoutDone] = useState(day.completion?.workoutDone ?? false);
  const [affirmationDone, setAffirmationDone] = useState(
    day.completion?.affirmationDone ?? false
  );
  const [loading, setLoading] = useState(false);

  /** Hover / focus / pointer-down warms today's workout MP4 before navigation.
   *  We intentionally do NOT prefetch on mount — many schedule visits are just to
   *  toggle a checkbox or read the verse and never start a workout. Prefetching
   *  on every page load was burning bandwidth on visits that never needed the video. */
  const prefetchMovementVideo = useCallback(() => {
    if (!movementVideoSrc?.trim() || isLocked) return;
    injectScheduleMovementVideoPreload(movementVideoSrc);
  }, [movementVideoSrc, isLocked]);

  useEffect(() => {
    if (!day.completion) return;
    setPrayerDone(day.completion.prayerDone);
    setWorkoutDone(day.completion.workoutDone);
    setAffirmationDone(day.completion.affirmationDone);
  }, [
    day.completion?.prayerDone,
    day.completion?.workoutDone,
    day.completion?.affirmationDone,
    day.id,
  ]);

  const prayerDoneShow = cmsMode ? false : prayerDone;
  const workoutDoneShow = cmsMode ? false : workoutDone;
  const affirmationDoneShow = cmsMode ? false : affirmationDone;

  const total = 3;
  const done =
    (prayerDoneShow ? 1 : 0) + (workoutDoneShow ? 1 : 0) + (affirmationDoneShow ? 1 : 0);
  const progress = Math.round((done / total) * 100);

  async function toggle(type: "prayer" | "workout" | "affirmation") {
    if (cmsMode || isLocked) return;
    if (loading) return;
    setLoading(true);
    const updates = {
      prayerDone: type === "prayer" ? !prayerDone : prayerDone,
      workoutDone: type === "workout" ? !workoutDone : workoutDone,
      affirmationDone: type === "affirmation" ? !affirmationDone : affirmationDone,
    };
    if (type === "prayer") setPrayerDone(updates.prayerDone);
    if (type === "workout") setWorkoutDone(updates.workoutDone);
    if (type === "affirmation") setAffirmationDone(updates.affirmationDone);
    try {
      const res = await fetch(`/api/schedule/${day.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      if (type === "prayer") setPrayerDone(prayerDone);
      if (type === "workout") setWorkoutDone(workoutDone);
      if (type === "affirmation") setAffirmationDone(affirmationDone);
    } finally {
      setLoading(false);
    }
  }

  const demoDay = day.id.startsWith("demo-schedule-day-");
  /** First bullet = encouragement video. Demo days have no persistence, so fall back to the prayer library. */
  const firstBulletHref = demoDay ? "/prayer" : `/schedule/encouragement/${day.id}`;
  /** Real days: intro + single video under Schedule (not Movement library). Demo preview: direct workout or library. */
  const workoutHref = demoDay
    ? day.workoutId
      ? `/movement/${day.workoutId}`
      : "/movement"
    : `/schedule/movement/${day.id}`;

  const allDone = done === total;
  /** Start always opens the day movement session (intro + video), not prayer/journal order. */
  const startHref = workoutHref;

  /** Only prefetch for today's card. Hovering/tabbing through other days would
   *  otherwise pre-download 6 unrelated workouts (huge Bunny/Supabase egress hit
   *  with zero UX benefit — those videos are only opened when the user navigates
   *  to next week's schedule). Non-today cards just load on click. */
  const movementPrefetchHandlers =
    isToday && movementVideoSrc?.trim() && !isLocked
      ? {
          onMouseEnter: prefetchMovementVideo,
          onFocus: prefetchMovementVideo,
          onPointerDown: prefetchMovementVideo,
        }
      : undefined;

  return (
    <article
      className={`relative overflow-hidden rounded-lg bg-app-surface shadow-[0_1px_2px_rgba(120,130,135,0.06)] transition-transform duration-300 ease-out motion-safe:hover:will-change-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        isToday ? "border-2 border-sky-blue" : "border border-sand"
      }`}
    >
      {isToday && (
        <span className="absolute right-2 top-2 z-10 rounded-sm bg-sky-blue px-2 py-1 text-xs font-semibold text-white [font-family:var(--font-body),sans-serif]">
          Today
        </span>
      )}
      {isLocked && (
        <span
          className={`absolute left-3 top-3 z-10 ${THEMED_LOCK_BADGE_LG_CLASS}`}
          title={resolvedLockHint}
          aria-label={resolvedLockHint}
        >
          <LockIcon size="sm" className="text-white" />
        </span>
      )}

      <div className="relative aspect-[16/13] min-h-[11rem] overflow-hidden bg-sand sm:min-h-[13rem] md:aspect-[16/14] md:min-h-[14rem]">
        {day.dayImageUrl ? (
          <Image
            src={day.dayImageUrl}
            alt=""
            fill
            unoptimized={unoptimizedRemoteImage(day.dayImageUrl)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
            className="object-cover object-center"
            loading="eager"
          />
        ) : (
          <Image
            src={WEEKLY_DAY_CARD_IMAGES[day.dayIndex % WEEKLY_DAY_CARD_IMAGES.length]}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
            className="object-cover object-center"
            loading="eager"
          />
        )}
        {/* Parity: ScheduleScreen dayImageShade — uniform 20% black */}
        <div className="absolute inset-0 bg-black/20" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-2">
          <h3 className="text-lg font-semibold tracking-tight text-white [font-family:var(--font-headline),sans-serif]">
            {DAY_NAMES[day.dayIndex] ?? ""}
          </h3>
          {day.daySubtext ? (
            <p className="mt-0.5 line-clamp-2 text-xs font-medium text-white/90 [font-family:var(--font-body),sans-serif]">
              {day.daySubtext}
            </p>
          ) : null}
        </div>
      </div>

      {/* Parity: expo-linear-gradient colors #FFF6E6 → #F3E7CC, start (0,0) end (1,1) */}
      <div
        className="relative p-1 [font-family:var(--font-body),sans-serif]"
        style={{
          backgroundImage: "linear-gradient(135deg, #FFF6E6 0%, #F3E7CC 100%)",
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-normal text-gray">
            {done}/{total} complete
          </span>
          <div className="h-1 w-[70px] shrink-0 overflow-hidden rounded-sm bg-sand">
            <div
              className="h-full bg-accent-amber transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggle("prayer")}
              disabled={loading || cmsMode || isLocked}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                prayerDoneShow ? "border-sky-blue bg-sky-blue" : "border-sand bg-background hover:bg-background/90"
              } ${cmsMode || isLocked ? "cursor-default opacity-60" : ""}`}
              aria-pressed={prayerDoneShow}
              type="button"
            >
              {prayerDoneShow ? <span className="text-[11px] leading-none text-white">✓</span> : null}
            </button>
            {isLocked ? (
              <span className="min-w-0 flex-1 cursor-default text-sm text-gray">{day.prayerTitle ?? "Encouragement"}</span>
            ) : (
              <Link
                href={firstBulletHref}
                className="min-w-0 flex-1 text-sm text-gray hover:text-sky-blue hover:underline"
              >
                {day.prayerTitle ?? "Encouragement"}
              </Link>
            )}
            <IconEncouragement />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggle("workout")}
              disabled={loading || cmsMode || isLocked}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                workoutDoneShow ? "border-sky-blue bg-sky-blue" : "border-sand bg-background hover:bg-background/90"
              } ${cmsMode || isLocked ? "cursor-default opacity-60" : ""}`}
              aria-pressed={workoutDoneShow}
              type="button"
            >
              {workoutDoneShow ? <span className="text-[11px] leading-none text-white">✓</span> : null}
            </button>
            {isLocked ? (
              <span className="min-w-0 flex-1 cursor-default text-sm text-gray">{day.workoutTitle ?? "Movement"}</span>
            ) : (
              <Link
                href={workoutHref}
                className="min-w-0 flex-1 text-sm text-gray hover:text-sky-blue hover:underline"
                {...movementPrefetchHandlers}
              >
                {day.workoutTitle ?? "Movement"}
              </Link>
            )}
            <IconWorkout />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggle("affirmation")}
              disabled={loading || cmsMode || isLocked}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                affirmationDoneShow ? "border-sky-blue bg-sky-blue" : "border-sand bg-background hover:bg-background/90"
              } ${cmsMode || isLocked ? "cursor-default opacity-60" : ""}`}
              aria-pressed={affirmationDoneShow}
              type="button"
            >
              {affirmationDoneShow ? <span className="text-[11px] leading-none text-white">✓</span> : null}
            </button>
            <span className="min-w-0 flex-1 text-sm italic text-gray">
              {day.affirmationText ?? "Affirmation"}
            </span>
            <IconAffirmation />
          </div>
        </div>

        <div className="relative mt-1 flex min-h-[52px] w-full items-center justify-center">
          {cmsMode && onEditCard ? (
            <button
              type="button"
              onClick={onEditCard}
              className="inline-flex min-w-[132px] items-center justify-center rounded-md border border-sand bg-white px-8 py-2 text-base font-semibold text-foreground transition-opacity [font-family:var(--font-body),sans-serif] hover:bg-sunset-peach/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
            >
              Edit card
            </button>
          ) : isLocked ? (
            <Link
              href={lockCtaHref}
              className="inline-flex min-w-[132px] items-center justify-center rounded-md bg-sky-blue px-6 py-2 text-center text-base font-semibold text-white transition-opacity [font-family:var(--font-body),sans-serif] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
            >
              {resolvedLockLabel}
            </Link>
          ) : allDone ? (
            <>
              <span
                className="inline-flex min-w-[132px] cursor-default items-center justify-center rounded-md bg-sky-blue px-8 py-2 text-base font-semibold text-white opacity-90 [font-family:var(--font-body),sans-serif]"
                aria-live="polite"
              >
                Well done
              </span>
              <Link
                href={startHref}
                className="absolute right-5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-2 text-sky-blue transition-colors hover:bg-sky-blue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3E7CC]"
                aria-label="Restart day"
                title="Restart day"
                {...movementPrefetchHandlers}
              >
                <IconRestartDay />
              </Link>
            </>
          ) : (
            <Link
              href={startHref}
              className="inline-flex min-w-[132px] items-center justify-center rounded-md bg-sky-blue px-8 py-2 text-base font-semibold text-white transition-opacity [font-family:var(--font-body),sans-serif] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
              {...movementPrefetchHandlers}
            >
              Start
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
