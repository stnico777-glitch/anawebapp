import { prisma } from "@/lib/prisma";
import { getSessionForApp } from "@/lib/auth";
import WorkoutLibrarySection from "@/components/WorkoutLibrarySection";
import { DEMO_WORKOUT_ROWS } from "@/lib/demo-preview-data";

type WorkoutListRow = {
  id: string;
  title: string;
  instructor: string | null;
  duration: number;
  category: string | null;
  thumbnailUrl: string | null;
  scripture: string | null;
};

export default async function WorkoutsPage() {
  const { userId, isSubscriber } = await getSessionForApp();

  let workouts: WorkoutListRow[] = [];
  let completedIds: string[] = [];
  try {
    workouts = await prisma.workout.findMany({
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
    if (userId) {
      completedIds = (
        await prisma.userWorkoutCompletion.findMany({
          where: { userId },
          select: { workoutId: true },
        })
      ).map((c) => c.workoutId);
    }
  } catch {
    // e.g. Vercel without hosted DATABASE_URL — show empty library instead of 500
  }

  if (workouts.length === 0) {
    workouts = DEMO_WORKOUT_ROWS;
  }

  return (
    <WorkoutLibrarySection
      workouts={workouts}
      completedIds={completedIds}
      isSubscriber={!!isSubscriber}
    />
  );
}
