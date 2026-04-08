import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DAY_NAMES } from "@/constants/schedule";
import {
  addDaysUtc,
  getMonday,
  utcMondayMidnightForInstant,
  weekScheduleAnchorKey,
  weekScheduleAnchorKeyUTC,
} from "@/lib/weekScheduleCalendar";

export { formatWeekRange } from "@/lib/dateFormat";
export { getMonday, weekScheduleAnchorKey } from "@/lib/weekScheduleCalendar";

/**
 * Removes extra `WeekSchedule` rows that share the same Monday anchor (keeps oldest `createdAt`).
 * Run from seed or one-off maintenance so only one row exists per week.
 */
export async function dedupeWeekSchedulesByWeekStart(db: PrismaClient): Promise<number> {
  const all = await db.weekSchedule.findMany({ orderBy: { createdAt: "asc" } });
  const kept = new Set<string>();
  let removed = 0;
  for (const w of all) {
    const key = weekScheduleAnchorKeyUTC(w.weekStart);
    if (kept.has(key)) {
      await db.weekSchedule.delete({ where: { id: w.id } });
      removed++;
    } else {
      kept.add(key);
    }
  }
  return removed;
}

export function getDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex] ?? "";
}

export async function getWeekScheduleForMonday(
  anchorDate: Date,
  userId?: string
) {
  const thisMonday = utcMondayMidnightForInstant(anchorDate);
  const nextMonday = addDaysUtc(thisMonday, 7);
  try {
    const week = await prisma.weekSchedule.findFirst({
      where: {
        weekStart: {
          gte: thisMonday,
          lt: nextMonday,
        },
      },
      include: {
        days: {
          orderBy: { dayIndex: "asc" },
          include: {
            workout: { select: { videoUrl: true } },
            ...(userId ? { completions: { where: { userId }, take: 1 } } : {}),
          },
        },
      },
    });

    if (!week) return null;

    return {
      ...week,
      days: week.days.map((d) => {
        const completion =
          userId && "completions" in d && Array.isArray(d.completions)
            ? d.completions[0] ?? null
            : null;
        const { completions: _, ...dayRest } = d as typeof d & {
          completions?: unknown[];
        };
        return { ...dayRest, completion };
      }),
    };
  } catch {
    return null;
  }
}

export async function getCurrentWeekSchedule(userId?: string) {
  return getWeekScheduleForMonday(new Date(), userId);
}
