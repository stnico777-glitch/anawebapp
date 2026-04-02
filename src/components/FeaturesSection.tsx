"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import LockIcon from "@/components/LockIcon";
import { PRAYER_COVER_PATHS } from "@/constants/prayerCovers";

const CARD_LINK_CLASS =
  "mt-4 inline-block text-sm font-semibold text-sky-blue hover:text-sky-blue/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:rounded-none";

/** Match ScheduleSection / RoutineDayCardsGrid cards: hover lift — no extra drop shadow on hover. */
const FEATURE_CARD_SHELL =
  "group relative z-0 flex w-[80vw] min-w-[300px] max-w-[420px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-none bg-transparent shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_28px_-6px_rgba(0,0,0,0.14)] ring-1 ring-sky-blue/40 transition-all duration-300 ease-out will-change-transform hover:z-[45] hover:-translate-y-3 hover:scale-[1.02] hover:ring-2 hover:ring-accent-amber/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 md:w-full md:min-w-0 md:max-w-none md:flex-shrink";

/** Hover caption — tight chip sized to text (not full-bleed over the image). */
const FEATURE_HOVER_PANEL_BASE =
  "pointer-events-none absolute left-3 bottom-3 z-10 inline-flex max-h-[min(38vh,11rem)] max-w-[min(13.5rem,calc(100%-1.75rem))] min-h-0 flex-col justify-start gap-0 overflow-y-auto rounded-none border border-black/10 bg-white/95 px-2.5 py-1.5 text-left opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100";

const FEATURE_IMAGE_HOVER =
  "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100";

type FeaturesSectionProps = {
  /** When true, show a small white lock on feature cards for signed-out / non-subscriber visitors. */
  showLockIcon?: boolean;
};

export default function FeaturesSection({ showLockIcon = false }: FeaturesSectionProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setCardsVisible(true);
      return;
    }
    const el = cardsRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setCardsVisible(true);
          ob.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20% 0px",
      }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [reduceMotion]);

  const cardsMotion =
    reduceMotion
      ? ""
      : cardsVisible
        ? "opacity-0 animate-feature-fade-in"
        : "translate-y-[14px] opacity-0";

  return (
    <section id="features" className="border-t border-sand bg-transparent px-2 py-16 md:px-4 md:py-24" aria-labelledby="features-heading">
      <div className="mx-auto max-w-[1500px]">
        <ScrollReveal
          className="w-full"
          threshold={0.1}
          rootMargin="0px 0px -8% 0px"
          hiddenSlideY="min(10vh, 3rem)"
          motionDurationMs={880}
          motionEase="cubic-bezier(0.25, 1, 0.35, 1)"
          runwayPaddingBottom={{
            hidden: "min(10vh, 3rem)",
            visible: "0px",
          }}
        >
          <div className="flex flex-col items-center">
            <div
              className="mt-2 h-[56px] w-[180px] sm:h-[64px] sm:w-[220px]"
              role="img"
              aria-label="Decorative wave over Everything you need"
              style={{
                backgroundColor: "#788287",
                maskImage: "url('/everything-need-mask.png')",
                WebkitMaskImage: "url('/everything-need-mask.png')",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              }}
            />
            <h2
              id="features-heading"
              className="mt-4 text-center text-3xl font-light text-foreground md:text-4xl [font-family:var(--font-headline),sans-serif]"
            >
              Everything you need
            </h2>
          </div>
          <p className="mt-2 text-center text-gray">Faith + fitness, all in one place</p>
          <div className="mx-auto mt-8 h-[6px] w-64 rounded-none bg-[#788287]" aria-hidden />
        </ScrollReveal>

        <div
          ref={cardsRef}
          className={`mt-12 transform-gpu md:mt-20 flex gap-2 overflow-x-auto pb-3 pt-5 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible md:gap-4 md:pb-2 md:pt-0 lg:gap-4 xl:grid-cols-4 xl:gap-4 -mx-2 px-2 md:mx-0 md:px-0 ${cardsMotion}`}
        >
          <article className={FEATURE_CARD_SHELL}>
            <div className="relative aspect-[5/4] min-h-0 w-full max-h-[390px] md:max-h-[450px] overflow-hidden bg-sand">
              {showLockIcon && (
                <span className="absolute right-2 bottom-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px] pointer-events-none" aria-hidden>
                  <LockIcon size="sm" className="text-white" />
                </span>
              )}
              <Image src="/weekly-workouts.png" alt="Weekly schedule — prayer, workouts and affirmations" fill sizes="(max-width: 768px) 72vw, (max-width: 1024px) 50vw, 25vw" className={FEATURE_IMAGE_HOVER} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent" aria-hidden />
              <Link
                href="/#schedule"
                className="absolute inset-x-0 top-0 z-20 rounded-none bg-[#788287]/95 px-4 py-2.5 text-center text-[13px] font-semibold leading-tight text-[#FFFCE9] [font-family:var(--font-headline),sans-serif]"
              >
                The <span className="font-semibold">Weekly Schedule</span>
              </Link>
              <div
                className={`${FEATURE_HOVER_PANEL_BASE} ${showLockIcon ? "pr-10" : ""}`}
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray">Workouts & Meditations</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground">
                  The magic is in our Weekly Schedule—curated prayer, workouts & affirmations Mon–Sat.
                </p>
                <p className="mt-1.5 text-[12px] font-semibold text-sky-blue">View schedule →</p>
              </div>
            </div>
            <div className="hidden px-3 py-2.5 md:px-4 md:py-3">
              <p className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-gray">Workouts & Meditations</p>
              <p className="mt-1 max-h-0 overflow-hidden text-xs leading-relaxed text-foreground opacity-0 transition-[max-height,opacity] duration-300 group-hover:max-h-[5rem] group-hover:opacity-100 md:group-hover:max-h-[5.5rem]">
                The magic is in our Weekly Schedule—curated prayer, workouts & affirmations Mon–Sat so you stay consistent in mind & body.
              </p>
              <Link href="/#schedule" className={CARD_LINK_CLASS}>
                View schedule →
              </Link>
            </div>
          </article>

          <article className={FEATURE_CARD_SHELL}>
            <div className="relative aspect-[5/4] min-h-0 w-full max-h-[390px] md:max-h-[450px] overflow-hidden bg-sand">
              {showLockIcon && (
                <span className="absolute right-2 bottom-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px] pointer-events-none" aria-hidden>
                  <LockIcon size="sm" className="text-white" />
                </span>
              )}
              <Image src="/day-previews/beachstretch.png" alt="Workouts — Pilates, yoga & strength" fill sizes="(max-width: 768px) 72vw, (max-width: 1024px) 50vw, 25vw" className={FEATURE_IMAGE_HOVER} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent" aria-hidden />
              <Link
                href="/workouts"
                className="absolute inset-x-0 top-0 z-20 rounded-none bg-[#788287]/95 px-4 py-2.5 text-center text-[13px] font-semibold leading-tight text-[#FFFCE9] [font-family:var(--font-headline),sans-serif]"
              >
                <span className="font-semibold">Workouts</span>
              </Link>
              <div
                className={`${FEATURE_HOVER_PANEL_BASE} ${showLockIcon ? "pr-10" : ""}`}
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray">On-demand</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground">Pilates, yoga & strength—short sessions you can keep.</p>
                <p className="mt-1.5 text-[12px] font-semibold text-sky-blue">Explore workouts →</p>
              </div>
            </div>
            <div className="hidden px-3 py-2.5 md:px-4 md:py-3">
              <p className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-gray">On-demand</p>
              <p className="mt-1 max-h-0 overflow-hidden text-xs leading-relaxed text-foreground opacity-0 transition-[max-height,opacity] duration-300 group-hover:max-h-[5rem] group-hover:opacity-100 md:group-hover:max-h-[5.5rem]">
                Pilates, yoga & strength—stream classes that meet you where you are and build a practice you can keep.
              </p>
              <Link href="/workouts" className={CARD_LINK_CLASS}>
                Explore workouts →
              </Link>
            </div>
          </article>

          <article className={FEATURE_CARD_SHELL}>
            <div className="relative aspect-[5/4] min-h-0 w-full max-h-[390px] md:max-h-[450px] overflow-hidden bg-sand">
              {showLockIcon && (
                <span className="absolute right-2 bottom-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px] pointer-events-none" aria-hidden>
                  <LockIcon size="sm" className="text-white" />
                </span>
              )}
              <Image
                src={PRAYER_COVER_PATHS[1]}
                alt="Prayer and audio library — scripture-led sessions"
                fill
                sizes="(max-width: 768px) 72vw, (max-width: 1024px) 50vw, 25vw"
                className={FEATURE_IMAGE_HOVER}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent" aria-hidden />
              <Link
                href="/prayer"
                className="absolute inset-x-0 top-0 z-20 rounded-none bg-[#788287]/95 px-4 py-2.5 text-center text-[13px] font-semibold leading-tight text-[#FFFCE9] [font-family:var(--font-headline),sans-serif]"
              >
                <span className="font-semibold">Prayer & Audio</span>
              </Link>
              <div
                className={`${FEATURE_HOVER_PANEL_BASE} ${showLockIcon ? "pr-10" : ""}`}
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray">Scripture-led</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground">Guided prayer and devotionals rooted in scripture.</p>
                <p className="mt-1.5 text-[12px] font-semibold text-sky-blue">Prayer & Audio →</p>
              </div>
            </div>
            <div className="hidden px-3 py-2.5 md:px-4 md:py-3">
              <p className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-gray">Scripture-led devotionals</p>
              <p className="mt-1 max-h-0 overflow-hidden text-xs leading-relaxed text-foreground opacity-0 transition-[max-height,opacity] duration-300 group-hover:max-h-[5rem] group-hover:opacity-100 md:text-sm md:group-hover:max-h-[5.5rem]">
                Start or end your day with guided prayer and devotionals rooted in scripture—designed to align your heart and mind.
              </p>
              <Link href="/prayer" className={CARD_LINK_CLASS}>
                Prayer & Audio →
              </Link>
            </div>
          </article>

          <article className={FEATURE_CARD_SHELL}>
            <div className="relative aspect-[5/4] min-h-0 w-full max-h-[390px] md:max-h-[450px] overflow-hidden bg-sand">
              {showLockIcon && (
                <span className="absolute right-2 bottom-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px] pointer-events-none" aria-hidden>
                  <LockIcon size="sm" className="text-white" />
                </span>
              )}
              <Image src="/community.png" alt="Prayer and praise — The Bloom Scroll and praise wall" fill sizes="(max-width: 768px) 72vw, (max-width: 1024px) 50vw, 25vw" className={FEATURE_IMAGE_HOVER} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent" aria-hidden />
              <Link
                href="/community"
                className="absolute inset-x-0 top-0 z-20 rounded-none bg-[#788287]/95 px-4 py-2.5 text-center text-[13px] font-semibold leading-tight text-[#FFFCE9] [font-family:var(--font-headline),sans-serif]"
              >
                <span className="font-semibold">Prayer & Praise</span>
              </Link>
              <div
                className={`${FEATURE_HOVER_PANEL_BASE} ${showLockIcon ? "pr-10" : ""}`}
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray">The Bloom Scroll · Praise wall</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground">Share requests, pray for each other, and celebrate what God is doing.</p>
                <p className="mt-1.5 text-[12px] font-semibold text-sky-blue">Open prayer &amp; praise →</p>
              </div>
            </div>
            <div className="hidden px-3 py-2.5 md:px-4 md:py-3">
              <p className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-gray">The Bloom Scroll · Praise wall</p>
              <p className="mt-1 max-h-0 overflow-hidden text-xs leading-relaxed text-foreground opacity-0 transition-[max-height,opacity] duration-300 group-hover:max-h-[5rem] group-hover:opacity-100 md:text-sm md:group-hover:max-h-[5.5rem]">
                Two simple walls: lift up prayer requests and share praise reports—nothing else.
              </p>
              <Link href="/community" className={CARD_LINK_CLASS}>
                Prayer & Praise →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
