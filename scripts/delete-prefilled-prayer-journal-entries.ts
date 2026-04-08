/**
 * Removes journal rows from the old welcome seed (`team-welcome` in tags) or admin broadcast
 * (`From our team` in tags). Uses SQL text match on `tags` so it works regardless of Prisma Json filters.
 *
 * Run: npx tsx scripts/delete-prefilled-prayer-journal-entries.ts
 */
import "dotenv/config";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/** Exact titles from the former welcome pack (covers rows missing `team-welcome` in tags). */
const LEGACY_WELCOME_TITLES = [
  "Clarity when life feels noisy",
  "Consistency that outlasts motivation",
  "That you'd be a gentle light to friends and family",
  "Health in body, mind, and spirit",
  "Peace that guards your heart",
  "Deepening salvation and closeness with Jesus",
  "We're praying for you today",
] as const;

async function main() {
  const patternTeam = '%"team-welcome"%';
  const patternBroadcast = '%"From our team"%';

  const byTags = await prisma.$queryRaw<{ id: string }[]>(
    Prisma.sql`
      SELECT id FROM prayer_journal_entry
      WHERE tags::text LIKE ${patternTeam}
         OR tags::text LIKE ${patternBroadcast}
    `,
  );

  const byTitle =
    LEGACY_WELCOME_TITLES.length > 0
      ? await prisma.$queryRaw<{ id: string }[]>(
          Prisma.sql`
            SELECT id FROM prayer_journal_entry
            WHERE title IN (${Prisma.join(LEGACY_WELCOME_TITLES)})
          `,
        )
      : [];

  const idSet = new Set<string>();
  for (const r of byTags) idSet.add(r.id);
  for (const r of byTitle) idSet.add(r.id);
  const ids = [...idSet];

  if (ids.length === 0) {
    console.log("No prefilled / legacy welcome prayer journal entries found.");
    return;
  }

  const reminders = await prisma.prayerReminder.deleteMany({
    where: { prayerJournalEntryId: { in: ids } },
  });

  const entries = await prisma.prayerJournalEntry.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(
    `Deleted ${entries.count} prayer journal entr${entries.count === 1 ? "y" : "ies"} (team/welcome/broadcast) and ${reminders.count} linked reminder${reminders.count === 1 ? "" : "s"}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
