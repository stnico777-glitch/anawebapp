import { prisma } from "@/lib/prisma";
import { getMovementLayoutForAdmin } from "@/lib/movement-layout";
import WorkoutLibraryAdminView from "./WorkoutLibraryAdminView";

export default async function AdminWorkoutsPage() {
  const [workouts, movementLayout] = await Promise.all([
    prisma.workout.findMany({
      orderBy: { createdAt: "desc" },
    }),
    getMovementLayoutForAdmin(),
  ]);

  const serialized = workouts.map((w) => ({
    id: w.id,
    title: w.title,
    instructor: w.instructor,
    duration: w.duration,
    category: w.category,
    scripture: w.scripture,
    videoUrl: w.videoUrl,
    thumbnailUrl: w.thumbnailUrl,
  }));

  return <WorkoutLibraryAdminView workouts={serialized} movementLayout={movementLayout} />;
}
