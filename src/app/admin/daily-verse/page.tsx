import Link from "next/link";
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
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="text-sm font-medium text-sky-blue hover:underline dark:text-sky-blue"
          >
            ← CMS Admin
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
            Daily verses
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            One row per calendar day (UTC). Shown on the schedule and via{" "}
            <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">/api/daily-verse</code>.
          </p>
        </div>
        <DailyVerseForm />
      </div>
      <div className="mt-6 space-y-3">
        {verses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-500 dark:border-stone-600 dark:bg-stone-800/50 dark:text-stone-400">
            No verses yet. Seed the database or add dates here.
          </p>
        ) : (
          verses.map((v) => (
            <div
              key={v.id}
              className="rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    {formatEntryDate(v.verseDate)} · {v.reference}
                    {v.translation ? ` (${v.translation})` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">
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
