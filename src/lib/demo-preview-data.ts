/**
 * Preview-only content when the DB is empty or unavailable (e.g. Vercel without Turso).
 * Mirrors `prisma/seed.ts` so the live site matches a seeded local dev DB for layout review.
 */

import type { DailyVerse } from "@prisma/client";
import type { CommunityFeedItem } from "@/lib/community-feed";
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

const demoPrayTargets = [3, 12, 5, 20, 8, 1, 14, 7, 9];
const demoEncTargets = [2, 5, 1, 8, 3, 4, 6, 2, 7];
const demoCelTargets = [4, 14, 6, 18, 9, 2, 11, 5, 16, 7, 12, 20];

const PRAYER_SEED_CONTENT: { content: string; authorName: string; daysAgo: number }[] = [
  {
    content:
      "Please pray for my sister’s health. She’s going through a difficult season and we’re trusting God for healing. Thank you ♡",
    authorName: "Megan",
    daysAgo: 0,
  },
  {
    content:
      "Closer relationship with Jesus. I want to hear His voice more clearly and follow where He leads.",
    authorName: "James",
    daysAgo: 1,
  },
  {
    content:
      "Dear Lord, I need Your guidance with a big decision at work. Please walk with me in clarity and peace.",
    authorName: "Rachel",
    daysAgo: 1,
  },
  {
    content:
      "Praying for my family—that we would grow in faith together and support each other. Grateful for this community ♡",
    authorName: "David",
    daysAgo: 2,
  },
  {
    content:
      "Thank you for your prayers. My mom’s surgery went well. Please keep praying for her recovery.",
    authorName: "Sarah",
    daysAgo: 2,
  },
  {
    content:
      "Strength for the week ahead. Body, mind, and spirit—I want to honor God in all of it.",
    authorName: "Chris",
    daysAgo: 3,
  },
  {
    content:
      "Please pray for peace in our home. We’re going through some tension and need God’s grace to lead.",
    authorName: "Elena",
    daysAgo: 4,
  },
  {
    content:
      "Wisdom as a parent. I want to point my kids to Jesus and love them well. ♡",
    authorName: "Michael",
    daysAgo: 5,
  },
  {
    content:
      "Thankful for this prayer wall. Please pray that I would stay consistent in my quiet time and movement.",
    authorName: "Jordan",
    daysAgo: 6,
  },
];

const PRAISE_SEED_CONTENT: { content: string; authorName: string; daysAgo: number }[] = [
  {
    content:
      "God answered prayer — my contract renewal came through! Thank you for standing with me in faith.",
    authorName: "Taylor",
    daysAgo: 0,
  },
  {
    content:
      "A whole month sober. Grateful to Jesus and this community for every encouraging word.",
    authorName: "Alex",
    daysAgo: 0,
  },
  {
    content:
      "We welcomed our daughter this week. Healthy, strong, and so loved. Praise God from whom all blessings flow.",
    authorName: "Priya",
    daysAgo: 1,
  },
  {
    content:
      "Finally made peace with my sister after years of distance. Only God could have softened both of our hearts.",
    authorName: "Marcus",
    daysAgo: 1,
  },
  {
    content:
      "Passed my board exam on the second try. Studied with scriptures plastered on the wall — He is faithful.",
    authorName: "Nina",
    daysAgo: 2,
  },
  {
    content:
      "Church small group feels like family now. Didn’t think I’d ever belong somewhere again — He restores.",
    authorName: "Leo",
    daysAgo: 2,
  },
  {
    content:
      "Rain after a long drought, literally and spiritually. Fields and soul both drinking it in.",
    authorName: "Aisha",
    daysAgo: 3,
  },
  {
    content:
      "Ten years married today. Through valleys and mountaintops, grace has carried us. Celebrating Jesus.",
    authorName: "Jon + Beth",
    daysAgo: 4,
  },
  {
    content:
      "First paycheck from the new career path. Scared to leap; God caught me. Grateful isn’t big enough.",
    authorName: "Sam",
    daysAgo: 0,
  },
  {
    content:
      "Our foster placement became adoption final today. The judge cried. We all did. God is kind.",
    authorName: "Renee",
    daysAgo: 1,
  },
  {
    content:
      "Tumor markers came back clear. Still processing the gift. Thank you for praying when I couldn’t speak.",
    authorName: "Damon",
    daysAgo: 1,
  },
  {
    content:
      "Spoke at youth night — three kids stayed after to pray. That’s the win. Not my talk; His presence.",
    authorName: "Imani",
    daysAgo: 2,
  },
];

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export function getDemoCommunityFeedItems(): CommunityFeedItem[] {
  const prayers: CommunityFeedItem[] = PRAYER_SEED_CONTENT.map((p, i) => ({
    kind: "prayer",
    id: `demo-feed-prayer-${i}`,
    content: p.content,
    authorName: p.authorName,
    createdAt: isoDaysAgo(p.daysAgo),
    commentCount: i % 4,
    counts: {
      pray: demoPrayTargets[i % demoPrayTargets.length]!,
      like: 2 + (i % 5),
      encourage: demoEncTargets[i % demoEncTargets.length]!,
    },
    viewer: { pray: false, like: false, encourage: null },
  }));

  const praises: CommunityFeedItem[] = PRAISE_SEED_CONTENT.map((p, i) => ({
    kind: "praise",
    id: `demo-feed-praise-${i}`,
    content: p.content,
    authorName: p.authorName,
    createdAt: isoDaysAgo(p.daysAgo),
    commentCount: i % 3,
    counts: { celebrate: demoCelTargets[i % demoCelTargets.length]! },
    viewer: { celebrated: false },
  }));

  const merged = [...prayers, ...praises];
  merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return merged;
}

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

