import { DAY_NAMES, WEEKLY_DAY_CARD_IMAGES, WORKOUT_SPLIT } from "@/constants/schedule";

/**
 * Single source for Mon–Sat schedule card content shown in the app (and written by `prisma/seed`).
 * Keeps DB-backed weeks aligned with `WEEKLY_DAY_CARD_IMAGES` and `WORKOUT_SPLIT` in constants.
 */
export function getDefaultScheduleDaysForSeed() {
  return DAY_NAMES.map((name, i) => ({
    dayIndex: i,
    prayerTitle: `Morning Prayer – ${name}`,
    workoutTitle: WORKOUT_SPLIT[i]!,
    affirmationText: `"I am strong in body and spirit." – Day ${i + 1}`,
    /** Stored in DB so CMS + clients match; same paths as `ScheduleDayCard` fallback. */
    dayImageUrl: WEEKLY_DAY_CARD_IMAGES[i]!,
    dayVideoUrl: null as string | null,
    daySubtext: null as string | null,
  }));
}
