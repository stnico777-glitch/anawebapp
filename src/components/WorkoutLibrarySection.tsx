"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  GEAR_UP_CAROUSEL_ROW_CLASS,
  FormStyleRailCard,
  LibraryCarouselArrows,
} from "@/components/LibraryBannerStrip";
import { WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";

const PROGRAM_PLACEHOLDERS = [
  {
    title: "7 Day Amped Up Challenge",
    subtitle: "Challenge",
    summary:
      "Short, high-energy sessions designed to build momentum in one week. Stack them daily or pick your favorites when you need a boost.",
  },
  {
    title: "Everyday Arms",
    subtitle: "Arms · 6 sessions",
    summary:
      "Sculpted shoulders and arms without endless reps—focused sets you can repeat on busy days or pair with lower-body work.",
  },
  {
    title: "Strong Signature Series",
    subtitle: "Series · 8 sessions",
    summary:
      "A progressive arc that layers strength and control week over week. Expect clear progressions and time to master each pattern.",
  },
  {
    title: "Morning Glow Flow",
    subtitle: "Yoga · 5 sessions",
    summary:
      "Gentle mobility and breath-led movement to wake up your body—ideal before work or after a heavy training day.",
  },
  {
    title: "Faith & Flex Foundations",
    subtitle: "Beginner · 4 sessions",
    summary:
      "Meet yourself where you are: simple strength plus flexibility basics so you can show up consistently without overwhelm.",
  },
  {
    title: "Weekly Rhythm Reset",
    subtitle: "Routine · 7 sessions",
    summary:
      "One session-style for each day of the week—balanced, repeatable, and built to match real life when schedules shift.",
  },
  {
    title: "Sisterhood Strong",
    subtitle: "Community · 3 sessions",
    summary:
      "Encouraging, uplifting movement you can share with friends or do solo when you want a little extra heart behind the reps.",
  },
  {
    title: "Sabbath Slow Sundays",
    subtitle: "Rest · 2 sessions",
    summary:
      "Low-load movement and restoration—space to breathe, stretch, and reset before the week ahead.",
  },
  {
    title: "Sunrise Strength Circuit",
    subtitle: "Strength · 5 sessions",
    summary:
      "Compound-focused circuits to build power and endurance—great when you want efficiency and a clear finish line.",
  },
].map((p, i) => ({
  ...p,
  image: WEEKLY_DAY_CARD_IMAGES[i % WEEKLY_DAY_CARD_IMAGES.length],
}));

/** Portrait program cards for the Quickie rail — beginner-focused copy. */
const NEW_TO_PILATES_PLACEHOLDERS = (
  [
    {
      title: "Pilates 101: Start here",
      subtitle: "Beginner · 4 sessions",
      summary:
        "Meet the basics without overwhelm—breath, neutral spine, and a few moves you can repeat until they feel second nature.",
    },
    {
      title: "Core & control basics",
      subtitle: "Foundations · 5 sessions",
      summary:
        "Slow, precise layers that teach control before speed—ideal when you want Pilates to feel steady, not flashy.",
    },
    {
      title: "Strong at any pace",
      subtitle: "Strength · 4 sessions",
      summary:
        "Build confidence with clear progressions—small ranges, big intention, and space to reset between sets.",
    },
    {
      title: "Ease in & breathe",
      subtitle: "Restorative · 3 sessions",
      summary:
        "Gentle flows when you’re new to the work—soft music, longer exhales, and permission to keep it simple.",
    },
    {
      title: "Form over reps",
      subtitle: "Technique · 4 sessions",
      summary:
        "Short sessions that zoom in on setup and alignment so every class after lands smarter and safer.",
    },
    {
      title: "Your first month map",
      subtitle: "Plan · 6 sessions",
      summary:
        "A week-by-week taste of mat and strength work—enough variety to stay curious, not enough to burn out.",
    },
  ] as const
).map((p, i) => ({
  ...p,
  image: WEEKLY_DAY_CARD_IMAGES[i % WEEKLY_DAY_CARD_IMAGES.length],
}));

export default function WorkoutLibrarySection() {
  const programsRef = useRef<HTMLDivElement>(null);
  const newToPilatesRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
        <section className="mb-14 md:mb-16" aria-labelledby="library-heading">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="library-heading"
              className="text-2xl font-semibold tracking-tight text-gray md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              Library
            </h2>
            <LibraryCarouselArrows scrollRef={programsRef} />
          </div>
          <div
            ref={programsRef}
            className={GEAR_UP_CAROUSEL_ROW_CLASS}
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {PROGRAM_PLACEHOLDERS.map((p) => (
              <FormStyleRailCard
                key={p.title}
                href="/movement"
                src={p.image}
                alt={p.title}
                title={p.title}
                metaLine={p.subtitle}
                hoverSummary={p.summary}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Full-bleed edge-to-edge — large featured cards (title stays in content width) */}
      <section className="mb-14 w-full md:mb-16" aria-labelledby="just-getting-started-heading">
        <div className="mx-auto mb-4 max-w-7xl px-4 md:mb-5 md:px-6">
          <h2
            id="just-getting-started-heading"
            className="text-2xl font-semibold tracking-tight text-gray md:text-3xl [font-family:var(--font-headline),sans-serif]"
          >
            Just Getting Started
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif] md:text-[0.9375rem]">
            Just getting started - Beginner to Pilates
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-0 sm:grid-cols-2">
          <div className="group relative aspect-[16/9] overflow-hidden bg-neutral-900 sm:aspect-[3/2]">
            <Image
              src={WEEKLY_DAY_CARD_IMAGES[0]}
              alt="Training — strength and conditioning session"
              fill
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 from-[18%] via-transparent to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
              <p className="text-xl font-semibold tracking-tight text-background md:text-2xl [font-family:var(--font-headline),sans-serif]">
                Power training
              </p>
              <p className="mt-1 text-xs lowercase tracking-[0.12em] text-background/85 [font-family:var(--font-body),sans-serif]">
                strength · focus · endurance
              </p>
              <span className="essentials-explore-glass-cream mt-4">Explore</span>
            </div>
          </div>
          <div className="group relative aspect-[16/9] overflow-hidden bg-neutral-900 sm:aspect-[3/2]">
            <Image
              src={WEEKLY_DAY_CARD_IMAGES[1]}
              alt="Training — focused conditioning session"
              fill
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 from-[18%] via-transparent to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 lg:p-8">
              <p className="text-xl font-semibold tracking-tight text-background md:text-2xl [font-family:var(--font-headline),sans-serif]">
                Flow & mobility
              </p>
              <p className="mt-1 text-xs lowercase tracking-[0.12em] text-background/85 [font-family:var(--font-body),sans-serif]">
                breath · length · ease
              </p>
              <span className="essentials-explore-glass-cream mt-4">Explore</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-16">
        <section className="mb-14 md:mb-16" aria-labelledby="quickie-heading">
          <div className="mb-4 flex flex-col gap-2 sm:mb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2
                  id="quickie-heading"
                  className="text-2xl font-semibold tracking-tight text-gray md:text-3xl [font-family:var(--font-headline),sans-serif]"
                >
                  Quickie
                </h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif] md:text-[0.9375rem]">
                  Quick little workouts you can squeeze in anytime—short, focused, and easy to stack when you want a little more.
                </p>
              </div>
              <div className="flex shrink-0 items-center sm:pt-1">
                <LibraryCarouselArrows scrollRef={newToPilatesRef} />
              </div>
            </div>
          </div>
          <div
            ref={newToPilatesRef}
            className={GEAR_UP_CAROUSEL_ROW_CLASS}
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {NEW_TO_PILATES_PLACEHOLDERS.map((p) => (
              <FormStyleRailCard
                key={p.title}
                href="/movement"
                src={p.image}
                alt={p.title}
                title={p.title}
                metaLine={p.subtitle}
                hoverSummary={p.summary}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}