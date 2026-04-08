import { prisma } from "@/lib/prisma";
import PrayerAudioLibrary, { type PrayerLibraryItem } from "./PrayerAudioLibrary";
import { getSessionForApp } from "@/lib/auth";
import { DEMO_PRAYER_LIBRARY } from "@/lib/demo-preview-data";
import { getAudioLayoutForDisplay } from "@/lib/audio-layout";

export default async function PrayerPage() {
  const [{ userId, isSubscriber }, layout] = await Promise.all([
    getSessionForApp(),
    getAudioLayoutForDisplay(),
  ]);

  let prayers: PrayerLibraryItem[] = [];
  let completedIds: string[] = [];
  try {
    prayers = await prisma.prayerAudio.findMany({
      orderBy: { title: "asc" },
    });
    if (userId) {
      completedIds = (
        await prisma.userPrayerCompletion.findMany({
          where: { userId },
          select: { prayerId: true },
        })
      ).map((c) => c.prayerId);
    }
  } catch {
    // e.g. Vercel without hosted DATABASE_URL
  }

  if (prayers.length === 0) {
    prayers = DEMO_PRAYER_LIBRARY as PrayerLibraryItem[];
  }

  return (
    <PrayerAudioLibrary
      prayers={prayers}
      completedIds={completedIds}
      isSubscriber={isSubscriber}
      isGuest={!userId}
      layout={layout}
    />
  );
}
