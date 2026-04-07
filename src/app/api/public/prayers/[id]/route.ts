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
  const p = await prisma.prayerAudio.findUnique({ where: { id } });
  if (!p) {
    return publicJson({ error: "Not found" }, 404);
  }
  return publicJson({
    prayer: {
      id: p.id,
      title: p.title,
      description: p.description,
      scripture: p.scripture,
      audioUrl: p.audioUrl,
      duration: p.duration,
      coverImageUrl: p.coverImageUrl,
    },
  });
}
