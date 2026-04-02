import { PRAYER_COVER_PATHS } from "./prayerCovers";

/** Album art used in Christian music spotlight (same files). */
export const MUSIC_SPOTLIGHT_COVER_PATHS = [
  "/music-spotlight/01-trust-in-god.png",
  "/music-spotlight/02-creation-vinyl.png",
  "/music-spotlight/03-dj-cat.png",
  "/music-spotlight/04-no-longer-bound.png",
  "/music-spotlight/05-ocean-solitude.png",
  "/music-spotlight/06-god-is-good.png",
  "/music-spotlight/07-heaven-gaze.png",
  "/music-spotlight/08-night-drive.png",
] as const;

/** Workout / movement stills to blend into the audio library rail. */
export const WORKOUT_STYLE_COVER_PATHS = [
  "/weekly-workouts.png",
  "/weekly-workouts2.png",
  "/weekly-workouts3.png",
  "/day-previews/beachstretch.png",
  "/placeholders/yoga-ocean-forearm.png",
  "/placeholders/pilates-stretch-flow.png",
  "/placeholders/pilates-reformer-stretch.png",
  "/placeholders/pilates-strong.png",
] as const;

/**
 * One full pass: lofi prayer → album → workout, repeated.
 * Use for DB seed (by title) and `FALLBACK_COVERS` modulo order.
 */
export function buildAudioLibraryMixedCoverCycle(): string[] {
  const out: string[] = [];
  for (let i = 0; i < 8; i++) {
    out.push(
      PRAYER_COVER_PATHS[i],
      MUSIC_SPOTLIGHT_COVER_PATHS[i],
      WORKOUT_STYLE_COVER_PATHS[i],
    );
  }
  return out;
}

export const AUDIO_LIBRARY_MIXED_COVER_CYCLE = buildAudioLibraryMixedCoverCycle();

/** `orderBy: title asc` — one cover per session from the mixed cycle. */
export const AUDIO_LIBRARY_SEED_COVER_BY_TITLE: Record<string, string> = {
  "Affirmations for today": AUDIO_LIBRARY_MIXED_COVER_CYCLE[0],
  "Blessing body and spirit": AUDIO_LIBRARY_MIXED_COVER_CYCLE[1],
  "Calm the storm inside": AUDIO_LIBRARY_MIXED_COVER_CYCLE[2],
  "Courage to begin": AUDIO_LIBRARY_MIXED_COVER_CYCLE[3],
  "Evening prayer": AUDIO_LIBRARY_MIXED_COVER_CYCLE[4],
  "Forgive and release": AUDIO_LIBRARY_MIXED_COVER_CYCLE[5],
  "Gratitude pause": AUDIO_LIBRARY_MIXED_COVER_CYCLE[6],
  "Healing hope": AUDIO_LIBRARY_MIXED_COVER_CYCLE[7],
  "Joy in the journey": AUDIO_LIBRARY_MIXED_COVER_CYCLE[8],
  "Morning mercy": AUDIO_LIBRARY_MIXED_COVER_CYCLE[9],
  "Prayer for peace": AUDIO_LIBRARY_MIXED_COVER_CYCLE[10],
  "Release anxiety": AUDIO_LIBRARY_MIXED_COVER_CYCLE[11],
  "Sabbath heart": AUDIO_LIBRARY_MIXED_COVER_CYCLE[12],
  "Scripture meditation": AUDIO_LIBRARY_MIXED_COVER_CYCLE[13],
  "Sleep well tonight": AUDIO_LIBRARY_MIXED_COVER_CYCLE[14],
  "Strength for the week": AUDIO_LIBRARY_MIXED_COVER_CYCLE[15],
  "Wait on the Lord": AUDIO_LIBRARY_MIXED_COVER_CYCLE[16],
};
