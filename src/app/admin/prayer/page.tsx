import { prisma } from "@/lib/prisma";
import { getAudioLayoutForAdmin } from "@/lib/audio-layout";
import PrayerAudioLibraryAdminView from "./PrayerAudioLibraryAdminView";

export default async function AdminPrayerPage() {
  const [prayers, layout] = await Promise.all([
    prisma.prayerAudio.findMany({
      orderBy: { title: "asc" },
    }),
    getAudioLayoutForAdmin(),
  ]);

  const serialized = prayers.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    scripture: p.scripture,
    audioUrl: p.audioUrl,
    duration: p.duration,
    coverImageUrl: p.coverImageUrl,
  }));

  return <PrayerAudioLibraryAdminView prayers={serialized} layout={layout} />;
}
