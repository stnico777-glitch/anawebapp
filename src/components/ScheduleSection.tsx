import Link from "next/link";
import { MARKETING_SECTION_HEADER_REVEAL } from "@/constants/marketingScrollReveal";
import { DAY_NAMES, WORKOUT_SPLIT } from "@/constants/schedule";
import ScrollReveal from "@/components/ScrollReveal";
import RoutineDayCardsGrid from "@/components/RoutineDayCardsGrid";

type ScheduleDay = { id: string; dayIndex: number };

type ScheduleSectionProps = {
  schedule: { days: ScheduleDay[] } | null;
  /** When true, show a small white lock on each day card (for signed-out users). */
  showLockIcon?: boolean;
};

export default function ScheduleSection({ schedule, showLockIcon = false }: ScheduleSectionProps) {
  const displayDays = schedule
    ? schedule.days.map((d) => ({
        id: d.id,
        dayName: DAY_NAMES[d.dayIndex],
        workoutFocus: WORKOUT_SPLIT[d.dayIndex],
      }))
    : DAY_NAMES.map((name, i) => ({
        id: name,
        dayName: name,
        workoutFocus: WORKOUT_SPLIT[i],
      }));

  return (
    <section
      id="schedule"
      className="home-cv-schedule relative overflow-hidden border-t border-sand border-b border-sand bg-transparent px-3 pt-3 pb-[clamp(2rem,5vh,3.5rem)] md:pt-4 md:pb-[clamp(2.25rem,6vh,4rem)] lg:px-5 xl:px-8"
      aria-labelledby="schedule-heading"
    >
      <div className="relative z-10 mx-auto w-full max-w-[min(96rem,calc(100vw-1.25rem))]">
        <ScrollReveal
          className="w-full"
          delayMs={0}
          {...MARKETING_SECTION_HEADER_REVEAL}
          runwayPaddingBottom={{
            hidden: "min(6vh, 2rem)",
            visible: "0px",
          }}
        >
          <div className="flex items-center justify-center">
            <div
              className="h-[92px] w-[92px] shrink-0 md:h-[100px] md:w-[100px]"
              role="img"
              aria-label="Sunrise over waves"
              style={{
                backgroundColor: "#788287",
                maskImage: "url('/schedule-sun-outline.png')",
                WebkitMaskImage: "url('/schedule-sun-outline.png')",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              }}
            />
          </div>
        </ScrollReveal>
        <ScrollReveal className="w-full" delayMs={90} {...MARKETING_SECTION_HEADER_REVEAL}>
          <div
            className="mx-auto mt-1.5 h-px w-40 rounded-full bg-[#788287] md:w-44"
            aria-hidden
          />
        </ScrollReveal>
        <ScrollReveal className="w-full" delayMs={180} {...MARKETING_SECTION_HEADER_REVEAL}>
          <h2
            id="schedule-heading"
            className="mt-3 text-center text-3xl font-normal capitalize leading-[1.4] tracking-[0.135em] text-gray [font-synthesis:none] md:mt-3.5 md:text-4xl [font-family:var(--font-headline),sans-serif]"
          >
            Your Weekly Routine
          </h2>
        </ScrollReveal>
        <ScrollReveal className="w-full" delayMs={270} {...MARKETING_SECTION_HEADER_REVEAL}>
          <p className="mt-1.5 text-center text-sm lowercase tracking-[0.12em] text-gray [font-family:var(--font-body),sans-serif] md:mt-2 md:text-base">
            monday → saturday · movement split &amp; affirmation each day
          </p>
        </ScrollReveal>
        <div className="mt-5 space-y-6 md:mt-6">
          <ScrollReveal
            className="relative mx-auto w-full max-w-none"
            delayMs={320}
            threshold={0.08}
            rootMargin="0px 0px -8% 0px"
            hiddenSlideY="min(12vh, 4rem)"
            motionDurationMs={960}
            motionEase="cubic-bezier(0.25, 1, 0.35, 1)"
            runwayPaddingBottom={{
              hidden: "min(12vh, 4rem)",
              visible: "0px",
            }}
          >
            {/* md+: 7 columns — grid above connector in paint order; grid z-[2], line z-[1] */}
            <RoutineDayCardsGrid displayDays={displayDays} showLockIcon={showLockIcon} />
            <div className="pointer-events-none absolute inset-0 z-[1] [&>div]:h-full" aria-hidden>
              <div className="relative h-full w-full">
                <div className="absolute left-[-6%] right-[-42%] top-1/2 h-0.5 -translate-y-1/2 bg-[#788287]/80" />
              </div>
            </div>
          </ScrollReveal>
        </div>
        <ScrollReveal
          className="mt-12 w-full text-center md:mt-16"
          delayMs={90}
          threshold={0.08}
          rootMargin="0px 0px -8% 0px"
          hiddenSlideY="min(18vh, 6rem)"
          motionDurationMs={1000}
          motionEase="cubic-bezier(0.25, 1, 0.35, 1)"
          runwayPaddingBottom={{
            hidden: "min(18vh, 6rem)",
            visible: "max(0.5rem, env(safe-area-inset-bottom))",
          }}
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#788287] px-8 py-3 font-medium text-[#788287] [font-family:var(--font-headline),sans-serif] transition-[transform,color,background-color] duration-300 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.02] hover:bg-[#788287]/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#788287] focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
          >
            Full Movement Library
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
