import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  addDaysUtc,
  utcDateInputStringForInstant,
  utcMondayMidnightForInstant,
  weekStartMondayUtcFromDateInput,
} from "@/lib/weekScheduleCalendar";
import { getDefaultScheduleDaysForSeed } from "@/lib/schedule-default-week";

async function findWeekScheduleClashing(weekStartMondayUtc: Date) {
  const next = addDaysUtc(weekStartMondayUtc, 7);
  return prisma.weekSchedule.findFirst({
    where: { weekStart: { gte: weekStartMondayUtc, lt: next } },
  });
}

export const GET = withAdmin(async () => {
  const schedules = await prisma.weekSchedule.findMany({
    include: { days: { orderBy: { dayIndex: "asc" } } },
    orderBy: { weekStart: "desc" },
  });
  return NextResponse.json(schedules);
});

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { weekStart, duplicateFromId } = body;

  if (duplicateFromId) {
    const source = await prisma.weekSchedule.findUnique({
      where: { id: duplicateFromId },
      include: { days: true },
    });
    if (!source) {
      return NextResponse.json({ error: "Source schedule not found" }, { status: 404 });
    }
    const newWeekStart = weekStart
      ? weekStartMondayUtcFromDateInput(weekStart)
      : addDaysUtc(utcMondayMidnightForInstant(new Date()), 7);
    const duplicateClash = await findWeekScheduleClashing(newWeekStart);
    if (duplicateClash) {
      return NextResponse.json(
        {
          error:
            "A schedule already exists for that week. Pick another week or delete the duplicate first.",
        },
        { status: 409 },
      );
    }
    const schedule = await prisma.weekSchedule.create({
      data: {
        weekStart: newWeekStart,
        days: {
          create: source.days.map((d) => ({
            dayIndex: d.dayIndex,
            prayerTitle: d.prayerTitle,
            prayerId: d.prayerId,
            workoutTitle: d.workoutTitle,
            workoutId: d.workoutId,
            affirmationText: d.affirmationText,
            dayImageUrl: d.dayImageUrl,
            dayVideoUrl: d.dayVideoUrl,
            daySubtext: d.daySubtext,
            movementIntroHeadline: d.movementIntroHeadline,
            movementIntroSubtext: d.movementIntroSubtext,
            movementEncouragementVideoUrl: d.movementEncouragementVideoUrl,
          })),
        },
      },
      include: { days: { orderBy: { dayIndex: "asc" } } },
    });
    return NextResponse.json(schedule);
  }

  const start = weekStart
    ? weekStartMondayUtcFromDateInput(weekStart)
    : weekStartMondayUtcFromDateInput(utcDateInputStringForInstant(new Date()));
  const blankClash = await findWeekScheduleClashing(start);
  if (blankClash) {
    return NextResponse.json(
      {
        error:
          "A schedule already exists for that week. Use Select week and Go to open it, or pick a different week.",
      },
      { status: 409 },
    );
  }
  const schedule = await prisma.weekSchedule.create({
    data: {
      weekStart: start,
      days: {
        create: getDefaultScheduleDaysForSeed().map((d) => ({
          dayIndex: d.dayIndex,
          prayerTitle: d.prayerTitle,
          workoutTitle: d.workoutTitle,
          affirmationText: d.affirmationText,
          dayImageUrl: d.dayImageUrl,
          dayVideoUrl: d.dayVideoUrl,
          daySubtext: d.daySubtext,
        })),
      },
    },
    include: { days: { orderBy: { dayIndex: "asc" } } },
  });

  return NextResponse.json(schedule);
});
