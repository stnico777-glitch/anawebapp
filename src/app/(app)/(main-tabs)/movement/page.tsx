import WorkoutLibrarySection from "@/components/WorkoutLibrarySection";
import { getMovementLayoutForDisplay } from "@/lib/movement-layout";
import { prisma } from "@/lib/prisma";
import type { WorkoutRailCardWorkout } from "@/lib/workout-rail-display";

export default async function MovementPage() {
  const [movementLayout, workouts] = await Promise.all([
    getMovementLayoutForDisplay(),
    (async (): Promise<WorkoutRailCardWorkout[]> => {
      try {
        return await prisma.workout.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            instructor: true,
            duration: true,
            category: true,
            scripture: true,
            thumbnailUrl: true,
          },
        });
      } catch {
        return [];
      }
    })(),
  ]);

  return <WorkoutLibrarySection movementLayout={movementLayout} workouts={workouts} />;
}
