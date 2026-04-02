import { prisma } from "@/lib/prisma";
import PrayerForm from "./PrayerForm";

export default async function AdminPrayerPage() {
  const prayers = await prisma.prayerAudio.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Prayer / Audio
        </h1>
        <PrayerForm />
      </div>
      <div className="mt-6 space-y-3">
        {prayers.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900"
          >
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                {p.title}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {p.duration}s • {p.scripture ?? "—"}
              </p>
            </div>
            <PrayerForm prayer={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
