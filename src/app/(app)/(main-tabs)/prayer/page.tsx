import { prisma } from "@/lib/prisma";
import PrayerAudioLibrary from "./PrayerAudioLibrary";
import { getSessionForApp } from "@/lib/auth";

export default async function PrayerPage() {
  const { userId, isSubscriber } = await getSessionForApp();

  const prayers = await prisma.prayerAudio.findMany({
    orderBy: { title: "asc" },
  });

  const completedIds = userId
    ? (
        await prisma.userPrayerCompletion.findMany({
          where: { userId },
          select: { prayerId: true },
        })
      ).map((c) => c.prayerId)
    : [];

  return (
    <PrayerAudioLibrary
      prayers={prayers}
      completedIds={completedIds}
      isSubscriber={isSubscriber}
    />
  );
}
