import { prisma } from "@/lib/prisma";
import { publicJson, publicOptions } from "@/lib/public-json";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET() {
  const workouts = await prisma.workout.findMany({
    orderBy: { title: "asc" },
  });
  return publicJson({
    workouts: workouts.map((w) => ({
      id: w.id,
      title: w.title,
      instructor: w.instructor,
      duration: w.duration,
      category: w.category,
      scripture: w.scripture,
      videoUrl: w.videoUrl,
      thumbnailUrl: w.thumbnailUrl,
    })),
  });
}
