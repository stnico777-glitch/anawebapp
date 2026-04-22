"use client";

import { useLayoutEffect, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import HeroBrandOverlay from "@/components/HeroBrandOverlay";
import HeroVideo from "@/components/HeroVideo";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { movementSessionChromeFadeDurationMs } from "@/lib/movement-session-transitions";

function ariaLabelForPath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "CMS — edit content";
  if (pathname.startsWith("/movement")) return "Movement";
  if (pathname.startsWith("/prayer")) return "Audio";
  if (pathname.startsWith("/journaling")) return "Prayer journal";
  if (pathname.startsWith("/more")) return "More";
  if (pathname.startsWith("/schedule")) return "Schedule";
  return "awake + align";
}

/**
 * Shared short hero for main app tabs. Lives in `(main-tabs)/layout` so the video
 * element stays mounted across client navigations between Schedule · Movement · Audio · Journal.
 */
function creamWordmarkForPath(pathname: string): boolean {
  return (
    pathname.startsWith("/movement") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/prayer") ||
    pathname.startsWith("/journaling") ||
    pathname.startsWith("/more")
  );
}

export default function AppTabHeroBand() {
  const pathname = usePathname() ?? "";
  const creamWordmark = creamWordmarkForPath(pathname);
  /** Collapses the hero band on every schedule-day session (movement + encouragement).
   *  Keeps the video centered in the viewport instead of pushed below a 140 px band. */
  const isScheduleDaySession =
    pathname.startsWith("/movement/schedule-day/") ||
    pathname.startsWith("/schedule/movement/") ||
    pathname.startsWith("/schedule/encouragement/");
  const reducedMotion = usePrefersReducedMotion();
  const fadeMs = movementSessionChromeFadeDurationMs(reducedMotion);

  /** Start expanded so the hero paints once, then transition out on schedule-day movement session. */
  const [shouldHideChrome, setShouldHideChrome] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- two-phase paint: hero visible one frame, then chrome-out */
  useLayoutEffect(() => {
    if (!isScheduleDaySession) {
      setShouldHideChrome(false);
      return;
    }
    if (reducedMotion) {
      setShouldHideChrome(true);
      return;
    }
    let cancelled = false;
    let innerRaf: number | undefined;
    const outerRaf = requestAnimationFrame(() => {
      if (cancelled) return;
      innerRaf = requestAnimationFrame(() => {
        if (!cancelled) setShouldHideChrome(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(outerRaf);
      if (innerRaf !== undefined) cancelAnimationFrame(innerRaf);
    };
  }, [isScheduleDaySession, reducedMotion]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const hideChrome = isScheduleDaySession && shouldHideChrome;

  const sectionStyle: CSSProperties = {
    transitionProperty:
      isScheduleDaySession && !reducedMotion ? "opacity, max-height, min-height" : "none",
    transitionDuration: isScheduleDaySession && !reducedMotion ? `${fadeMs}ms` : "0ms",
    transitionTimingFunction: "ease",
    opacity: hideChrome ? 0 : 1,
    maxHeight: hideChrome ? 0 : "min(28vh, 300px)",
    minHeight: hideChrome ? 0 : "140px",
    pointerEvents: hideChrome ? "none" : undefined,
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={sectionStyle}
      aria-label={ariaLabelForPath(pathname)}
      aria-hidden={hideChrome}
    >
      <div className="absolute left-0 right-0 top-0 z-20 h-1 bg-sky-blue" aria-hidden />
      <HeroVideo objectPosition="upper" sourceTier="appTabs" />
      {/* Clear at top; smooth linear fade to cream by 90%; bottom 10% solid at fold.
          Explicit cream at 0 alpha (matches `--background` #FFFCE9) + okLab interpolation — avoids muddy sRGB ramps. */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to bottom in oklab, rgba(255, 252, 233, 0) 0%, var(--background) 90%, var(--background) 100%)",
        }}
        aria-hidden
      />
      <HeroBrandOverlay textColor={creamWordmark ? "cream" : "white"} />
    </section>
  );
}
