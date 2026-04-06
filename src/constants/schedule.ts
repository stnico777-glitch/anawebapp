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

/** Movement session titles (Mon–Sat): homepage grid, schedule tab, seed defaults. */
export const WORKOUT_SPLIT = [
  "Praise + Full Body Sculpt",
  "Walking in Freedom - Lower Body",
  "Arms lifted in Intercession",
  "Identity from the core",
  "Praise + Petition",
  "Bonus Classic flow",
] as const;

/** Sunday card on the homepage weekly grid (seventh tile). */
export const SUNDAY_WORKOUT_NAME = "Sabbath" as const;

/** Mon–Sat hero art: homepage grid + /schedule cards stay in sync */
export const WEEKLY_DAY_CARD_IMAGES = [
  "/schedule/week-mon.png",
  "/schedule/week-tue.png",
  "/schedule/week-wed.png",
  "/schedule/week-thu.png",
  "/schedule/week-fri.png",
  "/schedule/week-sat.png",
] as const;
