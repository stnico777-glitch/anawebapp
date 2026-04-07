import { PRAYER_COVER_PATHS } from "@/constants/prayerCovers";
import type {
  AudioCollectionCardDTO,
  AudioEssentialTileDTO,
  MusicSpotlightAlbumDTO,
} from "@/lib/audio-layout-types";

const PLAN_HREF = "/prayer#prayer-library";

/** Fallback when the database has no rows yet (e.g. before seed). Ids are not stable for admin APIs. */
export const DEFAULT_AUDIO_COLLECTION_CARDS: AudioCollectionCardDTO[] = (
  [
    {
      title: "7 Days of Morning Prayer",
      metaLine: "Plan · 7 sessions",
      image: PRAYER_COVER_PATHS[6],
      summary:
        "Gentle guided openings for the first week—short listens you can stack daily or repeat when mornings feel full.",
    },
    {
      title: "Peace & Stillness Series",
      metaLine: "Series · 5 sessions",
      image: PRAYER_COVER_PATHS[1],
      summary:
        "Slower tempos and breath-led pauses when you need your nervous system to catch up with your spirit.",
    },
    {
      title: "Anxiety to Rest",
      metaLine: "Journey · 4 sessions",
      image: PRAYER_COVER_PATHS[7],
      summary:
        "Honest prayers that name worry, trade it for truth, and land in a quieter mind before you sleep.",
    },
    {
      title: "Gratitude & Praise",
      metaLine: "Collection · 6 sessions",
      image: PRAYER_COVER_PATHS[0],
      summary:
        "Celebrate small wins and big mercy—audio that turns your attention toward what God is already doing.",
    },
    {
      title: "Sabbath Soul Sundays",
      metaLine: "Rest · 3 sessions",
      image: PRAYER_COVER_PATHS[5],
      summary:
        "Lower volume, fewer words, more room—ideal when you want rest without rushing back to the week.",
    },
    {
      title: "Affirmations Intensive",
      metaLine: "Challenge · 7 sessions",
      image: PRAYER_COVER_PATHS[3],
      summary:
        "Short declarative listens you can loop while driving, walking, or folding laundry—truth on repeat.",
    },
    {
      title: "Scripture Listening Path",
      metaLine: "Audio · 8 sessions",
      image: PRAYER_COVER_PATHS[4],
      summary:
        "Let the Word read to you—clean pacing and space between phrases so sentences can land.",
    },
    {
      title: "Evening Wind-Down",
      metaLine: "Night · 5 sessions",
      image: PRAYER_COVER_PATHS[0],
      summary:
        "Unhook from the day with slower voice and softer music—bridge the gap between doing and sleeping.",
    },
    {
      title: "Healing & Hope",
      metaLine: "Focus · 4 sessions",
      image: PRAYER_COVER_PATHS[2],
      summary:
        "When you’re tender-hearted but still believing—honest language and steady reminders you’re held.",
    },
  ] as const
).map((p, i) => ({
  id: `default-collection-${i}`,
  title: p.title,
  metaLine: p.metaLine,
  imageUrl: p.image,
  summary: p.summary,
  linkHref: PLAN_HREF,
  sortOrder: i,
}));

export const DEFAULT_AUDIO_ESSENTIAL_TILES: AudioEssentialTileDTO[] = [
  {
    id: "default-essential-0",
    title: "Guided prayer",
    subtitle: "stillness · presence · breath",
    imageUrl: PRAYER_COVER_PATHS[5],
    linkHref: PLAN_HREF,
    sortOrder: 0,
  },
  {
    id: "default-essential-1",
    title: "Scripture & stillness",
    subtitle: "listen · rest · renew",
    imageUrl: "/music-spotlight/02-creation-vinyl.png",
    linkHref: PLAN_HREF,
    sortOrder: 1,
  },
];

export const DEFAULT_MUSIC_SPOTLIGHT_ALBUMS: MusicSpotlightAlbumDTO[] = [
  {
    id: "default-spotlight-0",
    title: "Trust in God",
    artist: "feat. Chris Brown",
    coverUrl: "/music-spotlight/01-trust-in-god.png",
    listenUrl: null,
    sortOrder: 0,
  },
  {
    id: "default-spotlight-1",
    title: "The Gift of Sound",
    artist: "Sunday Hymnal",
    coverUrl: "/music-spotlight/02-creation-vinyl.png",
    listenUrl: null,
    sortOrder: 1,
  },
  {
    id: "default-spotlight-2",
    title: "Scratch the Amen",
    artist: "DJ Whiskers",
    coverUrl: "/music-spotlight/03-dj-cat.png",
    listenUrl: null,
    sortOrder: 2,
  },
  {
    id: "default-spotlight-3",
    title: "No Longer Bound",
    artist: "Rise Collective",
    coverUrl: "/music-spotlight/04-no-longer-bound.png",
    listenUrl: null,
    sortOrder: 3,
  },
  {
    id: "default-spotlight-4",
    title: "Out on the Water",
    artist: "Selah Blue",
    coverUrl: "/music-spotlight/05-ocean-solitude.png",
    listenUrl: null,
    sortOrder: 4,
  },
  {
    id: "default-spotlight-5",
    title: "God Is Good",
    artist: "Glow Worship",
    coverUrl: "/music-spotlight/06-god-is-good.png",
    listenUrl: null,
    sortOrder: 5,
  },
  {
    id: "default-spotlight-6",
    title: "Through the Veil",
    artist: "Cloud & Crown",
    coverUrl: "/music-spotlight/07-heaven-gaze.png",
    listenUrl: null,
    sortOrder: 6,
  },
  {
    id: "default-spotlight-7",
    title: "Neon Psalms",
    artist: "Retro Saints",
    coverUrl: "/music-spotlight/08-night-drive.png",
    listenUrl: null,
    sortOrder: 7,
  },
];
