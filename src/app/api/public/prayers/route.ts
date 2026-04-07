import { prisma } from "@/lib/prisma";
import { publicJson, publicOptions } from "@/lib/public-json";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET() {
  const prayers = await prisma.prayerAudio.findMany({
    orderBy: { title: "asc" },
  });
  return publicJson({
    prayers: prayers.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      scripture: p.scripture,
      audioUrl: p.audioUrl,
      duration: p.duration,
      coverImageUrl: p.coverImageUrl,
    })),
  });
}
