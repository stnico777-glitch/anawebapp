"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const JOURNAL_MS = 1350;
const JOURNAL_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const DEFAULT_MS = 2250;
const DEFAULT_EASE = "cubic-bezier(0.18, 0, 0.08, 1)";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Tab body fade: only the inner layer changes opacity. Outer stays solid `bg-app-surface` so we never
 * “see through” to the black hero video band or other layers (that read as a black flash).
 * Fade runs on pathname only — not on `children` — so Suspense loading→page does not run a second
 * opacity-0 dip (which re-triggered the flash).
 */
export default function MainTabsTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isJournal = pathname.startsWith("/journaling");
  const durationMs = isJournal ? JOURNAL_MS : DEFAULT_MS;
  const easing = isJournal ? JOURNAL_EASE : DEFAULT_EASE;
  const reducedMotion = usePrefersReducedMotion();

  const [opacity, setOpacity] = useState(1);
  const prevPathRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (reducedMotion) {
      setOpacity(1);
      return;
    }
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }
    if (prevPathRef.current === pathname) {
      return;
    }
    prevPathRef.current = pathname;
    setOpacity(0);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpacity(1));
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, reducedMotion]);

  return (
    <div className="w-full min-h-0 bg-app-surface">
      <div
        className="min-h-0 motion-reduce:transition-none"
        style={
          reducedMotion
            ? { opacity: 1 }
            : {
                opacity,
                transition: `opacity ${durationMs}ms ${easing}`,
                willChange: opacity === 0 ? "opacity" : "auto",
              }
        }
      >
        {children}
      </div>
    </div>
  );
}
