import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = withAdmin(async () => {
  const workouts = await prisma.workout.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(workouts);
});

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { title, instructor, duration, category, scripture, videoUrl, thumbnailUrl } = body;
  if (!title || !videoUrl || duration == null) {
    return NextResponse.json(
      { error: "title, videoUrl, and duration required" },
      { status: 400 }
    );
  }

  const workout = await prisma.workout.create({
    data: {
      title,
      instructor: instructor || null,
      duration: parseInt(String(duration), 10),
      category: category || null,
      scripture: scripture || null,
      videoUrl,
      thumbnailUrl: thumbnailUrl || null,
    },
  });

  return NextResponse.json(workout);
});
