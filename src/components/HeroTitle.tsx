"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const TITLE = "awake + align";
const TAGLINE_WORDS = ["power", "love", "sound mind"];

export default function HeroTitle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <h1
        className={`max-w-4xl text-4xl font-light tracking-tight text-white drop-shadow-md transition-all duration-[2.2s] ease-out md:text-5xl lg:text-6xl [font-family:var(--font-headline),sans-serif] ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {TITLE}
      </h1>
      <p
        className={`mt-3 text-base text-white/90 transition-all duration-[2.2s] ease-out md:text-lg ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
        style={{ transitionDelay: "400ms" }}
      >
        {TAGLINE_WORDS.map((w, idx) => (
          <span key={w} className="inline-flex items-center">
            <span>{w}</span>
            {idx < TAGLINE_WORDS.length - 1 ? (
              <span className="mx-2 inline-block translate-y-[-1px] text-white/70">•</span>
            ) : null}
          </span>
        ))}
      </p>
      <div
        className={`mt-16 flex justify-center transition-all duration-[2.2s] ease-out ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDelay: "2400ms" }}
      >
        <Link
          href="/login"
          className="rounded-sm border border-white/80 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
        >
          Join the Movement
        </Link>
      </div>
    </>
  );
}
