import { prisma } from "@/lib/prisma";
import DailyVerseForm from "./DailyVerseForm";
import { formatEntryDate } from "@/lib/journal";

export default async function AdminDailyVersePage() {
  const verses = await prisma.dailyVerse.findMany({
    orderBy: { verseDate: "desc" },
    take: 120,
  });

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]">
            Daily verses
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray">
            One row per calendar day. Shown on the schedule and via{" "}
            <code className="rounded border border-sand bg-white px-1.5 py-0.5 text-xs text-foreground">
              /api/daily-verse
            </code>
            .
          </p>
        </div>
        <DailyVerseForm />
      </header>
      <div className="space-y-3">
        {verses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-sand bg-white/80 p-8 text-center text-sm text-gray [font-family:var(--font-body),sans-serif]">
            No verses yet. Seed the database or add dates here.
          </p>
        ) : (
          verses.map((v) => (
            <div
              key={v.id}
              className="rounded-lg border border-sand bg-white px-4 py-3 shadow-[0_1px_2px_rgba(120,130,135,0.06)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                    {formatEntryDate(v.verseDate)} · {v.reference}
                    {v.translation ? ` (${v.translation})` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray [font-family:var(--font-body),sans-serif]">
                    {v.text}
                  </p>
                </div>
                <DailyVerseForm
                  verse={{
                    id: v.id,
                    verseDate: v.verseDate.toISOString(),
                    reference: v.reference,
                    text: v.text,
                    translation: v.translation,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
