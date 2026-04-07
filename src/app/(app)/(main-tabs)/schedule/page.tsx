import CalendarWeekIcon from "@/components/CalendarWeekIcon";
import ScheduleDayCard from "@/components/ScheduleDayCard";
import ScheduleSabbathTile from "@/components/ScheduleSabbathTile";
import DailyVerseScheduleCard from "@/components/DailyVerseScheduleCard";
import { getDailyVerseForDateInput } from "@/lib/daily-verse";
import { getCurrentWeekSchedule, getMonday, formatWeekRange } from "@/lib/schedule";
import { getSessionForApp } from "@/lib/auth";
import { getDemoDailyVerse, getDemoWeekSchedule } from "@/lib/demo-preview-data";

/** 0 = Monday, 5 = Saturday; Sunday = 7 for "no week day" */
function getTodayDayIndex(): number {
  const d = new Date().getDay();
  if (d === 0) return 7;
  return d - 1;
}

export default async function SchedulePage() {
  const [{ userId, isSubscriber }, verseRaw] = await Promise.all([
    getSessionForApp(),
    getDailyVerseForDateInput(undefined),
  ]);
  const verseToday = verseRaw ?? getDemoDailyVerse();

  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
        <DailyVerseScheduleCard verse={verseToday} />

        <header className="mb-8 sm:mb-10">
          <h1
            id="schedule-heading"
            className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
          >
            Weekly Schedule
          </h1>
        </header>

        <ScheduleContent userId={userId ?? undefined} isLocked={!isSubscriber} />
      </div>
    </div>
  );
}

async function ScheduleContent({ userId, isLocked = false }: { userId?: string; isLocked?: boolean }) {
  const schedule =
    (await getCurrentWeekSchedule(userId)) ?? getDemoWeekSchedule();

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
      {/* Parity: ScheduleScreen scheduleMetaRow + scheduleDivider (awake-align mobile) */}
      <div>
        <div className="mb-2 flex flex-row items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <CalendarWeekIcon className="h-[15px] w-[15px] shrink-0 text-gray" />
            <p className="min-w-0 truncate text-base font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              {formatWeekRange(weekStart)}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold uppercase tracking-[0.04em] text-sky-blue [font-family:var(--font-body),sans-serif]">
            {overallDone}/7 complete
          </p>
        </div>
        <div className="h-px bg-[rgba(232,228,212,0.9)]" aria-hidden />
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
        <div className="col-span-2 flex justify-center sm:col-span-2 lg:col-span-1 lg:col-start-2">
          <div className="w-full sm:max-w-[calc((100%-1rem)/2)] lg:max-w-none">
            <ScheduleSabbathTile isToday={todayDayIndex === 7} />
          </div>
        </div>
      </div>
    </div>
  );
}
