import Image from "next/image";
import LockIcon from "@/components/LockIcon";
import {
  DAY_CARD_IMAGE_HOVER,
  DAY_CARD_SHELL_HOVER,
  SABBATH_CARD_SHADOW_RING,
  SABBATH_CARD_SUBTITLE_CLASS,
  SABBATH_CARD_TITLE_CLASS,
  THEMED_LOCK_BADGE_CLASS,
  WEEKDAY_CARD_SHADOW_RING,
} from "@/constants/dayCardVisual";
import { SUNDAY_WORKOUT_NAME, WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";

/** Taller tiles in the 7-column strip (more vertical presence). */
const DAY_CARD_FRAME =
  "group relative z-0 w-full aspect-[4/5.1] overflow-hidden rounded-none bg-transparent";

type DayDisplay = {
  id: string;
  dayName: string;
  workoutFocus: string;
};

type RoutineDayCardsGridProps = {
  displayDays: DayDisplay[];
  showLockIcon: boolean;
};

/**
 * Monday–Saturday + Sunday: scroll-in animation is handled by the parent `ScrollReveal` in `ScheduleSection`.
 */
export default function RoutineDayCardsGrid({ displayDays, showLockIcon }: RoutineDayCardsGridProps) {
  return (
    <div className="relative z-[2] grid transform-gpu grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-5 md:grid-cols-7 md:gap-1 lg:gap-1.5">
      {displayDays.map(({ id, dayName, workoutFocus }, index) => (
        <div key={id} className="w-full">
          <div className={`${DAY_CARD_FRAME} ${WEEKDAY_CARD_SHADOW_RING} ${DAY_CARD_SHELL_HOVER}`}>
            {showLockIcon && (
              <span className={`absolute right-2 top-3 z-10 ${THEMED_LOCK_BADGE_CLASS}`} aria-hidden>
                <LockIcon size="sm" className="text-white" />
              </span>
            )}
            <div className="absolute inset-0 bg-sand">
              <Image
                src={WEEKLY_DAY_CARD_IMAGES[index % WEEKLY_DAY_CARD_IMAGES.length]}
                alt={`${dayName} — ${workoutFocus}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, min(22vw, 360px)"
                className={DAY_CARD_IMAGE_HOVER}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 from-50% to-transparent pointer-events-none" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 z-10 px-2.5 pb-2 pt-1 md:px-3 md:pb-2.5 md:pt-1.5">
              <p className="text-sm font-semibold tracking-tight text-white [font-family:var(--font-headline),sans-serif] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] md:text-base">
                {dayName}
              </p>
              <p className="mt-0.5 text-[11px] font-normal lowercase tracking-[0.12em] text-white/90 [font-family:var(--font-body),sans-serif] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] md:text-xs">
                {workoutFocus.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      ))}
      <div className="w-full">
        <div
          className={`${DAY_CARD_FRAME} ${SABBATH_CARD_SHADOW_RING} ${DAY_CARD_SHELL_HOVER}`}
          aria-label="Sunday Sabbath"
        >
          <div className="absolute inset-0 bg-sand">
            <Image
              src="/sabbath-birds.png"
              alt="Sunday — Sabbath rest"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, min(22vw, 360px)"
              className={DAY_CARD_IMAGE_HOVER}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 px-2.5 pb-2 pt-1 md:px-3 md:pb-2.5 md:pt-1.5">
            <p className={SABBATH_CARD_TITLE_CLASS}>Sunday</p>
            <p className={SABBATH_CARD_SUBTITLE_CLASS}>{SUNDAY_WORKOUT_NAME}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
