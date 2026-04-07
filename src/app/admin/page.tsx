import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  let workoutCount: number;
  let prayerCount: number;
  let scheduleCount: number;
  let verseCount: number;
  try {
    [workoutCount, prayerCount, scheduleCount, verseCount] = await Promise.all([
      prisma.workout.count(),
      prisma.prayerAudio.count(),
      prisma.weekSchedule.count(),
      prisma.dailyVerse.count(),
    ]);
  } catch (e) {
    console.error("[admin] Prisma counts failed (check Vercel logs + DATABASE_URL / SSL):", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P1001") {
      throw new Error(
        "Can't reach the database (P1001). On Vercel, set DATABASE_URL to Supabase’s Transaction pooler URI (Connect → Transaction pooler, port 6543, add ?pgbouncer=true) — not db.*.supabase.co:5432.",
      );
    }
    throw e;
  }

  const cards = [
    { href: "/admin/workouts", label: "Movement", count: workoutCount },
    { href: "/admin/prayer", label: "Audio", count: prayerCount },
    { href: "/admin/schedules", label: "Schedules", count: scheduleCount },
    { href: "/admin/daily-verse", label: "Daily verses", count: verseCount },
  ];

  return (
    <div>
      <header className="mb-8 sm:mb-10">
        <h1
          className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
        >
          Edit content
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray md:text-base">
          Same layout as the member app — use the sections below to manage movement, audio, weekly
          schedules, and verse of the day.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, label, count }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border border-sand bg-white p-6 shadow-[0_1px_2px_rgba(120,130,135,0.06)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(120,130,135,0.1)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <h2 className="font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              {label}
            </h2>
            <p className="mt-3 text-3xl font-semibold text-sky-blue tabular-nums [font-family:var(--font-headline),sans-serif]">
              {count}
            </p>
            <p className="mt-1 text-sm text-gray">items · tap to edit</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
