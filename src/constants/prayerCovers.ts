/**
 * Curated lofi illustration covers for prayer / audio (files in `public/prayer-covers/`).
 * Keep filenames stable; swap assets by replacing files without renaming.
 */
export const PRAYER_COVER_PATHS = [
  "/prayer-covers/01-rooftop-twilight.png",
  "/prayer-covers/02-bedroom-window.png",
  "/prayer-covers/03-beach-sunset-walk.png",
  "/prayer-covers/04-jeep-sunset.png",
  "/prayer-covers/05-harbor-window.png",
  "/prayer-covers/06-rooftop-moon.png",
  "/prayer-covers/07-open-road-sunset.png",
  "/prayer-covers/08-sleep-headphones.png",
] as const;

export type PrayerCoverPath = (typeof PRAYER_COVER_PATHS)[number];
