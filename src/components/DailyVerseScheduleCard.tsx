import Link from "next/link";
import type { DailyVerse } from "@prisma/client";

export default function DailyVerseScheduleCard({
  verse,
  encouragementHref,
}: {
  verse: DailyVerse | null;
  /** Today's schedule-day encouragement viewer. Hidden when unavailable (guest / no schedule). */
  encouragementHref?: string | null;
}) {
  /** Parity: ScheduleScreen verseCard — same gradient as day-card body (#FFF6E6 → #F3E7CC, diagonal). */
  const verseCardShell =
    "relative mb-10 overflow-hidden rounded-lg border border-sand px-4 py-4 shadow-[0_1px_2px_rgba(120,130,135,0.06)] [font-family:var(--font-body),sans-serif] md:mb-12 md:px-5 md:py-5";
  const verseCardGradient = { backgroundImage: "linear-gradient(135deg, #FFF6E6 0%, #F3E7CC 100%)" } as const;

  if (!verse) {
    return (
      <div className={verseCardShell} style={verseCardGradient}>
        <p className="text-sm text-gray">
          Today&apos;s scripture will appear here once your team adds verses in the admin.
        </p>
      </div>
    );
  }

  return (
    <div className={verseCardShell} style={verseCardGradient}>
      <p className="text-xs uppercase tracking-[0.14em] text-gray/90">Verse of the day</p>
      <h2 className="mt-2 text-lg font-semibold text-sky-blue [font-family:var(--font-headline),sans-serif]">
        {verse.reference}
        {verse.translation ? (
          <span className="text-sm font-normal"> · {verse.translation}</span>
        ) : null}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-gray md:text-base line-clamp-4 md:line-clamp-none">
        {verse.text}
      </p>
      {encouragementHref ? (
        <div className="mt-4 flex justify-center">
          <Link
            href={encouragementHref}
            className="group inline-flex items-center gap-2 rounded-full bg-background px-3.5 py-1.5 text-sm font-semibold text-sky-blue shadow-[0_1px_2px_rgba(120,130,135,0.08)] transition-[transform,box-shadow,background-color] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:bg-background/90 hover:shadow-[0_6px_18px_rgba(120,130,135,0.18)] active:translate-y-0 active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF6E6] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
            aria-label="Play today's encouragement"
          >
            <span>Encouragement</span>
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-blue text-white shadow-sm transition-transform duration-200 ease-out motion-safe:group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              aria-hidden
            >
              <svg className="h-3 w-3 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
