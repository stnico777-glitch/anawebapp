"use client";

import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import {
  MOVEMENT_SESSION_CHROME_FADE_MS,
  MOVEMENT_SESSION_INTRO_VIDEO_DELAY_MS,
  movementSessionChromeFadeDurationMs,
} from "@/lib/movement-session-transitions";
import { injectScheduleMovementVideoPreload } from "@/lib/schedule-movement-video-prefetch";
import ScheduleDayVideoPlayer from "./ScheduleDayVideoPlayer";

const DEFAULT_HEADLINE = "Hey, you made it.";
const DEFAULT_SUBTEXT =
  "You showed up for yourself today. When you're ready, we'll move together—gentle, steady, and yours.";

export default function ScheduleDayMovementSession({
  scheduleDayId,
  introHeadline,
  introSubtext,
  src,
  title,
}: {
  scheduleDayId: string;
  introHeadline: string | null;
  introSubtext: string | null;
  src: string;
  title: string;
}) {
  /** After tab hero chrome-out finishes, intro (“Hey, you made it”) fades in. */
  const [introEntered, setIntroEntered] = useState(false);
  const [started, setStarted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const fadeMs = movementSessionChromeFadeDurationMs(reducedMotion);
  const videoDelayMs = reducedMotion ? 0 : MOVEMENT_SESSION_INTRO_VIDEO_DELAY_MS;

  const headline = introHeadline?.trim() || DEFAULT_HEADLINE;
  const subtext = introSubtext?.trim() || DEFAULT_SUBTEXT;

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

  const onStart = useCallback(() => {
    setStarted(true);
  }, []);

  /** After intro is visible, hint the browser to fetch the MP4 early (hidden <video> can be deprioritized). */
  useEffect(() => {
    if (!introEntered || !src.trim()) return;
    injectScheduleMovementVideoPreload(src);
  }, [introEntered, src]);

  const introOpacity = introEntered && !started ? 1 : 0;

  const videoOpacity = started ? 1 : 0;
  const videoTransitionStyle: CSSProperties = {
    transitionProperty: "opacity",
    transitionDuration: reducedMotion ? "0ms" : `${fadeMs}ms`,
    transitionDelay: reducedMotion || !started ? "0ms" : `${videoDelayMs}ms`,
    opacity: videoOpacity,
  };

  return (
    <div
      className={
        started
          ? "relative flex min-h-0 w-full flex-1 flex-col items-center justify-start pt-1 pb-4 sm:pt-2 sm:pb-6"
          : "relative flex min-h-0 w-full flex-1 flex-col items-center justify-center py-4 sm:py-6"
      }
    >
      <div
        className={
          started
            ? "pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center"
            : "relative z-10 flex flex-col items-center justify-center"
        }
        style={{
          transitionProperty: "opacity",
          transitionDuration: reducedMotion ? "0ms" : `${fadeMs}ms`,
          opacity: introOpacity,
        }}
        aria-hidden={!introEntered || started}
      >
        <div className="relative w-full max-w-lg px-3 sm:max-w-xl sm:px-4">
          <div
            className={`movement-schedule-intro-surface relative overflow-hidden rounded-[1.75rem] border-2 border-[#ebd4cc]/90 p-8 shadow-[0_6px_24px_rgba(120,130,135,0.06),0_0_28px_rgba(255,210,200,0.28),0_0_44px_rgba(255,220,210,0.2),0_10px_32px_rgba(255,200,188,0.1)] sm:rounded-[2rem] sm:p-10 ${
              introEntered && !reducedMotion ? "animate-movement-schedule-intro" : ""
            }`}
          >
            <div className="relative flex flex-col items-center text-center">
              <div
                className="mb-5 h-1 w-16 rounded-full bg-gradient-to-r from-sky-blue via-[#b8daf2] to-[#ffd4c4] shadow-[0_1px_8px_rgba(110,173,228,0.22)] ring-1 ring-white/50"
                aria-hidden
              />
              <span className="inline-flex items-center rounded-full border border-sky-blue/25 bg-white/60 px-3.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gray [font-family:var(--font-body),sans-serif]">
                Movement
              </span>
              <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight text-gray sm:text-3xl md:text-[1.75rem] [font-family:var(--font-headline),sans-serif]">
                {headline}
              </h2>
              <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
                {subtext}
              </p>
              <button
                type="button"
                onClick={onStart}
                disabled={!introEntered}
                className="group relative mt-10 inline-flex min-h-[3rem] min-w-[11rem] items-center justify-center overflow-hidden rounded-xl bg-sky-blue px-9 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(110,173,228,0.35)] transition-[transform,box-shadow,opacity] duration-200 hover:shadow-[0_8px_28px_rgba(110,173,228,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffef6] active:scale-[0.98] disabled:opacity-0 motion-safe:hover:-translate-y-0.5 [font-family:var(--font-body),sans-serif]"
              >
                <span className="relative z-10">Start moving</span>
                <span
                  className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-white/0 to-white/15 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={
          started
            ? "relative z-10 mx-auto w-full max-w-3xl px-1 sm:px-0"
            : "pointer-events-none absolute inset-0 z-0 overflow-hidden"
        }
        style={videoTransitionStyle}
        aria-hidden={!started}
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
