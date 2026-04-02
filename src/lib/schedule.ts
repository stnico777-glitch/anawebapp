import { prisma } from "@/lib/prisma";
import { DAY_NAMES } from "@/constants/schedule";
export { formatWeekRange } from "@/lib/dateFormat";

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex] ?? "";
}

export async function getCurrentWeekSchedule(userId?: string) {
  const thisMonday = getMonday(new Date());
  thisMonday.setHours(0, 0, 0, 0);
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(nextMonday.getDate() + 7);
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
          completions: userId ? { where: { userId }, take: 1 } : false,
        },
      },
    },
  });

  if (!week) return null;

  return {
    ...week,
    days: week.days.map((d) => {
      const completion = userId && "completions" in d && Array.isArray(d.completions)
        ? d.completions[0] ?? null
        : null;
      const { completions: _, ...dayRest } = d as typeof d & { completions?: unknown[] };
      return { ...dayRest, completion };
    }),
  };
}
