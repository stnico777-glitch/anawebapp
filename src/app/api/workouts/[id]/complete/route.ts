import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMemberFromRequest } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireMemberFromRequest(request);
  if (!gate.ok) {
    return NextResponse.json(gate.body, { status: gate.status });
  }
  const user = gate.user;

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
