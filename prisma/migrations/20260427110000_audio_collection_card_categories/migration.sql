-- Add category + audioUrl to audio_collection_card and relax meta/summary requirements.
-- Existing rows get the legacy "AFFIRMATIONS" placeholder category; CMS editors can re-bucket
-- them after the migration runs. We DO NOT backfill audio_url so legacy collection cards keep
-- their /prayer#prayer-library navigation behavior until an editor sets a real audio url.

ALTER TABLE "audio_collection_card"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'AFFIRMATIONS',
  ADD COLUMN "audio_url" TEXT NOT NULL DEFAULT '',
  ALTER COLUMN "meta_line" SET DEFAULT '',
  ALTER COLUMN "summary"   SET DEFAULT '';

CREATE INDEX "audio_collection_card_category_sort_order_idx"
  ON "audio_collection_card" ("category", "sort_order");
