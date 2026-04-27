/** The three categorized rails shown on the prayer/audio page. Stored as a string (not enum)
 *  in the DB so editors can introduce a new bucket without a schema migration; UI only renders
 *  the three known values below in the order declared here. */
export const AUDIO_COLLECTION_CATEGORIES = [
  "AFFIRMATIONS",
  "SCRIPTURE_READING",
  "MEDITATIONS",
] as const;
export type AudioCollectionCategory = (typeof AUDIO_COLLECTION_CATEGORIES)[number];

export const AUDIO_COLLECTION_CATEGORY_LABELS: Record<AudioCollectionCategory, string> = {
  AFFIRMATIONS: "Affirmations",
  SCRIPTURE_READING: "Scripture Reading",
  MEDITATIONS: "Meditations",
};

export type AudioCollectionCardDTO = {
  id: string;
  category: AudioCollectionCategory;
  title: string;
  metaLine: string;
  imageUrl: string;
  summary: string;
  /** When non-empty, clicking the card plays this audio in the bottom mini-player.
   *  When empty, the card navigates to `linkHref` (legacy collection-page link). */
  audioUrl: string;
  linkHref: string;
  sortOrder: number;
};

export type AudioEssentialTileDTO = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkHref: string;
  sortOrder: number;
};
