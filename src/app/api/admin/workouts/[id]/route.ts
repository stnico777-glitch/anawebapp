import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const PATCH = withAdmin<
  { params: Promise<{ id: string }> }
>(async (_, request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { title, duration, category, scripture, videoUrl, thumbnailUrl } = body;

  const workout = await prisma.workout.update({
    where: { id },
    data: {
      ...(title != null && { title }),
      instructor: null,
      ...(duration != null && { duration: parseInt(String(duration), 10) }),
      ...(category != null && { category }),
      ...(scripture != null && { scripture }),
      ...(videoUrl != null && { videoUrl }),
      ...(thumbnailUrl != null && { thumbnailUrl }),
    },
  });

  return NextResponse.json(workout);
});

export const DELETE = withAdmin<
  { params: Promise<{ id: string }> }
>(async (_, _request, { params }) => {
  const { id } = await params;
  await prisma.workout.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
