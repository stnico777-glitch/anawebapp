-- Music Spotlight feature was removed from the app. The table had no remaining
-- readers or writers, so drop it to keep the schema honest.
DROP TABLE IF EXISTS "music_spotlight_entry";
