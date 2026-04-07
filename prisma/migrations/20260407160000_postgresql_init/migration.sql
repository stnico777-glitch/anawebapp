-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PrayerJournalStatus" AS ENUM ('ACTIVE', 'ANSWERED', 'PAUSED');

-- CreateEnum
CREATE TYPE "PrayerReminderCadence" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "PrayerRequestInteractionKind" AS ENUM ('PRAY', 'LIKE', 'ENCOURAGE');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "is_subscriber" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "week_schedule" (
    "id" UUID NOT NULL,
    "week_start" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "week_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_day" (
    "id" UUID NOT NULL,
    "week_schedule_id" UUID NOT NULL,
    "day_index" INTEGER NOT NULL,
    "prayer_title" TEXT,
    "prayer_id" UUID,
    "workout_title" TEXT,
    "workout_id" UUID,
    "affirmation_text" TEXT,
    "day_image_url" TEXT,
    "day_video_url" TEXT,
    "day_subtext" TEXT,

    CONSTRAINT "schedule_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_day_completion" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "schedule_day_id" UUID NOT NULL,
    "prayer_done" BOOLEAN NOT NULL DEFAULT false,
    "workout_done" BOOLEAN NOT NULL DEFAULT false,
    "affirmation_done" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "user_day_completion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "instructor" TEXT,
    "duration" INTEGER NOT NULL,
    "category" TEXT,
    "scripture" TEXT,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_workout_completion" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workout_id" UUID NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_workout_completion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_audio" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scripture" TEXT,
    "audio_url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "cover_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_audio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_prayer_completion" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "prayer_id" UUID NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_prayer_completion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_journal_entry" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "status" "PrayerJournalStatus" NOT NULL DEFAULT 'ACTIVE',
    "answered_at" TIMESTAMP(3),
    "answer_note" TEXT,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_journal_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_reminder" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "prayer_journal_entry_id" UUID,
    "label" TEXT NOT NULL,
    "cadence" "PrayerReminderCadence" NOT NULL,
    "time_local" TEXT NOT NULL,
    "week_day" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_verse" (
    "id" UUID NOT NULL,
    "verse_date" TIMESTAMP(3) NOT NULL,
    "reference" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "translation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_verse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_request" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "praise_report" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "praise_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_request_interaction" (
    "id" UUID NOT NULL,
    "prayer_request_id" UUID NOT NULL,
    "user_id" UUID,
    "participant_key" TEXT NOT NULL,
    "kind" "PrayerRequestInteractionKind" NOT NULL,
    "preset_key" TEXT,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_request_interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "praise_report_like" (
    "id" UUID NOT NULL,
    "praise_report_id" UUID NOT NULL,
    "user_id" UUID,
    "participant_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "praise_report_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_request_comment" (
    "id" UUID NOT NULL,
    "prayer_request_id" UUID NOT NULL,
    "participant_key" TEXT NOT NULL,
    "user_id" UUID,
    "author_name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_request_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "praise_report_comment" (
    "id" UUID NOT NULL,
    "praise_report_id" UUID NOT NULL,
    "participant_key" TEXT NOT NULL,
    "user_id" UUID,
    "author_name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "praise_report_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_collection_card" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "meta_line" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "link_href" TEXT NOT NULL DEFAULT '/prayer#prayer-library',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_collection_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_essential_tile" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "link_href" TEXT NOT NULL DEFAULT '/prayer#prayer-library',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_essential_tile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_spotlight_entry" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "listen_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "music_spotlight_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_landing_copy" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "just_started_tagline" TEXT NOT NULL,
    "quickie_intro" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movement_landing_copy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_hero_tile" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "link_href" TEXT NOT NULL DEFAULT '/movement',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movement_hero_tile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_quickie_card" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "meta_line" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "link_href" TEXT NOT NULL DEFAULT '/movement',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movement_quickie_card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_day_week_schedule_id_day_index_key" ON "schedule_day"("week_schedule_id", "day_index");

-- CreateIndex
CREATE UNIQUE INDEX "user_day_completion_user_id_schedule_day_id_key" ON "user_day_completion"("user_id", "schedule_day_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_workout_completion_user_id_workout_id_key" ON "user_workout_completion"("user_id", "workout_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_prayer_completion_user_id_prayer_id_key" ON "user_prayer_completion"("user_id", "prayer_id");

-- CreateIndex
CREATE INDEX "prayer_journal_entry_user_id_status_created_at_idx" ON "prayer_journal_entry"("user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "prayer_reminder_user_id_enabled_idx" ON "prayer_reminder"("user_id", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "daily_verse_verse_date_key" ON "daily_verse"("verse_date");

-- CreateIndex
CREATE UNIQUE INDEX "prayer_request_interaction_prayer_request_id_participant_ke_key" ON "prayer_request_interaction"("prayer_request_id", "participant_key", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "praise_report_like_praise_report_id_participant_key_key" ON "praise_report_like"("praise_report_id", "participant_key");

-- CreateIndex
CREATE INDEX "prayer_request_comment_prayer_request_id_created_at_idx" ON "prayer_request_comment"("prayer_request_id", "created_at");

-- CreateIndex
CREATE INDEX "praise_report_comment_praise_report_id_created_at_idx" ON "praise_report_comment"("praise_report_id", "created_at");

-- AddForeignKey
ALTER TABLE "schedule_day" ADD CONSTRAINT "schedule_day_week_schedule_id_fkey" FOREIGN KEY ("week_schedule_id") REFERENCES "week_schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_day" ADD CONSTRAINT "schedule_day_prayer_id_fkey" FOREIGN KEY ("prayer_id") REFERENCES "prayer_audio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_day" ADD CONSTRAINT "schedule_day_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_day_completion" ADD CONSTRAINT "user_day_completion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_day_completion" ADD CONSTRAINT "user_day_completion_schedule_day_id_fkey" FOREIGN KEY ("schedule_day_id") REFERENCES "schedule_day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workout_completion" ADD CONSTRAINT "user_workout_completion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workout_completion" ADD CONSTRAINT "user_workout_completion_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prayer_completion" ADD CONSTRAINT "user_prayer_completion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prayer_completion" ADD CONSTRAINT "user_prayer_completion_prayer_id_fkey" FOREIGN KEY ("prayer_id") REFERENCES "prayer_audio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_journal_entry" ADD CONSTRAINT "prayer_journal_entry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_reminder" ADD CONSTRAINT "prayer_reminder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_reminder" ADD CONSTRAINT "prayer_reminder_prayer_journal_entry_id_fkey" FOREIGN KEY ("prayer_journal_entry_id") REFERENCES "prayer_journal_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_request" ADD CONSTRAINT "prayer_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "praise_report" ADD CONSTRAINT "praise_report_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_request_interaction" ADD CONSTRAINT "prayer_request_interaction_prayer_request_id_fkey" FOREIGN KEY ("prayer_request_id") REFERENCES "prayer_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_request_interaction" ADD CONSTRAINT "prayer_request_interaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "praise_report_like" ADD CONSTRAINT "praise_report_like_praise_report_id_fkey" FOREIGN KEY ("praise_report_id") REFERENCES "praise_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "praise_report_like" ADD CONSTRAINT "praise_report_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_request_comment" ADD CONSTRAINT "prayer_request_comment_prayer_request_id_fkey" FOREIGN KEY ("prayer_request_id") REFERENCES "prayer_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_request_comment" ADD CONSTRAINT "prayer_request_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "praise_report_comment" ADD CONSTRAINT "praise_report_comment_praise_report_id_fkey" FOREIGN KEY ("praise_report_id") REFERENCES "praise_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "praise_report_comment" ADD CONSTRAINT "praise_report_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
