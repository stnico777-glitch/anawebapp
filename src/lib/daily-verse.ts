import type { DailyVerse } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { toEntryDate } from "@/lib/journal";

/**
 * Verse rows use UTC midnight for the calendar day (same convention as journal entry dates).
 * Uses `getPrisma()` (not the `prisma` proxy) so delegates like `dailyVerse` always resolve in RSC/Turbopack.
 */
export async function getDailyVerseForDateInput(
  dateInput: string | undefined,
): Promise<DailyVerse | null> {
  const raw =
    dateInput && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? new Date(`${dateInput}T12:00:00.000Z`)
      : new Date();
  const verseDate = toEntryDate(raw);
  try {
    const db = getPrisma();
    return await db.dailyVerse.findUnique({ where: { verseDate } });
  } catch {
    return null;
  }
}
