"use client";

import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import {
  MOVEMENT_SESSION_CHROME_FADE_MS,
  MOVEMENT_SESSION_INTRO_VIDEO_DELAY_MS,
  movementSessionChromeFadeDurationMs,
} from "@/lib/movement-session-transitions";
import { injectScheduleMovementVideoPreload } from "@/lib/schedule-movement-video-prefetch";
import VideoPlayer from "@/components/VideoPlayer";
import ScheduleDayVideoPlayer from "./ScheduleDayVideoPlayer";

export default function ScheduleDayMovementSession({
  scheduleDayId,
  encouragementSrc,
  encouragementPoster,
  src,
  title,
}: {
  scheduleDayId: string;
  encouragementSrc: string;
  encouragementPoster?: string;
  src: string;
  title: string;
}) {
  /** After tab hero chrome-out finishes, encouragement step fades in. */
  const [introEntered, setIntroEntered] = useState(false);
  const [step, setStep] = useState<"encouragement" | "workout">("encouragement");
  const reducedMotion = usePrefersReducedMotion();
  const fadeMs = movementSessionChromeFadeDurationMs(reducedMotion);
  const videoDelayMs = reducedMotion ? 0 : MOVEMENT_SESSION_INTRO_VIDEO_DELAY_MS;

  /* eslint-disable react-hooks/set-state-in-effect -- intro after tab hero chrome-out (sync with AppTabHeroBand) */
  useLayoutEffect(() => {
    if (reducedMotion) {
      setIntroEntered(true);
      return;
    }
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let innerRaf: number | undefined;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        if (cancelled) return;
        timeoutId = setTimeout(() => {
          if (!cancelled) setIntroEntered(true);
        }, MOVEMENT_SESSION_CHROME_FADE_MS);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(outerRaf);
      if (innerRaf !== undefined) cancelAnimationFrame(innerRaf);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [reducedMotion]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const onNextToWorkout = useCallback(() => {
    setStep("workout");
  }, []);

  /** Encouragement video: high priority, fires as soon as the intro chrome lands. */
  useEffect(() => {
    if (!introEntered || !encouragementSrc.trim()) return;
    injectScheduleMovementVideoPreload(encouragementSrc, { priority: "high" });
  }, [introEntered, encouragementSrc]);

  /** Workout video: low priority + 1.5s delay so the encouragement gets clean
   *  bandwidth to start playing first. Once it's rolling, the workout quietly
   *  fills the buffer in the background — so by the time the user taps Next
   *  after the encouragement, the workout is ready to play instantly. */
  useEffect(() => {
    if (!introEntered || !src.trim()) return;
    const timeoutId = setTimeout(() => {
      injectScheduleMovementVideoPreload(src, { priority: "low" });
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [introEntered, src]);

  const encouragementOpacity = introEntered && step === "encouragement" ? 1 : 0;
  const workoutOpacity = step === "workout" ? 1 : 0;

  const workoutTransitionStyle: CSSProperties = {
    transitionProperty: "opacity",
    transitionDuration: reducedMotion ? "0ms" : `${fadeMs}ms`,
    transitionDelay: reducedMotion || step !== "workout" ? "0ms" : `${videoDelayMs}ms`,
    opacity: workoutOpacity,
  };

  const encouragementTransitionStyle: CSSProperties = {
    transitionProperty: "opacity",
    transitionDuration: reducedMotion ? "0ms" : `${fadeMs}ms`,
    opacity: encouragementOpacity,
  };

  const outerClass =
    step === "workout"
      ? "relative flex min-h-0 w-full flex-1 flex-col items-center justify-start pt-1 pb-4 sm:pt-2 sm:pb-6"
      : "relative flex min-h-0 w-full flex-1 flex-col items-center justify-center py-4 sm:py-6";

  return (
    <div className={outerClass}>
      <div
        className={
          step === "workout"
            ? "pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center overflow-hidden"
            : "relative z-10 flex w-full flex-col items-center justify-center px-1 sm:px-0"
        }
        style={{
          ...encouragementTransitionStyle,
        }}
        aria-hidden={!introEntered || step === "workout"}
      >
        {step === "encouragement" ? (
          <div className="relative w-full max-w-3xl">
            <h2 className="mb-3 w-full text-center text-xl font-semibold tracking-tight text-gray md:text-2xl [font-family:var(--font-headline),sans-serif]">
              Encouragement
            </h2>
            <VideoPlayer
              src={encouragementSrc}
              poster={encouragementPoster}
              title="Encouragement"
              fetchPriority={introEntered ? "high" : "auto"}
            />
            <div className="mt-6 flex justify-center sm:mt-7">
              <button
                type="button"
                onClick={onNextToWorkout}
                disabled={!introEntered}
                className="group relative inline-flex min-h-[3rem] min-w-[11rem] items-center justify-center overflow-hidden rounded-xl bg-sky-blue px-9 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(110,173,228,0.35)] transition-[transform,box-shadow,opacity] duration-200 hover:shadow-[0_8px_28px_rgba(110,173,228,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface active:scale-[0.98] disabled:opacity-0 motion-safe:hover:-translate-y-0.5 [font-family:var(--font-body),sans-serif]"
              >
                <span className="relative z-10">Next</span>
                <span
                  className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-white/0 to-white/15 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={
          step === "workout"
            ? "relative z-10 mx-auto w-full max-w-3xl px-1 sm:px-0"
            : "pointer-events-none absolute inset-0 z-0 overflow-hidden"
        }
        style={workoutTransitionStyle}
        aria-hidden={step !== "workout"}
      >
        <h1 className="mb-4 w-full text-center text-2xl font-semibold tracking-tight text-gray md:text-3xl [font-family:var(--font-headline),sans-serif]">
          {title}
        </h1>
        <ScheduleDayVideoPlayer
          scheduleDayId={scheduleDayId}
          src={src}
          title={title}
          fetchPriority={introEntered ? "high" : "auto"}
        />
      </div>
    </div>
  );
}
