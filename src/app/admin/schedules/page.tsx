import { prisma } from "@/lib/prisma";
import SchedulesClient from "./SchedulesClient";

export default async function AdminSchedulesPage() {
  const schedules = await prisma.weekSchedule.findMany({
    include: { days: { orderBy: { dayIndex: "asc" } } },
    orderBy: { weekStart: "desc" },
  });

  const workouts = await prisma.workout.findMany({
    orderBy: { title: "asc" },
  });

  const prayers = await prisma.prayerAudio.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <header className="mb-8 sm:mb-10">
        <h1
          className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
        >
          Weekly schedules
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray md:text-base">
          Pick a week with <strong className="font-semibold text-foreground">Select week</strong> (any day
          in that week), then tap <strong className="font-semibold text-foreground">Go</strong>—if that
          week doesn&apos;t exist yet, you can create it from the prompt. The grid
          matches the member schedule; use{" "}
          <strong className="font-semibold text-foreground">Edit card</strong> on each day to set image,
          subtext, prayer, movement, and affirmation. Changes go live on the next load (same public API
          as the app).
        </p>
      </header>

      <SchedulesClient
        schedules={schedules.map((s) => ({
          ...s,
          weekStart: s.weekStart.toISOString(),
          days: s.days,
        }))}
        workouts={workouts}
        prayers={prayers}
      />
    </div>
  );
}
