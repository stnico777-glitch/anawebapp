/**
 * One-off: delete all prayer journal entries (and reminders tied to them).
 * Run: npx tsx scripts/clear-prayer-journal-entries.ts
 */
import "dotenv/config";
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

async function main() {
  const reminders = await prisma.prayerReminder.deleteMany({
    where: { prayerJournalEntryId: { not: null } },
  });
  const entries = await prisma.prayerJournalEntry.deleteMany({});
  console.log(
    `Removed ${entries.count} prayer journal entries and ${reminders.count} linked reminders.`,
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
