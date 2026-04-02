"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DAY_NAMES, WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";
import LockIcon from "@/components/LockIcon";

const WEEKLY_IMAGES = ["/weekly-workouts.png", "/weekly-workouts2.png", "/weekly-workouts3.png"];

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

function IconPrayer() {
  return (
    <svg className="h-4 w-4 shrink-0 text-gray" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M8 6h8l-3 5 3 5H8l3-5-3-5z" />
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
  const isComplete = done === total;

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
  const workoutHref = day.workoutId ? `/workouts/${day.workoutId}` : "/workouts";

  return (
    <article
      className={`relative overflow-hidden rounded-none border transition-all duration-300 ease-out will-change-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        isComplete ? "border-sky-blue bg-app-surface" : "border-sand bg-white"
      } ${isToday ? "ring-2 ring-sky-blue ring-offset-2 ring-offset-app-surface" : ""}`}
    >
      {isToday && (
        <span className="absolute right-3 top-3 z-10 rounded-sm bg-sky-blue px-2 py-0.5 text-xs font-medium text-white">
          Today
        </span>
      )}
      {isLocked && (
        <span className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-sm bg-white/95 shadow ring-1 ring-sand" title="Subscribe to unlock">
          <LockIcon size="sm" />
        </span>
      )}

      <div className="relative aspect-[16/10] min-h-[7.5rem] overflow-hidden bg-sand sm:min-h-[8rem]">
        <Image
          src={WEEKLY_DAY_CARD_IMAGES[day.dayIndex % WEEKLY_DAY_CARD_IMAGES.length]}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 from-40% to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-3 md:p-3.5">
          <h3 className="text-base font-semibold tracking-tight text-white [font-family:var(--font-headline),sans-serif] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            {DAY_NAMES[day.dayIndex] ?? ""}
          </h3>
        </div>
      </div>

      <div className="p-4 [font-family:var(--font-body),sans-serif]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium tracking-wide text-gray">
            {done}/{total} complete
          </span>
          <div className="h-1.5 w-14 overflow-hidden rounded-sm bg-sand">
            <div
              className="h-full bg-sky-blue transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggle("prayer")}
              disabled={loading}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-2 transition-colors ${
                prayerDone ? "border-sky-blue bg-background" : "border-sand hover:bg-background"
              }`}
              aria-pressed={prayerDone}
            >
              {prayerDone ? <span className="text-sm text-sky-blue">✓</span> : null}
            </button>
            <Link
              href={prayerHref}
              className="min-w-0 flex-1 text-sm text-foreground hover:text-sky-blue hover:underline"
            >
              {day.prayerTitle ?? "Prayer"}
            </Link>
            <IconPrayer />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggle("workout")}
              disabled={loading}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-2 transition-colors ${
                workoutDone ? "border-sky-blue bg-app-surface" : "border-sand hover:bg-app-surface"
              }`}
              aria-pressed={workoutDone}
            >
              {workoutDone ? <span className="text-sm text-sky-blue">✓</span> : null}
            </button>
            <Link
              href={workoutHref}
              className="min-w-0 flex-1 text-sm text-foreground hover:text-sky-blue hover:underline"
            >
              {day.workoutTitle ?? "Workout"}
            </Link>
            <IconWorkout />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggle("affirmation")}
              disabled={loading}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-2 transition-colors ${
                affirmationDone ? "border-sky-blue bg-app-surface" : "border-sand hover:bg-app-surface"
              }`}
              aria-pressed={affirmationDone}
            >
              {affirmationDone ? <span className="text-sm text-sky-blue">✓</span> : null}
            </button>
            <span className="min-w-0 flex-1 text-sm italic text-gray">
              {day.affirmationText ?? "Affirmation"}
            </span>
            <IconAffirmation />
          </div>
        </div>
      </div>
    </article>
  );
}
