import CalendarWeekIcon from "@/components/CalendarWeekIcon";
import ScheduleDayCard from "@/components/ScheduleDayCard";
import ScheduleSabbathTile from "@/components/ScheduleSabbathTile";
import DailyVerseScheduleCard from "@/components/DailyVerseScheduleCard";
import ScheduleWeekRealtime from "@/app/(app)/(main-tabs)/schedule/ScheduleWeekRealtime";
import { getDailyVerseForDateInput } from "@/lib/daily-verse";
import { getCurrentWeekSchedule, formatWeekRange } from "@/lib/schedule";
import { getSessionForApp } from "@/lib/auth";
import { getDemoDailyVerse, getDemoWeekSchedule } from "@/lib/demo-preview-data";
import { prisma } from "@/lib/prisma";
import {
  resolveScheduleDayPlaceholderVideoUrl,
  resolveScheduleDayMovementVideoSrcSync,
} from "@/lib/schedule-day-movement-defaults";

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
  const isGuest = !userId;
  // Real signed-in users should see an empty-state, not demo content, when the CMS has no row.
  // Demo fallbacks stay in place for guests browsing the marketing/preview path only.
  const verseToday = verseRaw ?? (isGuest ? getDemoDailyVerse() : null);
  const scheduleLocked = isGuest || !isSubscriber;
  const scheduleLockCtaHref = isGuest ? "/register" : "/subscribe";

  const realWeek = await getCurrentWeekSchedule(userId ?? undefined);
  const schedule = realWeek ?? (isGuest ? getDemoWeekSchedule() : null);

  const todayDayIndex = getTodayDayIndex();
  const todayDay = schedule
    ? schedule.days.find((d) => d.dayIndex === todayDayIndex) ?? null
    : null;
  const demoDay = todayDay?.id.startsWith("demo-schedule-day-") ?? true;
  /** Hide the encouragement CTA for guests, non-subscribers, and demo days (no persistence backing). */
  const encouragementHref =
    !scheduleLocked && todayDay && !demoDay
      ? `/schedule/encouragement/${todayDay.id}`
      : null;

  const placeholderVideoUrl = await resolveScheduleDayPlaceholderVideoUrl(prisma);

  const weekStart = schedule ? new Date(schedule.weekStart) : null;
  // Only six weekday rows (Mon–Sat) count toward the progress tally; Sabbath is shown separately.
  const scheduleDaysTotal = schedule ? schedule.days.length : 0;
  const overallDone = schedule
    ? schedule.days.reduce((acc, d) => {
        const c = d.completion;
        const dayDone = c
          ? (c.prayerDone ? 1 : 0) + (c.workoutDone ? 1 : 0) + (c.affirmationDone ? 1 : 0) === 3
          : false;
        return acc + (dayDone ? 1 : 0);
      }, 0)
    : 0;

  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
        <DailyVerseScheduleCard verse={verseToday} encouragementHref={encouragementHref} />

        <header className="mb-8 sm:mb-10">
          <h1
            id="schedule-heading"
            className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
          >
            Weekly Schedule
          </h1>
        </header>

        {!schedule ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-sand bg-white/70 p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              Your weekly schedule isn&apos;t published yet
            </p>
            <p className="mt-2 text-sm text-gray [font-family:var(--font-body),sans-serif]">
              Check back soon — we&apos;re preparing this week&apos;s prayer, movement, and affirmation cards.
            </p>
          </div>
        ) : (
        <div className="space-y-8 pb-12 md:space-y-10 md:pb-16">
          <ScheduleWeekRealtime weekScheduleId={schedule.id} />
          {/* Parity: ScheduleScreen scheduleMetaRow + scheduleDivider (awake-align mobile) */}
          <div>
            <div className="mb-2 flex flex-row items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <CalendarWeekIcon className="h-[15px] w-[15px] shrink-0 text-gray" />
                <p className="min-w-0 truncate text-base font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
                  {weekStart ? formatWeekRange(weekStart) : ""}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold uppercase tracking-[0.04em] text-sky-blue [font-family:var(--font-body),sans-serif]">
                {overallDone}/{scheduleDaysTotal || 6} complete
              </p>
            </div>
            <div className="h-px bg-[rgba(232,228,212,0.9)]" aria-hidden />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {schedule.days.map((day) => {
              const workoutVideoUrl =
                "workout" in day && day.workout?.videoUrl != null
                  ? day.workout.videoUrl
                  : null;
              const movementVideoSrc = resolveScheduleDayMovementVideoSrcSync(
                day,
                workoutVideoUrl,
                placeholderVideoUrl,
              );
              return (
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
                    dayImageUrl: day.dayImageUrl ?? null,
                    dayVideoUrl: day.dayVideoUrl ?? null,
                    daySubtext: day.daySubtext ?? null,
                    completion: day.completion
                      ? {
                          prayerDone: day.completion.prayerDone,
                          workoutDone: day.completion.workoutDone,
                          affirmationDone: day.completion.affirmationDone,
                        }
                      : null,
                  }}
                  isToday={day.dayIndex === todayDayIndex}
                  isLocked={scheduleLocked}
                  lockCtaHref={scheduleLockCtaHref}
                  movementVideoSrc={movementVideoSrc}
                />
              );
            })}
            <div className="col-span-2 flex justify-center sm:col-span-2 lg:col-span-1 lg:col-start-2">
              <div className="w-full sm:max-w-[calc((100%-1rem)/2)] lg:max-w-none">
                <ScheduleSabbathTile isToday={todayDayIndex === 7} />
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
