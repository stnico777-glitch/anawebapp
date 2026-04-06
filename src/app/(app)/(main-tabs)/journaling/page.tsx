import PrayerJournalClient from "./PrayerJournalClient";

export default function JournalingPage() {
  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:px-6 md:pt-14 md:pb-16">
        <PrayerJournalClient />
      </div>
    </div>
  );
}
