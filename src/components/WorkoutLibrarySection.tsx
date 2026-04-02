"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GEAR_UP_CAROUSEL_ROW_CLASS,
  FormStyleRailCard,
  LibraryCarouselArrows,
} from "@/components/LibraryBannerStrip";
const PROGRAM_PLACEHOLDERS = [
  {
    title: "7 Day Amped Up Challenge",
    subtitle: "Challenge",
    image: "/placeholders/pilates-strong.png",
    summary:
      "Short, high-energy sessions designed to build momentum in one week. Stack them daily or pick your favorites when you need a boost.",
  },
  {
    title: "Everyday Arms",
    subtitle: "Arms · 6 sessions",
    image: "/placeholders/pilates-reformer-foot.png",
    summary:
      "Sculpted shoulders and arms without endless reps—focused sets you can repeat on busy days or pair with lower-body work.",
  },
  {
    title: "Strong Signature Series",
    subtitle: "Series · 8 sessions",
    image: "/placeholders/pilates-reformer-stretch.png",
    summary:
      "A progressive arc that layers strength and control week over week. Expect clear progressions and time to master each pattern.",
  },
  {
    title: "Morning Glow Flow",
    subtitle: "Yoga · 5 sessions",
    image: "/placeholders/pilates-stretch-flow.png",
    summary:
      "Gentle mobility and breath-led movement to wake up your body—ideal before work or after a heavy training day.",
  },
  {
    title: "Faith & Flex Foundations",
    subtitle: "Beginner · 4 sessions",
    image: "/placeholders/soft-core-stillness.png",
    summary:
      "Meet yourself where you are: simple strength plus flexibility basics so you can show up consistently without overwhelm.",
  },
  {
    title: "Weekly Rhythm Reset",
    subtitle: "Routine · 7 sessions",
    image: "/placeholders/pilates-ball-knee.png",
    summary:
      "One session-style for each day of the week—balanced, repeatable, and built to match real life when schedules shift.",
  },
  {
    title: "Sisterhood Strong",
    subtitle: "Community · 3 sessions",
    image: "/community.png",
    summary:
      "Encouraging, uplifting workouts you can share with friends or do solo when you want a little extra heart behind the reps.",
  },
  {
    title: "Sabbath Slow Sundays",
    subtitle: "Rest · 2 sessions",
    image: "/placeholders/yoga-ocean-forearm.png",
    summary:
      "Low-load movement and restoration—space to breathe, stretch, and reset before the week ahead.",
  },
  {
    title: "Sunrise Strength Circuit",
    subtitle: "Strength · 5 sessions",
    image: "/placeholders/yoga-ocean-forearm.png",
    summary:
      "Compound-focused circuits to build power and endurance—great when you want efficiency and a clear finish line.",
  },
];

/** Same art as Training Essentials — portrait program cards, beginner-focused copy. */
const NEW_TO_PILATES_PLACEHOLDERS = [
  {
    title: "Pilates 101: Start here",
    subtitle: "Beginner · 4 sessions",
    image: "/placeholders/pilates-strong.png",
    summary:
      "Meet the basics without overwhelm—breath, neutral spine, and a few moves you can repeat until they feel second nature.",
  },
  {
    title: "Core & control basics",
    subtitle: "Foundations · 5 sessions",
    image: "/placeholders/soft-core-stillness.png",
    summary:
      "Slow, precise layers that teach control before speed—ideal when you want Pilates to feel steady, not flashy.",
  },
  {
    title: "Strong at any pace",
    subtitle: "Strength · 4 sessions",
    image: "/placeholders/pilates-strong.png",
    summary:
      "Build confidence with clear progressions—small ranges, big intention, and space to reset between sets.",
  },
  {
    title: "Ease in & breathe",
    subtitle: "Restorative · 3 sessions",
    image: "/placeholders/soft-core-stillness.png",
    summary:
      "Gentle flows when you’re new to the work—soft music, longer exhales, and permission to keep it simple.",
  },
  {
    title: "Form over reps",
    subtitle: "Technique · 4 sessions",
    image: "/placeholders/pilates-strong.png",
    summary:
      "Short sessions that zoom in on setup and alignment so every class after lands smarter and safer.",
  },
  {
    title: "Your first month map",
    subtitle: "Plan · 6 sessions",
    image: "/placeholders/soft-core-stillness.png",
    summary:
      "A week-by-week taste of mat and strength work—enough variety to stay curious, not enough to burn out.",
  },
] as const;

const WORKOUT_PLACEHOLDERS = [
  "/placeholders/pilates-strong.png",
  "/placeholders/pilates-reformer-stretch.png",
  "/placeholders/soft-core-stillness.png",
  "/placeholders/pilates-stretch-flow.png",
  "/weekly-workouts.png",
  "/day-previews/beachstretch.png",
];

type WorkoutItem = {
  id: string;
  title: string;
  instructor: string | null;
  duration: number;
  category: string | null;
  thumbnailUrl: string | null;
  scripture: string | null;
};

function workoutMetaLine(w: WorkoutItem, completed: boolean): string {
  if (completed) return "Completed";
  const cat = (w.category ?? "Training").replace(/\s+/g, " ").trim();
  return `${w.duration} min · ${cat}`;
}

function workoutHoverSummary(w: WorkoutItem): string {
  const bits: string[] = [];
  const scripture = w.scripture?.trim();
  if (scripture) bits.push(scripture);
  bits.push(
    `${w.duration}-minute ${(w.category ?? "workout").toLowerCase()} session${w.instructor ? ` with ${w.instructor}` : ""}.`
  );
  bits.push("Show up, move with intention, and mark complete when you finish.");
  return bits.join(" ");
}

type WorkoutLibrarySectionProps = {
  workouts: WorkoutItem[];
  completedIds: string[];
  isSubscriber: boolean;
};

export default function WorkoutLibrarySection({ workouts, completedIds, isSubscriber }: WorkoutLibrarySectionProps) {
  const programsRef = useRef<HTMLDivElement>(null);
  const newToPilatesRef = useRef<HTMLDivElement>(null);
  const workoutsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
        <p className="mb-3 max-w-2xl text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif] md:mb-4 md:text-base">
          Faith-forward training—pick a program, then line up sessions for the week.
        </p>
        <p className="mb-10 text-xs lowercase tracking-[0.14em] text-gray/90 [font-family:var(--font-body),sans-serif] md:mb-12 md:text-[0.8125rem]">
          awake · align · strong
        </p>
        <section className="mb-14 md:mb-16" aria-labelledby="programs-heading">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="programs-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              Programs
            </h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <LibraryCarouselArrows scrollRef={programsRef} />
              <Link
                href="/workouts"
                className="text-sm font-medium text-gray underline-offset-4 transition [font-family:var(--font-body),sans-serif] hover:text-foreground"
              >
                View all
              </Link>
            </div>
          </div>
          <div
            ref={programsRef}
            className={GEAR_UP_CAROUSEL_ROW_CLASS}
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {PROGRAM_PLACEHOLDERS.map((p) => (
              <FormStyleRailCard
                key={p.title}
                href="/workouts"
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

      {/* Full-bleed edge-to-edge — Training Essentials (title stays in content width) */}
      <section className="mb-14 w-full md:mb-16" aria-labelledby="training-essentials-heading">
        <div className="mx-auto mb-4 max-w-7xl px-4 md:mb-5 md:px-6">
          <h2
            id="training-essentials-heading"
            className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
          >
            Training Essentials
          </h2>
        </div>
        <div className="grid w-full grid-cols-1 gap-0 sm:grid-cols-2">
          <div className="group relative aspect-[16/9] overflow-hidden bg-neutral-900 sm:aspect-[3/2]">
            <Image
              src="/placeholders/pilates-strong.png"
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
              <p className="text-xl font-semibold tracking-tight text-white md:text-2xl [font-family:var(--font-headline),sans-serif]">
                Power training
              </p>
              <p className="mt-1 text-xs lowercase tracking-[0.12em] text-white/85 [font-family:var(--font-body),sans-serif]">
                strength · focus · endurance
              </p>
              <span className="essentials-explore-glass mt-4">Explore</span>
            </div>
          </div>
          <div className="group relative aspect-[16/9] overflow-hidden bg-neutral-900 sm:aspect-[3/2]">
            <Image
              src="/placeholders/soft-core-stillness.png"
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
              <p className="text-xl font-semibold tracking-tight text-white md:text-2xl [font-family:var(--font-headline),sans-serif]">
                Flow & mobility
              </p>
              <p className="mt-1 text-xs lowercase tracking-[0.12em] text-white/85 [font-family:var(--font-body),sans-serif]">
                breath · length · ease
              </p>
              <span className="essentials-explore-glass mt-4">Explore</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <section className="mb-14 md:mb-16" aria-labelledby="new-to-pilates-heading">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="new-to-pilates-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              New to Pilates
            </h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <LibraryCarouselArrows scrollRef={newToPilatesRef} />
              <Link
                href="/workouts"
                className="text-sm font-medium text-gray underline-offset-4 transition [font-family:var(--font-body),sans-serif] hover:text-foreground"
              >
                View all
              </Link>
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
                href="/workouts"
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

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-6 md:pb-16 md:pt-10">
        <section className="mb-8" aria-labelledby="workouts-heading">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="workouts-heading"
              className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]"
            >
              Weekly Workouts
            </h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <LibraryCarouselArrows scrollRef={workoutsRef} />
              <Link
                href="/workouts"
                className="text-sm font-medium text-gray underline-offset-4 transition [font-family:var(--font-body),sans-serif] hover:text-foreground"
              >
                View all
              </Link>
            </div>
          </div>

          {workouts.length === 0 ? (
            <div className="rounded-sm border border-dashed border-sand bg-cream/60 py-16 text-center">
              <p className="text-gray [font-family:var(--font-body),sans-serif]">
                No workouts yet. Run{" "}
                <code className="rounded-sm bg-cream px-1.5 py-0.5 text-sm">npm run db:seed</code> to add sample content.
              </p>
            </div>
          ) : (
            <div
              ref={workoutsRef}
              className={GEAR_UP_CAROUSEL_ROW_CLASS}
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            >
              {workouts.map((w, index) => {
                const thumb = w.thumbnailUrl ?? WORKOUT_PLACEHOLDERS[index % WORKOUT_PLACEHOLDERS.length];
                const completed = completedIds.includes(w.id);
                return (
                  <FormStyleRailCard
                    key={w.id}
                    href={isSubscriber ? `/workouts/${w.id}` : "/subscribe"}
                    src={thumb}
                    alt={w.title}
                    title={w.title}
                    metaLine={workoutMetaLine(w, completed)}
                    hoverSummary={workoutHoverSummary(w)}
                    unoptimized={!!w.thumbnailUrl && w.thumbnailUrl.startsWith("http")}
                    showLock={!isSubscriber}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}