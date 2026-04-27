"use client";

import { useEffect, useRef, useState } from "react";

const MARQUEE_ITEMS = [
  "Start your 7-day free trial",
  "✦",
  "“Power, love and a sound mind” — 2 Timothy 1:7",
  "✦",
  "awake + align — Pilates, prayer & community",
];

/**
 * Marketing marquee on the public home page. Intentionally **not** a real trial
 * gate — actual membership/trial enforcement happens on the server via
 * `getSessionForApp().isSubscriber` and the `requireMemberFromRequest` helper
 * for write endpoints. Don't repurpose this banner for entitlement logic.
 */
export default function TrialBanner() {
  const rootRef = useRef<HTMLDivElement>(null);
  /** Assume visible for first paint; IO updates to pause when scrolled away. */
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative z-20 flex h-9 w-full items-center overflow-hidden bg-gray text-background [font-family:var(--font-body),sans-serif]"
      role="region"
      aria-label="Free trial offer"
    >
      <div
        className={`animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap ${
          inView ? "" : "trial-banner-marquee-paused"
        }`}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className={
              item === "✦"
                ? "text-accent-amber"
                : item === "awake + align — Pilates, prayer & community" || item.startsWith("“Power,")
                  ? "text-xs font-medium tracking-wide md:text-sm [font-family:var(--font-headline),sans-serif] italic"
                  : "text-xs font-medium tracking-wide md:text-sm [font-family:var(--font-body),sans-serif]"
            }
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
