import WorkoutLibrarySection from "@/components/WorkoutLibrarySection";
import MovementLibraryRealtime from "./MovementLibraryRealtime";
import { getMovementLayoutForDisplay } from "@/lib/movement-layout";
import { getSessionForApp } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { WorkoutRailCardWorkout } from "@/lib/workout-rail-display";

export const dynamic = "force-dynamic";

export default async function MovementPage() {
  const { userId } = await getSessionForApp();

  const [movementLayout, workouts, completedWorkoutIds] = await Promise.all([
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
            videoUrl: true,
          },
        });
      } catch {
        return [];
      }
    })(),
    (async (): Promise<string[]> => {
      if (!userId) return [];
      try {
        const rows = await prisma.userWorkoutCompletion.findMany({
          where: { userId },
          select: { workoutId: true },
        });
        return rows.map((r) => r.workoutId);
      } catch {
        return [];
      }
    })(),
  ]);

  return (
    <>
      <MovementLibraryRealtime />
      <WorkoutLibrarySection
        movementLayout={movementLayout}
        workouts={workouts}
        completedWorkoutIds={completedWorkoutIds}
      />
    </>
  );
}
