import { prisma } from "@/lib/prisma";
import { publicJson, publicOptions } from "@/lib/public-json";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const w = await prisma.workout.findUnique({ where: { id } });
  if (!w) {
    return publicJson({ error: "Not found" }, 404);
  }
  return publicJson({
    workout: {
      id: w.id,
      title: w.title,
      duration: w.duration,
      category: w.category,
      scripture: w.scripture,
      videoUrl: w.videoUrl,
      thumbnailUrl: w.thumbnailUrl,
    },
  });
}
