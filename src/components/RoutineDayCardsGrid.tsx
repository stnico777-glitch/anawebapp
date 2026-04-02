"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import LockIcon from "@/components/LockIcon";
import {
  DAY_CARD_IMAGE_HOVER,
  DAY_CARD_SHELL_HOVER,
  SABBATH_CARD_SHADOW_RING,
  SABBATH_CARD_SUBTITLE_CLASS,
  SABBATH_CARD_TITLE_CLASS,
  WEEKDAY_CARD_SHADOW_RING,
} from "@/constants/dayCardVisual";
import { WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";

/** Landscape tile; aspect + md/lg gaps tuned so cards read a touch larger on desktop. */
const DAY_CARD_FRAME =
  "group relative z-0 w-full aspect-[4/3.92] overflow-hidden rounded-none bg-transparent";

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
 * Monday–Saturday + Sunday: one IntersectionObserver on the grid; entire grid fades/slides in together (no per-card stagger).
 */
export default function RoutineDayCardsGrid({ displayDays, showLockIcon }: RoutineDayCardsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true);
      return;
    }
    const el = gridRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setVisible(true);
          ob.unobserve(entry.target);
        }
      },
      {
        /* Negative bottom inset: animate only once grid is farther into the viewport */
        threshold: 0.1,
        rootMargin: "0px 0px -20% 0px",
      }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [reduceMotion]);

  const gridMotion =
    reduceMotion
      ? ""
      : visible
        ? "opacity-0 animate-feature-fade-in"
        : "translate-y-[14px] opacity-0";

  return (
    <div
      ref={gridRef}
      className={`relative z-[2] grid transform-gpu grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-5 md:grid-cols-7 md:gap-2 lg:gap-2.5 ${gridMotion}`}
    >
      {displayDays.map(({ id, dayName, workoutFocus }, index) => (
        <div key={id} className="w-full">
          <div className={`${DAY_CARD_FRAME} ${WEEKDAY_CARD_SHADOW_RING} ${DAY_CARD_SHELL_HOVER}`}>
            {showLockIcon && (
              <span className="absolute right-2 bottom-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px]" aria-hidden>
                <LockIcon size="sm" className="text-white" />
              </span>
            )}
            <div className="absolute inset-0 bg-sand">
              <Image
                src={WEEKLY_DAY_CARD_IMAGES[index % WEEKLY_DAY_CARD_IMAGES.length]}
                alt={`${dayName} — Prayer, ${workoutFocus} & affirmation`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, min(15vw, 220px)"
                className={DAY_CARD_IMAGE_HOVER}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 from-50% to-transparent pointer-events-none" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 z-10 px-2.5 pb-2 pt-1 md:px-3 md:pb-2.5 md:pt-1.5">
              <p className="text-sm font-semibold tracking-tight text-white [font-family:var(--font-headline),sans-serif] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                {dayName}
              </p>
              <p className="mt-0.5 text-[11px] font-normal lowercase tracking-[0.12em] text-white/90 [font-family:var(--font-body),sans-serif] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                prayer · {workoutFocus.toLowerCase()} · affirmation
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, min(15vw, 220px)"
              className={DAY_CARD_IMAGE_HOVER}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 px-2.5 pb-2 pt-1 md:px-3 md:pb-2.5 md:pt-1.5">
            <p className={SABBATH_CARD_TITLE_CLASS}>Sunday</p>
            <p className={SABBATH_CARD_SUBTITLE_CLASS}>Sabbath · Rest · Reflect · Worship</p>
          </div>
        </div>
      </div>
    </div>
  );
}
