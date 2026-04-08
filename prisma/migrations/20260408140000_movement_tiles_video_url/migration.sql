-- Replace navigation href with video URL for Movement hero tiles and Quickie cards.

ALTER TABLE "movement_hero_tile" ADD COLUMN "video_url" TEXT NOT NULL DEFAULT '';
ALTER TABLE "movement_hero_tile" DROP COLUMN "link_href";

ALTER TABLE "movement_quickie_card" ADD COLUMN "video_url" TEXT NOT NULL DEFAULT '';
ALTER TABLE "movement_quickie_card" DROP COLUMN "link_href";
