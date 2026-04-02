import PrayerJournalClient from "./PrayerJournalClient";

export default function JournalingPage() {
  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:px-6 md:pt-14 md:pb-16">
        <p className="mb-3 max-w-2xl text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif] md:mb-4 md:text-base">
          Log prayers, mark answers, add photos—and share encouragement. We start you with
          starter prayers from the Awake &amp; Align team; edit, archive, or replace them anytime.
        </p>
        <PrayerJournalClient />
      </div>
    </div>
  );
}
