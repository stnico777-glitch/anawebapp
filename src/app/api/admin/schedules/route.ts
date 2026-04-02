import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMonday } from "@/lib/schedule";
import { DAY_NAMES } from "@/constants/schedule";

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
      ? getMonday(new Date(weekStart))
      : getMonday(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
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
          })),
        },
      },
      include: { days: { orderBy: { dayIndex: "asc" } } },
    });
    return NextResponse.json(schedule);
  }

  const start = weekStart ? getMonday(new Date(weekStart)) : getMonday(new Date());
  const schedule = await prisma.weekSchedule.create({
    data: {
      weekStart: start,
      days: {
        create: DAY_NAMES.map((name, i) => ({
          dayIndex: i,
          prayerTitle: `Morning Prayer – ${name}`,
          workoutTitle: "Session",
          affirmationText: `"I am strong in body and spirit." – Day ${i + 1}`,
        })),
      },
    },
    include: { days: { orderBy: { dayIndex: "asc" } } },
  });

  return NextResponse.json(schedule);
});
