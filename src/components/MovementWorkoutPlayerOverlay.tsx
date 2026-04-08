"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import WorkoutPlayer from "@/app/(app)/(main-tabs)/movement/[id]/WorkoutPlayer";
import type { WorkoutRailCardWorkout } from "@/lib/workout-rail-display";

export default function MovementWorkoutPlayerOverlay({
  workout,
  isCompleted,
  onClose,
}: {
  workout: WorkoutRailCardWorkout;
  isCompleted: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  const node = (
    <div
      className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-app-surface"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movement-overlay-workout-title"
    >
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 md:py-8">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 inline-flex items-center text-sm text-gray transition hover:text-foreground [font-family:var(--font-body),sans-serif]"
        >
          ← Back to Movement
        </button>
        <h1
          id="movement-overlay-workout-title"
          className="text-2xl font-medium text-foreground [font-family:var(--font-headline),sans-serif]"
        >
          {workout.title}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray">
          {workout.category && (
            <span className="rounded-sm bg-sand px-1.5 py-0.5">{workout.category}</span>
          )}
          <span>{workout.duration} min</span>
          {isCompleted && <span className="text-sky-blue">✓ Completed</span>}
        </div>
        {workout.scripture && (
          <p className="mt-2 text-sm italic text-gray [font-family:var(--font-body),sans-serif]">
            {workout.scripture}
          </p>
        )}
        <div className="mt-6 movement-overlay-player-fade">
          <WorkoutPlayer
            key={workout.id}
            workoutId={workout.id}
            src={workout.videoUrl}
            title={workout.title}
            isCompleted={isCompleted}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="movement-overlay-player-fade movement-overlay-player-fade-delay mt-8 w-full rounded-sm bg-sky-blue py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-sky-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface [font-family:var(--font-body),sans-serif]"
        >
          Finish
        </button>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
