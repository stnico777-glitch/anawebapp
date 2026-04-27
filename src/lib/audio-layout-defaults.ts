import {
  type AudioCollectionCardDTO,
  type AudioCollectionCategory,
  type AudioEssentialTileDTO,
} from "@/lib/audio-layout-types";

const PLAN_HREF = "/prayer#prayer-library";

/** Placeholder audio used by every default card so the bottom mini-player has something to play
 *  before editors wire up real recordings via the CMS. */
const PLACEHOLDER_AUDIO_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

/** Gradient cover thumbnails uploaded to the Supabase `audio thumbnails` public bucket.
 *  The bucket name has a space, hence the `%20` URL encoding; we use percent-encoded
 *  filenames (e.g. `10%20(1).png`) so any subsequent path normalization does not break them. */
const SUPABASE_AUDIO_THUMBNAIL_BASE =
  "https://zzndnyvonsvxbkcplewo.supabase.co/storage/v1/object/public/audio%20thumbnails";

const SUPABASE_GRADIENT_COVERS = [
  `${SUPABASE_AUDIO_THUMBNAIL_BASE}/2.png`,
  `${SUPABASE_AUDIO_THUMBNAIL_BASE}/3.png`,
  `${SUPABASE_AUDIO_THUMBNAIL_BASE}/4.png`,
  `${SUPABASE_AUDIO_THUMBNAIL_BASE}/5.png`,
  `${SUPABASE_AUDIO_THUMBNAIL_BASE}/6.png`,
  `${SUPABASE_AUDIO_THUMBNAIL_BASE}/7.png`,
  `${SUPABASE_AUDIO_THUMBNAIL_BASE}/8.png`,
  `${SUPABASE_AUDIO_THUMBNAIL_BASE}/9.png`,
  `${SUPABASE_AUDIO_THUMBNAIL_BASE}/10%20(1).png`,
];

/** Cycles through the Supabase gradient covers so each card gets a different gradient.
 *  Starts at a category-specific offset so the three rails don't all open with the same cover. */
function coverFor(category: AudioCollectionCategory, index: number): string {
  const offsetByCategory: Record<AudioCollectionCategory, number> = {
    AFFIRMATIONS: 0,
    SCRIPTURE_READING: 3,
    MEDITATIONS: 5,
  };
  const offset = offsetByCategory[category] ?? 0;
  return SUPABASE_GRADIENT_COVERS[
    (offset + index) % SUPABASE_GRADIENT_COVERS.length
  ]!;
}

/** Source-of-truth for the three default audio rails. Editors can re-order, edit, and add
 *  cards via the admin CMS once seeded — these only seed an empty database. */
const DEFAULT_CARDS: Array<{ category: AudioCollectionCategory; title: string }> = [
  { category: "AFFIRMATIONS", title: "Getting Ready" },
  { category: "AFFIRMATIONS", title: "Before a Date" },
  { category: "AFFIRMATIONS", title: "Before a Test" },
  { category: "AFFIRMATIONS", title: "When You Feel Anxious" },
  { category: "AFFIRMATIONS", title: "For Comfort" },
  { category: "AFFIRMATIONS", title: "For Boldness" },
  { category: "AFFIRMATIONS", title: "Morning Affirmations" },
  { category: "AFFIRMATIONS", title: "Before Bed" },
  { category: "AFFIRMATIONS", title: "Embracing God's Love" },
  { category: "AFFIRMATIONS", title: "Receiving God's Grace" },
  { category: "AFFIRMATIONS", title: "When You Feel Lonely" },
  { category: "AFFIRMATIONS", title: "Body Image & Self-Worth" },
  { category: "AFFIRMATIONS", title: "Walking in Purity" },
  { category: "AFFIRMATIONS", title: "In a Season of Waiting" },
  { category: "AFFIRMATIONS", title: "When You Need Clarity" },
  { category: "AFFIRMATIONS", title: "When You Feel Burnt Out" },
  { category: "AFFIRMATIONS", title: "Trusting God" },
  { category: "AFFIRMATIONS", title: "Healing Your Body" },
  { category: "AFFIRMATIONS", title: "Walking in Fearlessness" },
  { category: "AFFIRMATIONS", title: "Posting on Social Media" },
  { category: "AFFIRMATIONS", title: "Before You Eat" },

  { category: "SCRIPTURE_READING", title: "The Beatitudes" },
  { category: "SCRIPTURE_READING", title: "Psalms Series" },
  { category: "SCRIPTURE_READING", title: "The Gospel of John" },
  { category: "SCRIPTURE_READING", title: "Paul's Letters" },

  { category: "MEDITATIONS", title: "Nailing Shame to the Cross" },
  { category: "MEDITATIONS", title: "At the Feet of Jesus" },
  { category: "MEDITATIONS", title: "God's Unfailing Love" },
  { category: "MEDITATIONS", title: "Stillness & Presence" },
  { category: "MEDITATIONS", title: "The Breath of the Lord" },
  { category: "MEDITATIONS", title: "Surrender & Trust" },
  { category: "MEDITATIONS", title: "Reflecting on God's Character" },
  { category: "MEDITATIONS", title: "Forgiveness & Freedom" },
  { category: "MEDITATIONS", title: "Walking on Water (Walking Meditation)" },
  { category: "MEDITATIONS", title: "Walking Into Your Purpose (Walking Meditation)" },
  { category: "MEDITATIONS", title: "Letting Go of Your Past (Walking Meditation)" },
];

/** Per-category running indices used to (a) pick a unique cover and (b) keep sortOrder stable
 *  inside each rail. Without per-category indexing, the global index would skew rail ordering. */
function buildDefaults(): AudioCollectionCardDTO[] {
  const counts: Record<AudioCollectionCategory, number> = {
    AFFIRMATIONS: 0,
    SCRIPTURE_READING: 0,
    MEDITATIONS: 0,
  };
  return DEFAULT_CARDS.map((card, i) => {
    const idx = counts[card.category]++;
    return {
      id: `default-collection-${i}`,
      category: card.category,
      title: card.title,
      metaLine: "",
      imageUrl: coverFor(card.category, idx),
      summary: "",
      audioUrl: PLACEHOLDER_AUDIO_URL,
      linkHref: PLAN_HREF,
      sortOrder: idx,
    };
  });
}

/** Fallback when the database has no rows yet (e.g. before seed). Ids are not stable for admin APIs. */
export const DEFAULT_AUDIO_COLLECTION_CARDS: AudioCollectionCardDTO[] = buildDefaults();

/** Essentials tiles — kept available for admin/legacy consumers, not rendered on the member
 *  prayer page anymore. Safe to delete the table + this constant entirely once the admin
 *  CMS removes the corresponding section. */
export const DEFAULT_AUDIO_ESSENTIAL_TILES: AudioEssentialTileDTO[] = [];
