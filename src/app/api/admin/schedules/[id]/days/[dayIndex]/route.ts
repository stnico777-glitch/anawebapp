import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const PATCH = withAdmin<
  { params: Promise<{ id: string; dayIndex: string }> }
>(async (_, request, { params }) => {
  const { id, dayIndex } = await params;
  const idx = parseInt(dayIndex, 10);
  if (isNaN(idx) || idx < 0 || idx > 5) {
    return NextResponse.json({ error: "Invalid dayIndex" }, { status: 400 });
  }

  const body = await request.json();
  const {
    prayerTitle,
    prayerId,
    workoutTitle,
    workoutId,
    affirmationText,
    dayImageUrl,
    dayVideoUrl,
    daySubtext,
    movementIntroHeadline,
    movementIntroSubtext,
    movementEncouragementVideoUrl,
  } = body;

  const day = await prisma.scheduleDay.findUnique({
    where: { weekScheduleId_dayIndex: { weekScheduleId: id, dayIndex: idx } },
  });
  if (!day) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }

  const updated = await prisma.scheduleDay.update({
    where: { id: day.id },
    data: {
      ...(prayerTitle != null && { prayerTitle }),
      ...(prayerId !== undefined && { prayerId: prayerId || null }),
      ...(workoutTitle != null && { workoutTitle }),
      ...(workoutId !== undefined && { workoutId: workoutId || null }),
      ...(affirmationText != null && { affirmationText }),
      ...(dayImageUrl !== undefined && {
        dayImageUrl: dayImageUrl === "" ? null : dayImageUrl,
      }),
      ...(dayVideoUrl !== undefined && {
        dayVideoUrl: dayVideoUrl === "" ? null : dayVideoUrl,
      }),
      ...(daySubtext !== undefined && {
        daySubtext: daySubtext === "" ? null : daySubtext,
      }),
      ...(movementIntroHeadline !== undefined && {
        movementIntroHeadline:
          movementIntroHeadline === "" ? null : movementIntroHeadline,
      }),
      ...(movementIntroSubtext !== undefined && {
        movementIntroSubtext:
          movementIntroSubtext === "" ? null : movementIntroSubtext,
      }),
      ...(movementEncouragementVideoUrl !== undefined && {
        movementEncouragementVideoUrl:
          movementEncouragementVideoUrl === "" ? null : movementEncouragementVideoUrl,
      }),
    },
  });

  return NextResponse.json(updated);
});
