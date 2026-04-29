"use client";

import { useCallback, useRef } from "react";

export default function KatLetterDetails() {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  const handleToggle = useCallback(() => {
    const el = detailsRef.current;
    if (!el?.open) return;
    // Wait for layout to expand, then scroll to the letter.
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <details
      ref={detailsRef}
      className="group mt-4 text-center [font-family:var(--font-body),sans-serif]"
      onToggle={handleToggle}
    >
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-sky-blue/30 bg-white px-4 py-2 text-sm font-semibold text-sky-blue shadow-[0_1px_2px_rgba(120,130,135,0.06)] transition hover:border-sky-blue/50 hover:bg-sky-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden marker:content-none">
        <span className="group-open:hidden">Read Kat&rsquo;s letter</span>
        <span className="hidden group-open:inline">Hide letter</span>
        <svg
          className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-open:rotate-180 motion-reduce:transition-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className="mx-auto mt-6 max-w-2xl space-y-3 text-left text-sm leading-relaxed text-gray motion-safe:animate-[fade-in-up_220ms_ease-out_both] motion-reduce:animate-none">
        <p>
          I created Awake + Align out of obedience in my heart to help women grow closer to God—both spiritually
          and physically.
        </p>
        <p>
          I grew up as a Christian, and Jesus and movement have always been central to my life. After moving to
          Miami, I found myself getting caught up in the pull of the world and drifting from what I knew was true.
          When Jesus restored my life, everything shifted.
        </p>
        <p>
          From that moment, I made it my mission to create spaces where women could encounter God through movement,
          worship, and community. I started in Miami hosting packed rooftop events with hundreds of girls and
          quickly realized this wasn&rsquo;t just needed in person, but online as well.
        </p>
        <p>
          As I stepped into Pilates and movement culture, I noticed much of it leaned into New Age
          practices—meditations focused on the universe instead of Jesus, the true source of transformation in my
          life and the foundation of everything I now build my life on.
        </p>
        <p>
          After rededicating my life to Christ, I fully surrendered every area of my life to Jesus. As I replaced
          old habits with worship, prayer, and intentional rhythm, I began to see my body and life differently and
          learned to love my vessel the way God created it.
        </p>
        <p>
          This app was created to help women find wholeness and confidence in their God-given identity. It takes
          the guesswork out of searching everywhere and gives practical, faith-based tools in one place. Through
          daily verses, movement, and scripture-based meditations, it helps you build a consistent rhythm—physically
          and spiritually—and pour into every area of your life.
        </p>
        <p>
          I love you and I pray over you and this community daily. My hope is that this app helps you understand
          and embody power, love, and a sound mind. (2 Timothy 1:7)
        </p>
        <p className="pt-2 text-center text-base italic text-foreground [font-family:var(--font-headline),sans-serif]">
          Love, Kat
        </p>
      </div>
    </details>
  );
}

