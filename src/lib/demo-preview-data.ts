/**
 * Preview-only content when the DB is empty or unavailable (e.g. Vercel without Turso).
 * Mirrors `prisma/seed.ts` so the live site matches a seeded local dev DB for layout review.
 */

import type { DailyVerse } from "@prisma/client";
import { DAY_NAMES, WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";
import { getDefaultScheduleDaysForSeed } from "@/lib/schedule-default-week";
import { utcMondayMidnightForInstant } from "@/lib/weekScheduleCalendar";
import { toEntryDate } from "@/lib/journal";
import { AUDIO_LIBRARY_SEED_COVER_BY_TITLE } from "@/constants/audioLibraryCovers";

const DEMO_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export type DemoWorkoutListRow = {
  id: string;
  title: string;
  duration: number;
  category: string | null;
  thumbnailUrl: string | null;
  scripture: string | null;
};

/** Same titles/order as `prisma/seed.ts` `initialWorkouts`. */
export const DEMO_WORKOUT_ROWS: DemoWorkoutListRow[] = [
  {
    id: "demo-workout-morning-strength",
    title: "Morning Strength",
    duration: 20,
    category: "Strength",
    thumbnailUrl: null,
    scripture: "Philippians 4:13",
  },
  {
    id: "demo-workout-cardio-blast",
    title: "Cardio Blast",
    duration: 15,
    category: "Cardio",
    thumbnailUrl: null,
    scripture: null,
  },
  {
    id: "demo-workout-restorative-yoga",
    title: "Restorative Yoga",
    duration: 25,
    category: "Yoga",
    thumbnailUrl: null,
    scripture: "Psalm 46:10",
  },
  {
    id: "demo-workout-pilates-core",
    title: "Pilates Core",
    duration: 22,
    category: "Pilates",
    thumbnailUrl: null,
    scripture: "Isaiah 40:31",
  },
  {
    id: "demo-workout-hiit-burn",
    title: "HIIT Burn",
    duration: 18,
    category: "HIIT",
    thumbnailUrl: null,
    scripture: null,
  },
  {
    id: "demo-workout-evening-stretch",
    title: "Evening Stretch",
    duration: 15,
    category: "Stretch",
    thumbnailUrl: null,
    scripture: "Psalm 23:1-3",
  },
  {
    id: "demo-workout-full-body-flow",
    title: "Full Body Flow",
    duration: 30,
    category: "Full Body",
    thumbnailUrl: null,
    scripture: null,
  },
  {
    id: "demo-workout-quick-cardio",
    title: "Quick Cardio",
    duration: 10,
    category: "Cardio",
    thumbnailUrl: null,
    scripture: null,
  },
  {
    id: "demo-workout-gentle-yoga",
    title: "Gentle Yoga",
    duration: 20,
    category: "Yoga",
    thumbnailUrl: null,
    scripture: "Matthew 11:28",
  },
].map((w, i) => ({
  ...w,
  thumbnailUrl: w.thumbnailUrl ?? WEEKLY_DAY_CARD_IMAGES[i % WEEKLY_DAY_CARD_IMAGES.length],
}));

function prayerSeedRow(
  title: string,
  description: string,
  scripture: string,
  duration: number,
) {
  return {
    id: `demo-prayer-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "session"}`,
    title,
    description,
    scripture,
    audioUrl: DEMO_AUDIO,
    duration,
    coverImageUrl:
      AUDIO_LIBRARY_SEED_COVER_BY_TITLE[title] ?? "/prayer-covers/01-rooftop-twilight.png",
  };
}

/** Same sessions as `prisma/seed.ts` `initialPrayerAudios` (subset for bundle size). */
export const DEMO_PRAYER_LIBRARY = [
  prayerSeedRow(
    "Affirmations for today",
    "Speak life over your morning",
    "Philippians 4:8",
    180,
  ),
  prayerSeedRow(
    "Prayer for peace",
    "Stillness when your mind won’t stop",
    "John 14:27",
    300,
  ),
  prayerSeedRow(
    "Release anxiety",
    "Lay worry down; breathe and pray",
    "1 Peter 5:7",
    240,
  ),
  prayerSeedRow(
    "Gratitude pause",
    "Short reset—with thanks",
    "Psalm 100:4",
    200,
  ),
  prayerSeedRow(
    "Strength for the week",
    "Courage and endurance",
    "Isaiah 40:31",
    260,
  ),
  prayerSeedRow(
    "Sleep well tonight",
    "Hand today to God; rest deep",
    "Psalm 4:8",
    220,
  ),
  prayerSeedRow(
    "Morning mercy",
    "Fresh mercy before the day",
    "Lamentations 3:22-23",
    195,
  ),
  prayerSeedRow(
    "Healing hope",
    "Prayer for heart and body",
    "James 5:15",
    320,
  ),
  prayerSeedRow(
    "Forgive and release",
    "Let go; walk lighter",
    "Colossians 3:13",
    275,
  ),
  prayerSeedRow(
    "Courage to begin",
    "When you’re afraid to start",
    "Joshua 1:9",
    210,
  ),
  prayerSeedRow(
    "Wait on the Lord",
    "Patience in the in-between",
    "Psalm 27:14",
    285,
  ),
  prayerSeedRow(
    "Joy in the journey",
    "Delight—not perfection",
    "Psalm 16:11",
    190,
  ),
];

export function getDemoWeekSchedule() {
  const weekStart = utcMondayMidnightForInstant(new Date());
  const seeded = getDefaultScheduleDaysForSeed();
  return {
    id: "demo-week-schedule",
    weekStart,
    createdAt: new Date(),
    updatedAt: new Date(),
    days: seeded.map((d, i) => ({
      id: `demo-schedule-day-${i}`,
      weekScheduleId: "demo-week-schedule",
      dayIndex: d.dayIndex,
      prayerTitle: d.prayerTitle,
      workoutTitle: d.workoutTitle,
      affirmationText: d.affirmationText,
      prayerId: `demo-prayer-audio-${i}`,
      workoutId: DEMO_WORKOUT_ROWS[i]?.id ?? null,
      dayImageUrl: d.dayImageUrl,
      dayVideoUrl: d.dayVideoUrl,
      daySubtext: d.daySubtext,
      completion: null,
    })),
  };
}

export type DemoWeekSchedule = ReturnType<typeof getDemoWeekSchedule>;

export function getDemoDailyVerse(): DailyVerse {
  const now = new Date();
  return {
    id: "demo-daily-verse",
    verseDate: toEntryDate(now),
    reference: "Philippians 4:6-7",
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    translation: "NIV",
    createdAt: now,
    updatedAt: now,
  };
}

