import { getSessionForApp } from "@/lib/auth";
import PrayerJournalClient from "./PrayerJournalClient";

export const dynamic = "force-dynamic";

export default async function JournalingPage() {
  const { userId, isSubscriber } = await getSessionForApp();
  const isGuest = !userId;
  const locked = isGuest || !isSubscriber;
  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:px-6 md:pt-14 md:pb-16">
        <PrayerJournalClient isGuest={isGuest} locked={locked} />
      </div>
    </div>
  );
}
