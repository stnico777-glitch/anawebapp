import { prisma } from "@/lib/prisma";
import PrayerJournalBroadcastForm from "./PrayerJournalBroadcastForm";

export default async function AdminPrayerJournalPage() {
  let memberCount = 0;
  try {
    memberCount = await prisma.profile.count();
  } catch {
    memberCount = 0;
  }

  return (
    <div>
      <header className="mb-6 sm:mb-8">
        <h1
          className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
        >
          Prayer journal broadcast
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray md:text-base">
          Same fields as the member “New prayer” sheet — team prayers are added to each account at once.
        </p>
      </header>

      <PrayerJournalBroadcastForm memberCount={memberCount} />
    </div>
  );
}
