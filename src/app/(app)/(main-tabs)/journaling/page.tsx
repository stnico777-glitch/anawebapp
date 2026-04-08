import { auth } from "@/auth";
import PrayerJournalClient from "./PrayerJournalClient";

export default async function JournalingPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:px-6 md:pt-14 md:pb-16">
        <PrayerJournalClient isGuest={!session} />
      </div>
    </div>
  );
}
