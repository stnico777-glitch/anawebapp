"use client";

import { FormStyleRailCard } from "@/components/LibraryBannerStrip";
import { WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";
import WorkoutLibraryShell from "@/components/WorkoutLibraryShell";
import type { MovementLayoutDTO } from "@/lib/movement-layout-types";

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

export default function WorkoutLibrarySection({
  movementLayout,
}: {
  movementLayout: MovementLayoutDTO;
}) {
  return (
    <WorkoutLibraryShell
      movementLayout={movementLayout}
      libraryRail={
        <>
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
        </>
      }
    />
  );
}
