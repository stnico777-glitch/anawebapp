import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";

const schema = z.object({
  prayerDone: z.boolean().optional(),
  workoutDone: z.boolean().optional(),
  affirmationDone: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ dayId: string }> }
) {
  const user = await requireAuth();
  const { dayId } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!user) {
    return NextResponse.json({
      prayerDone: parsed.data.prayerDone ?? false,
      workoutDone: parsed.data.workoutDone ?? false,
      affirmationDone: parsed.data.affirmationDone ?? false,
    });
  }

  const day = await prisma.scheduleDay.findUnique({
    where: { id: dayId },
  });
  if (!day) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }

  const existing = await prisma.userDayCompletion.findUnique({
    where: {
      userId_scheduleDayId: { userId: user.id, scheduleDayId: dayId },
    },
  });

  const data = {
    prayerDone: parsed.data.prayerDone ?? existing?.prayerDone ?? false,
    workoutDone: parsed.data.workoutDone ?? existing?.workoutDone ?? false,
    affirmationDone: parsed.data.affirmationDone ?? existing?.affirmationDone ?? false,
  };

  const allDone = data.prayerDone && data.workoutDone && data.affirmationDone;

  const completion = await prisma.userDayCompletion.upsert({
    where: {
      userId_scheduleDayId: { userId: user.id, scheduleDayId: dayId },
    },
    update: {
      ...data,
      completedAt: allDone ? new Date() : null,
    },
    create: {
      userId: user.id,
      scheduleDayId: dayId,
      ...data,
      completedAt: allDone ? new Date() : null,
    },
  });

  return NextResponse.json(completion);
}
