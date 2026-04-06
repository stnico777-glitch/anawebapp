import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [workoutCount, prayerCount, scheduleCount, verseCount, carouselCount] =
    await Promise.all([
      prisma.workout.count(),
      prisma.prayerAudio.count(),
      prisma.weekSchedule.count(),
      prisma.dailyVerse.count(),
      prisma.carouselPost.count(),
    ]);

  const cards = [
    { href: "/admin/workouts", label: "Movement", count: workoutCount },
    { href: "/admin/prayer", label: "Prayer / Audio", count: prayerCount },
    { href: "/admin/schedules", label: "Schedules", count: scheduleCount },
    { href: "/admin/daily-verse", label: "Daily verses", count: verseCount },
    { href: "/admin/carousel", label: "Instagram Carousel", count: carouselCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        CMS Admin
      </h1>
      <p className="mt-1 text-stone-500 dark:text-stone-400">
        Manage movement sessions, prayer audio, schedules, daily verses, and carousel.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ href, label, count }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-stone-700 dark:bg-stone-900"
          >
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">
              {label}
            </h2>
            <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
              {count}
            </p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              items
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
