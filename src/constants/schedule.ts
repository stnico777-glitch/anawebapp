/**
 * Shared schedule constants — single source of truth.
 * Used by schedule UI, admin CMS, and schedule lib.
 */
export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayName = (typeof DAY_NAMES)[number];

/** Workout focus per day (Mon–Sat) for schedule display / split. */
export const WORKOUT_SPLIT = [
  "Strength",
  "Cardio",
  "Yoga",
  "Pilates",
  "Full Body",
  "Stretch & Recovery",
] as const;

/** Mon–Sat hero art: homepage grid + /schedule cards stay in sync */
export const WEEKLY_DAY_CARD_IMAGES = [
  "/placeholders/pilates-strong.png",
  "/placeholders/soft-core-stillness.png",
  "/weekly-workouts2.png",
  "/placeholders/pilates-stretch-flow.png",
  "/weekly-workouts3.png",
  "/placeholders/yoga-ocean-forearm.png",
] as const;
