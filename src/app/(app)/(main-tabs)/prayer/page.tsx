import { prisma } from "@/lib/prisma";
import PrayerAudioLibrary, { type PrayerLibraryItem } from "./PrayerAudioLibrary";
import { getSessionForApp } from "@/lib/auth";

export default async function PrayerPage() {
  const { userId, isSubscriber } = await getSessionForApp();

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

  return (
    <PrayerAudioLibrary
      prayers={prayers}
      completedIds={completedIds}
      isSubscriber={isSubscriber}
    />
  );
}
