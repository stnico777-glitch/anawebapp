import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Weekly Schedules
      </h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        Create schedules, duplicate prior weeks, assign content to days.
      </p>

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
