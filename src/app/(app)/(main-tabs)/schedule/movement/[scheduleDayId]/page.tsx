import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ScheduleDayMovementSession from "@/app/(app)/(main-tabs)/movement/schedule-day/[scheduleDayId]/ScheduleDayMovementSession";
import {
  resolveScheduleDayPlaceholderVideoUrl,
  resolveScheduleDayMovementVideoSrcSync,
  resolveScheduleDayEncouragementVideoSrcSync,
} from "@/lib/schedule-day-movement-defaults";

export default async function ScheduleDayMovementPage({
  params,
}: {
  params: Promise<{ scheduleDayId: string }>;
}) {
  const { scheduleDayId } = await params;

  let day = null as Awaited<ReturnType<typeof prisma.scheduleDay.findUnique>>;
  try {
    day = await prisma.scheduleDay.findUnique({
      where: { id: scheduleDayId },
    });
  } catch {
    day = null;
  }
  if (!day) notFound();

  let workout = null as Awaited<ReturnType<typeof prisma.workout.findUnique>>;
  if (day.workoutId) {
    try {
      workout = await prisma.workout.findUnique({ where: { id: day.workoutId } });
    } catch {
      workout = null;
    }
  }

  const placeholder = await resolveScheduleDayPlaceholderVideoUrl(prisma);
  const videoSrc = resolveScheduleDayMovementVideoSrcSync(day, workout?.videoUrl, placeholder);
  const encouragementSrc = resolveScheduleDayEncouragementVideoSrcSync(day, placeholder);
  const encouragementPoster = day.dayImageUrl?.trim() || undefined;

  const title = day.workoutTitle?.trim() || workout?.title || "Movement";

  return (
    <div className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-7xl flex-col justify-center bg-app-surface px-4 py-4 md:px-6 md:py-6">
      <ScheduleDayMovementSession
        scheduleDayId={day.id}
        encouragementSrc={encouragementSrc}
        encouragementPoster={encouragementPoster}
        src={videoSrc}
        title={title}
      />
    </div>
  );
}
