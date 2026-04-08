"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/**
 * Hero wordmark: cream + subtle stroke on video. Use `var(--font-poppins)` so glyphs
 * match the loaded Poppins file. Subtitle is a touch heavier and tucked under the main line.
 */
const wordmarkBase =
  "text-background [font-family:var(--font-poppins),sans-serif] lowercase [font-synthesis:none] [paint-order:stroke_fill]";

const wordmarkMainClass = `${wordmarkBase} font-normal [-webkit-text-stroke:0.45px_rgba(0,0,0,0.32)]`;

const wordmarkSubClass = `${wordmarkBase} font-medium [-webkit-text-stroke:0.52px_rgba(0,0,0,0.34)]`;

export default function HeroTitle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <h1
        className={`flex justify-center transition-opacity duration-[2.2s] ease-out ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="flex max-w-[min(100%,42rem)] flex-col items-center gap-1 md:gap-1.5">
          <span
            className={`${wordmarkMainClass} block text-center leading-none tracking-[0.2em] text-[clamp(2.35rem,9.75dvh,5.85rem)] md:tracking-[0.24em]`}
          >
            awake+align
          </span>
          <span
            className={`${wordmarkSubClass} mt-0.5 block text-center leading-tight tracking-[0.32em] text-[clamp(0.64rem,2.4dvh,1.38rem)] md:tracking-[0.42em] md:text-[clamp(0.74rem,2.55dvh,1.45rem)]`}
          >
            power love sound mind
          </span>
        </span>
      </h1>
      <div
        className={`mt-16 flex justify-center transition-all duration-[2.2s] ease-out md:mt-20 lg:mt-24 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDelay: "2400ms" }}
      >
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-sm border border-background/85 px-4 py-2 text-sm font-medium text-background [font-family:var(--font-poppins),sans-serif] transition duration-200 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.03] hover:bg-background/12 motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-background/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/25 md:px-5 md:py-2.5 md:text-base"
        >
          Join the Movement
        </Link>
      </div>
    </>
  );
}
