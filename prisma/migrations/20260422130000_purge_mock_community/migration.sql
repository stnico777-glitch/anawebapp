-- One-off cleanup: remove the seeded/mock Prayer & Praise wall content + its synthetic engagement.
-- Every mock row was created by `prisma/seed.ts` (now deleted) and always received at least one
-- interaction whose `participant_key` is prefixed `seed:demo:`. We identify + delete posts by that
-- signature. Real member posts never use that prefix, so this is safe to run idempotently.

-- Delete mock prayer requests (cascade removes their interactions + comments).
DELETE FROM "prayer_request"
WHERE "id" IN (
  SELECT DISTINCT "prayer_request_id"
  FROM "prayer_request_interaction"
  WHERE "participant_key" LIKE 'seed:demo:%'
);

-- Delete mock praise reports (cascade removes their likes + comments).
DELETE FROM "praise_report"
WHERE "id" IN (
  SELECT DISTINCT "praise_report_id"
  FROM "praise_report_like"
  WHERE "participant_key" LIKE 'seed:demo:%'
);

-- Belt-and-suspenders: drop any orphan seed engagement rows whose parent post may already be gone.
DELETE FROM "prayer_request_interaction" WHERE "participant_key" LIKE 'seed:demo:%';
DELETE FROM "praise_report_like"         WHERE "participant_key" LIKE 'seed:demo:%';
