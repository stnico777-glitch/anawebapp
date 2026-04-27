import { WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";
import type {
  MovementHeroCollectionItemDTO,
  MovementHeroTileDTO,
  MovementLandingCopyDTO,
  MovementQuickieCardDTO,
} from "@/lib/movement-layout-types";

/** Sample stream used for default Movement tiles when the DB has no rows (same family as demo workout preview). */
export const MOVEMENT_SAMPLE_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const DEFAULT_MOVEMENT_LANDING_COPY: MovementLandingCopyDTO = {
  justStartedTagline: "The 6-Day Beginner Pilates Series",
  quickieIntro:
    "Quick little workouts you can squeeze in anytime—short, focused, and easy to stack when you want a little more.",
};

/** Stable fallback id for the default Beginner Pilates collection tile.
 *  Surfaces only when the DB is empty; members always see the 6 default items in that case. */
export const DEFAULT_BEGINNER_PILATES_TILE_ID = "default-hero-beginner-pilates";

const BEGINNER_PILATES_ITEMS: Omit<
  MovementHeroCollectionItemDTO,
  "id" | "heroTileId"
>[] = [
  {
    dayIndex: 1,
    title: "Day 1 · Meet your mat",
    imageUrl: WEEKLY_DAY_CARD_IMAGES[0],
    videoUrl: MOVEMENT_SAMPLE_VIDEO_URL,
    sortOrder: 0,
  },
  {
    dayIndex: 2,
    title: "Day 2 · Breath & neutral spine",
    imageUrl: WEEKLY_DAY_CARD_IMAGES[1],
    videoUrl: MOVEMENT_SAMPLE_VIDEO_URL,
    sortOrder: 1,
  },
  {
    dayIndex: 3,
    title: "Day 3 · Core basics",
    imageUrl: WEEKLY_DAY_CARD_IMAGES[2],
    videoUrl: MOVEMENT_SAMPLE_VIDEO_URL,
    sortOrder: 2,
  },
  {
    dayIndex: 4,
    title: "Day 4 · Lower body foundations",
    imageUrl: WEEKLY_DAY_CARD_IMAGES[3],
    videoUrl: MOVEMENT_SAMPLE_VIDEO_URL,
    sortOrder: 3,
  },
  {
    dayIndex: 5,
    title: "Day 5 · Upper body & posture",
    imageUrl: WEEKLY_DAY_CARD_IMAGES[4],
    videoUrl: MOVEMENT_SAMPLE_VIDEO_URL,
    sortOrder: 4,
  },
  {
    dayIndex: 6,
    title: "Day 6 · Put it together",
    imageUrl: WEEKLY_DAY_CARD_IMAGES[5],
    videoUrl: MOVEMENT_SAMPLE_VIDEO_URL,
    sortOrder: 5,
  },
];

/** Default collection items surfaced when the DB has no rows. Exported so the seeder
 * can populate the real table on first run (see `seedMovementHeroAndQuickieIfEmpty`). */
export const DEFAULT_BEGINNER_PILATES_ITEMS: MovementHeroCollectionItemDTO[] =
  BEGINNER_PILATES_ITEMS.map((item, i) => ({
    id: `default-beginner-pilates-item-${i}`,
    heroTileId: DEFAULT_BEGINNER_PILATES_TILE_ID,
    ...item,
  }));

/** Exactly one hero tile by design: it is the container for the "Just Getting Started"
 *  collection items (Day 1..Day N). Its own title/subtitle/image are no longer rendered to
 *  members — the 6 item cards drive the UI — but we keep the fields populated so the parent
 *  row remains easy to identify in DB tooling and in legacy (pre-items) fallbacks. */
export const DEFAULT_MOVEMENT_HERO_TILES: MovementHeroTileDTO[] = [
  {
    id: DEFAULT_BEGINNER_PILATES_TILE_ID,
    title: "Just Getting Started",
    subtitle: "Beginner Pilates series",
    imageUrl: WEEKLY_DAY_CARD_IMAGES[0],
    videoUrl: "",
    sortOrder: 0,
    items: DEFAULT_BEGINNER_PILATES_ITEMS,
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
