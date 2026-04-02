import { prisma } from "@/lib/prisma";
import { getSessionForApp } from "@/lib/auth";
import WorkoutLibrarySection from "@/components/WorkoutLibrarySection";

export default async function WorkoutsPage() {
  const { userId, isSubscriber } = await getSessionForApp();

  const workouts = await prisma.workout.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      instructor: true,
      duration: true,
      category: true,
      thumbnailUrl: true,
      scripture: true,
    },
  });

  const completedIds =
    userId ?
      (
        await prisma.userWorkoutCompletion.findMany({
          where: { userId },
          select: { workoutId: true },
        })
      ).map((c) => c.workoutId)
    : [];

  return (
    <WorkoutLibrarySection
      workouts={workouts}
      completedIds={completedIds}
      isSubscriber={!!isSubscriber}
    />
  );
}
