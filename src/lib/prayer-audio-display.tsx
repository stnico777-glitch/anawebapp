/**
 * Prayer audio UI helpers — re-exports for backwards compatibility.
 * Prefer importing from `@/lib/prayer-audio-covers` or `@/components/CatalogCoverImage` directly.
 */
export {
  type PrayerLibraryItem,
  normalizeCoverImageUrl,
  PRAYER_COVER_FALLBACK_SRC,
  formatDurationMins,
  coverForPrayer,
  railCoversDeduped,
  prayerMetaLine,
  prayerHoverSummary,
} from "@/lib/prayer-audio-covers";

export { CatalogCoverImage } from "@/components/CatalogCoverImage";
