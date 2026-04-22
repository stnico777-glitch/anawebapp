-- Feedback / feature requests captured from the More page "Submit feedback" tile.
-- `user_id` is nullable because the form may accept guests; set null on user delete.

CREATE TABLE "feedback" (
    "id"         UUID         NOT NULL,
    "user_id"    UUID,
    "email"      TEXT,
    "name"       TEXT,
    "title"      TEXT         NOT NULL,
    "message"    TEXT         NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "feedback_created_at_idx" ON "feedback" ("created_at");

ALTER TABLE "feedback"
    ADD CONSTRAINT "feedback_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
