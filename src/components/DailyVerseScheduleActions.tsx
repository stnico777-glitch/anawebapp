"use client";

interface Props {
  reference: string;
  text: string;
  translation: string | null;
}

export default function DailyVerseScheduleActions({
  reference,
  text,
  translation,
}: Props) {
  const full = translation
    ? `"${text}" — ${reference} (${translation})`
    : `"${text}" — ${reference}`;

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Verse of the day — ${reference}`,
          text: full,
          url,
        });
      } else {
        await navigator.clipboard.writeText(`${full}\n${url}`);
      }
    } catch {
      /* user cancelled or clipboard blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="text-sm font-medium text-sky-blue underline-offset-4 hover:underline"
    >
      Share
    </button>
  );
}
