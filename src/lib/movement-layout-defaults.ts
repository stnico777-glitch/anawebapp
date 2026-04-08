import { WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";
import type {
  MovementHeroTileDTO,
  MovementLandingCopyDTO,
  MovementQuickieCardDTO,
} from "@/lib/movement-layout-types";

/** Sample stream used for default Movement tiles when the DB has no rows (same family as demo workout preview). */
export const MOVEMENT_SAMPLE_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const DEFAULT_MOVEMENT_LANDING_COPY: MovementLandingCopyDTO = {
  justStartedTagline: "Just getting started - Beginner to Pilates",
  quickieIntro:
    "Quick little workouts you can squeeze in anytime—short, focused, and easy to stack when you want a little more.",
};

export const DEFAULT_MOVEMENT_HERO_TILES: MovementHeroTileDTO[] = [
  {
    id: "default-hero-0",
    title: "Power training",
    subtitle: "strength · focus · endurance",
    imageUrl: WEEKLY_DAY_CARD_IMAGES[0],
    videoUrl: MOVEMENT_SAMPLE_VIDEO_URL,
    sortOrder: 0,
  },
  {
    id: "default-hero-1",
    title: "Flow & mobility",
    subtitle: "breath · length · ease",
    imageUrl: WEEKLY_DAY_CARD_IMAGES[1],
    videoUrl: MOVEMENT_SAMPLE_VIDEO_URL,
    sortOrder: 1,
  },
];

const QUICKIE_SEED = (
  [
    {
      title: "Pilates 101: Start here",
      metaLine: "Beginner · 4 sessions",
      summary:
        "Meet the basics without overwhelm—breath, neutral spine, and a few moves you can repeat until they feel second nature.",
    },
    {
      title: "Core & control basics",
      metaLine: "Foundations · 5 sessions",
      summary:
        "Slow, precise layers that teach control before speed—ideal when you want Pilates to feel steady, not flashy.",
    },
    {
      title: "Strong at any pace",
      metaLine: "Strength · 4 sessions",
      summary:
        "Build confidence with clear progressions—small ranges, big intention, and space to reset between sets.",
    },
    {
      title: "Ease in & breathe",
      metaLine: "Restorative · 3 sessions",
      summary:
        "Gentle flows when you’re new to the work—soft music, longer exhales, and permission to keep it simple.",
    },
    {
      title: "Form over reps",
      metaLine: "Technique · 4 sessions",
      summary:
        "Short sessions that zoom in on setup and alignment so every class after lands smarter and safer.",
    },
    {
      title: "Your first month map",
      metaLine: "Plan · 6 sessions",
      summary:
        "A week-by-week taste of mat and strength work—enough variety to stay curious, not enough to burn out.",
    },
  ] as const
).map((p, i) => ({
  id: `default-quickie-${i}`,
  title: p.title,
  metaLine: p.metaLine,
  imageUrl: WEEKLY_DAY_CARD_IMAGES[i % WEEKLY_DAY_CARD_IMAGES.length],
  summary: p.summary,
  videoUrl: MOVEMENT_SAMPLE_VIDEO_URL,
  sortOrder: i,
}));

export const DEFAULT_MOVEMENT_QUICKIE_CARDS: MovementQuickieCardDTO[] = QUICKIE_SEED;
