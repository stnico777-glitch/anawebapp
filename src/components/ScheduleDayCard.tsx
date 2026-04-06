"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DAY_NAMES, WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";
import LockIcon from "@/components/LockIcon";

interface ScheduleDayCardProps {
  day: {
    id: string;
    dayIndex: number;
    prayerTitle: string | null;
    workoutTitle: string | null;
    affirmationText: string | null;
    prayerId?: string | null;
    workoutId?: string | null;
    completion: {
      prayerDone: boolean;
      workoutDone: boolean;
      affirmationDone: boolean;
    } | null;
  };
  isToday?: boolean;
  /** When true, show lock icon (content gated for non-subscribers). */
  isLocked?: boolean;
}

/** Prayer row — single four-point sparkle (main star from Heroicons sparkles; avoids busy multi-sparkle cluster). */
function IconPrayer() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
      />
    </svg>
  );
}
function IconWorkout() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}
function IconAffirmation() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

export default function ScheduleDayCard({ day, isToday = false, isLocked = false }: ScheduleDayCardProps) {
  const [prayerDone, setPrayerDone] = useState(day.completion?.prayerDone ?? false);
  const [workoutDone, setWorkoutDone] = useState(day.completion?.workoutDone ?? false);
  const [affirmationDone, setAffirmationDone] = useState(
    day.completion?.affirmationDone ?? false
  );
  const [loading, setLoading] = useState(false);

  const total = 3;
  const done = (prayerDone ? 1 : 0) + (workoutDone ? 1 : 0) + (affirmationDone ? 1 : 0);
  const progress = Math.round((done / total) * 100);

  async function toggle(type: "prayer" | "workout" | "affirmation") {
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

  const prayerHref = "/prayer";
  const workoutHref = day.workoutId ? `/movement/${day.workoutId}` : "/movement";

  const allDone = done === total;
  let startHref = "/schedule";
  if (!prayerDone) startHref = prayerHref;
  else if (!workoutDone) startHref = workoutHref;
  else if (!affirmationDone) startHref = "/journaling";

  return (
    <article
      className={`relative overflow-hidden rounded-lg bg-app-surface shadow-[0_1px_2px_rgba(120,130,135,0.06)] transition-all duration-300 ease-out will-change-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        isToday ? "border-2 border-sky-blue" : "border border-sand"
      }`}
    >
      {isToday && (
        <span className="absolute right-2 top-2 z-10 rounded-sm bg-sky-blue px-2 py-1 text-xs font-semibold text-white [font-family:var(--font-body),sans-serif]">
          Today
        </span>
      )}
      {isLocked && (
        <span className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 shadow backdrop-blur-[2px]" title="Subscribe to unlock">
          <LockIcon size="sm" className="text-white" />
        </span>
      )}

      <div className="relative aspect-[16/13] min-h-[11rem] overflow-hidden bg-sand sm:min-h-[13rem] md:aspect-[16/14] md:min-h-[14rem]">
        <Image
          src={WEEKLY_DAY_CARD_IMAGES[day.dayIndex % WEEKLY_DAY_CARD_IMAGES.length]}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
          className="object-cover object-center"
        />
        {/* Parity: ScheduleScreen dayImageShade — uniform 20% black */}
        <div className="absolute inset-0 bg-black/20" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-2">
          <h3 className="text-lg font-semibold tracking-tight text-white [font-family:var(--font-headline),sans-serif]">
            {DAY_NAMES[day.dayIndex] ?? ""}
          </h3>
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
              className="h-full bg-accent-amber transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggle("prayer")}
              disabled={loading}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                prayerDone ? "border-sky-blue bg-sky-blue" : "border-sand bg-background hover:bg-background/90"
              }`}
              aria-pressed={prayerDone}
            >
              {prayerDone ? <span className="text-[11px] leading-none text-white">✓</span> : null}
            </button>
            <Link
              href={prayerHref}
              className="min-w-0 flex-1 text-sm text-gray hover:text-sky-blue hover:underline"
            >
              {day.prayerTitle ?? "Prayer"}
            </Link>
            <IconPrayer />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggle("workout")}
              disabled={loading}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                workoutDone ? "border-sky-blue bg-sky-blue" : "border-sand bg-background hover:bg-background/90"
              }`}
              aria-pressed={workoutDone}
            >
              {workoutDone ? <span className="text-[11px] leading-none text-white">✓</span> : null}
            </button>
            <Link
              href={workoutHref}
              className="min-w-0 flex-1 text-sm text-gray hover:text-sky-blue hover:underline"
            >
              {day.workoutTitle ?? "Movement"}
            </Link>
            <IconWorkout />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggle("affirmation")}
              disabled={loading}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                affirmationDone ? "border-sky-blue bg-sky-blue" : "border-sand bg-background hover:bg-background/90"
              }`}
              aria-pressed={affirmationDone}
            >
              {affirmationDone ? <span className="text-[11px] leading-none text-white">✓</span> : null}
            </button>
            <span className="min-w-0 flex-1 text-sm italic text-gray">
              {day.affirmationText ?? "Affirmation"}
            </span>
            <IconAffirmation />
          </div>
        </div>

        <div className="mt-1 flex min-h-[52px] items-center justify-center">
          {allDone ? (
            <span
              className="inline-flex min-w-[132px] cursor-default items-center justify-center rounded-md bg-sky-blue px-8 py-2 text-base font-semibold text-white opacity-90 [font-family:var(--font-body),sans-serif]"
              aria-live="polite"
            >
              Well done
            </span>
          ) : (
            <Link
              href={startHref}
              className="inline-flex min-w-[132px] items-center justify-center rounded-md bg-sky-blue px-8 py-2 text-base font-semibold text-white transition-opacity [font-family:var(--font-body),sans-serif] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
            >
              Start
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
