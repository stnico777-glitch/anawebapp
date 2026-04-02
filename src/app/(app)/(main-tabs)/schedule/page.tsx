import ScheduleDayCard from "@/components/ScheduleDayCard";
import DailyVerseScheduleCard from "@/components/DailyVerseScheduleCard";
import { getDailyVerseForDateInput } from "@/lib/daily-verse";
import { getCurrentWeekSchedule, getMonday, formatWeekRange } from "@/lib/schedule";
import { getSessionForApp } from "@/lib/auth";
import Link from "next/link";

/** 0 = Monday, 5 = Saturday; Sunday = 7 for "no week day" */
function getTodayDayIndex(): number {
  const d = new Date().getDay();
  if (d === 0) return 7;
  return d - 1;
}

export default async function SchedulePage() {
  const [{ userId, isSubscriber }, verseToday] = await Promise.all([
    getSessionForApp(),
    getDailyVerseForDateInput(undefined),
  ]);

  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
        <DailyVerseScheduleCard verse={verseToday} />
        <p className="mb-3 max-w-2xl text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif] md:mb-4 md:text-base">
          Your weekly rhythm—prayer, movement, and affirmation mapped to each day.
        </p>
        <p className="mb-10 text-xs lowercase tracking-[0.14em] text-gray/90 [font-family:var(--font-body),sans-serif] md:mb-12 md:text-[0.8125rem]">
          rhythm · intention · rest
        </p>

        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <h1
            id="schedule-heading"
            className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
          >
            Weekly Schedule
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/prayer"
              className="text-sm font-medium text-gray underline-offset-4 transition [font-family:var(--font-body),sans-serif] hover:text-foreground"
            >
              Audio library
            </Link>
            <Link
              href="/workouts"
              className="text-sm font-medium text-gray underline-offset-4 transition [font-family:var(--font-body),sans-serif] hover:text-foreground"
            >
              Workouts
            </Link>
          </div>
        </header>

        <ScheduleContent userId={userId ?? undefined} isLocked={!isSubscriber} />
      </div>
    </div>
  );
}

async function ScheduleContent({ userId, isLocked = false }: { userId?: string; isLocked?: boolean }) {
  const schedule = await getCurrentWeekSchedule(userId);

  if (!schedule) {
    return (
      <div className="rounded-sm border border-dashed border-sand bg-cream/60 py-16 text-center [font-family:var(--font-body),sans-serif]">
        <p className="text-gray">
          No schedule for this week yet. When your database is connected and seeded, the weekly rhythm will
          show here. Locally, you can run{" "}
          <code className="rounded-sm bg-cream px-1.5 py-0.5 text-sm">npm run db:seed</code> for sample data.
        </p>
      </div>
    );
  }

  const weekStart = getMonday(new Date());
  const todayDayIndex = getTodayDayIndex();
  const overallDone = schedule.days.reduce(
    (acc, d) => {
      const c = d.completion;
      const dayDone = c
        ? (c.prayerDone ? 1 : 0) + (c.workoutDone ? 1 : 0) + (c.affirmationDone ? 1 : 0) === 3
        : false;
      return acc + (dayDone ? 1 : 0);
    },
    0
  );

  return (
    <div className="space-y-8 pb-12 md:space-y-10 md:pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium tracking-wide text-gray [font-family:var(--font-body),sans-serif]">
          {formatWeekRange(weekStart)}
        </p>
        <div className="rounded-sm border border-sand bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-[0_1px_4px_rgba(0,0,0,0.06)] [font-family:var(--font-body),sans-serif]">
          {overallDone}/6 days complete
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {schedule.days.map((day) => (
          <ScheduleDayCard
            key={day.id}
            day={{
              id: day.id,
              dayIndex: day.dayIndex,
              prayerTitle: day.prayerTitle,
              workoutTitle: day.workoutTitle,
              affirmationText: day.affirmationText,
              prayerId: day.prayerId ?? null,
              workoutId: day.workoutId ?? null,
              completion: day.completion
                ? {
                    prayerDone: day.completion.prayerDone,
                    workoutDone: day.completion.workoutDone,
                    affirmationDone: day.completion.affirmationDone,
                  }
                : null,
            }}
            isToday={day.dayIndex === todayDayIndex}
            isLocked={isLocked}
          />
        ))}
      </div>

      <div className="rounded-none border border-sand bg-white/80 px-4 py-4 text-center [font-family:var(--font-body),sans-serif] md:px-6">
        <p className="text-sm leading-relaxed text-gray">
          <span className="font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
            Sunday — Sabbath rest.
          </span>{" "}
          Use this day for rest, reflection, and worship.
        </p>
      </div>
    </div>
  );
}
