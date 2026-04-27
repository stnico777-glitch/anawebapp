-- Movement hero tiles become collections. Each tile can own a set of numbered "day"
-- entries (e.g. Day 1..Day 6 of a beginner series) that render in a collection view
-- when the user clicks "Explore". Schema is intentionally similar to
-- `movement_quickie_card` so the CMS can reuse the same image/video upload flow.

CREATE TABLE "movement_hero_collection_item" (
    "id"            UUID         NOT NULL,
    "hero_tile_id"  UUID         NOT NULL,
    "day_index"     INTEGER      NOT NULL,
    "title"         TEXT         NOT NULL,
    "image_url"     TEXT         NOT NULL,
    "video_url"     TEXT         NOT NULL DEFAULT '',
    "sort_order"    INTEGER      NOT NULL DEFAULT 0,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "movement_hero_collection_item_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "movement_hero_collection_item_tile_day_unique"
    ON "movement_hero_collection_item" ("hero_tile_id", "day_index");

CREATE INDEX "movement_hero_collection_item_tile_sort_idx"
    ON "movement_hero_collection_item" ("hero_tile_id", "sort_order");

ALTER TABLE "movement_hero_collection_item"
    ADD CONSTRAINT "movement_hero_collection_item_hero_tile_id_fkey"
    FOREIGN KEY ("hero_tile_id") REFERENCES "movement_hero_tile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
