import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ success: true }); // no-op when not logged in

  const { id } = await params;
  const workout = await prisma.workout.findUnique({ where: { id } });
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  await prisma.userWorkoutCompletion.upsert({
    where: {
      userId_workoutId: { userId: user.id, workoutId: id },
    },
    update: { completedAt: new Date() },
    create: {
      userId: user.id,
      workoutId: id,
    },
  });

  return NextResponse.json({ success: true });
}
