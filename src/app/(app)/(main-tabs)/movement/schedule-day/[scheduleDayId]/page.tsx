import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionForApp } from "@/lib/auth";
import { WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";
import ScheduleDayVideoPlayer from "./ScheduleDayVideoPlayer";

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

  const videoSrc = (day.dayVideoUrl?.trim() || workout?.videoUrl || "").trim();
  if (!videoSrc) {
    if (day.workoutId) redirect(`/movement/${day.workoutId}`);
    notFound();
  }

  const poster =
    day.dayImageUrl?.trim() ||
    workout?.thumbnailUrl?.trim() ||
    WEEKLY_DAY_CARD_IMAGES[day.dayIndex % WEEKLY_DAY_CARD_IMAGES.length];

  const title = day.workoutTitle?.trim() || workout?.title || "Movement";

  const { userId } = await getSessionForApp();
  let initialWorkoutDone = false;
  if (userId) {
    try {
      const c = await prisma.userDayCompletion.findUnique({
        where: {
          userId_scheduleDayId: { userId, scheduleDayId: day.id },
        },
      });
      initialWorkoutDone = c?.workoutDone ?? false;
    } catch {
      initialWorkoutDone = false;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/schedule"
        className="mb-4 inline-flex items-center text-sm text-gray hover:text-foreground"
      >
        ← Back to Schedule
      </Link>
      <h1 className="text-2xl font-medium text-foreground [font-family:var(--font-headline),sans-serif]">
        {title}
      </h1>
      {workout?.instructor ? (
        <p className="mt-1 text-sm text-gray">{workout.instructor}</p>
      ) : null}
      <div className="mt-6">
        <ScheduleDayVideoPlayer
          scheduleDayId={day.id}
          src={videoSrc}
          poster={poster}
          title={title}
          initialWorkoutDone={initialWorkoutDone}
        />
      </div>
    </div>
  );
}
