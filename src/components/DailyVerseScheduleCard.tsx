import Link from "next/link";
import type { DailyVerse } from "@prisma/client";
import DailyVerseScheduleActions from "./DailyVerseScheduleActions";

export default function DailyVerseScheduleCard({
  verse,
}: {
  verse: DailyVerse | null;
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

  const journalLinkSrc = verse.text.length > 1800 ? `${verse.text.slice(0, 1800)}…` : verse.text;
  const journalLink = `/journaling?verseRef=${encodeURIComponent(verse.reference)}&verseText=${encodeURIComponent(journalLinkSrc)}`;

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
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <DailyVerseScheduleActions
          reference={verse.reference}
          text={verse.text}
          translation={verse.translation}
        />
        <Link
          href={journalLink}
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Pray with this
        </Link>
      </div>
    </div>
  );
}
