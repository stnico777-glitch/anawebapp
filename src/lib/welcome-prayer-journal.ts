import { type PrismaClient, Prisma, PrayerJournalStatus } from "@prisma/client";
import { TEAM_WELCOME_TAG } from "@/constants/teamWelcomeJournal";
import { prisma } from "@/lib/prisma";

const SIGN_OFF = `— The Awake & Align team (your movement family)`;

/**
 * Starter prayers every member receives: written as if our team is praying *for* them.
 * Entries later in the array get slightly newer timestamps so they appear nearer the top
 * under default "newest first" ordering.
 */
const WELCOME_ENTRIES: { title: string; content: string; tags: string[] }[] = [
  {
    title: "Clarity when life feels noisy",
    content: `We’re lifting you up today at Awake & Align: God, give this precious person clarity—not just busy answers, but the kind of calm knowing that comes from You. When decisions pile up or the path feels unclear, whisper what is true and steady them with peace.

${SIGN_OFF}`,
    tags: [TEAM_WELCOME_TAG, "clarity"],
  },
  {
    title: "Consistency that outlasts motivation",
    content: `Father, thank You for someone who is showing up. Would You bless their consistency—not perfection, but faithful small steps—in movement, in devotion, and in caring for their soul on the hard days too.

${SIGN_OFF}`,
    tags: [TEAM_WELCOME_TAG, "consistency"],
  },
  {
    title: "That you’d be a gentle light to friends and family",
    content: `Jesus, make this person a beacon of kindness in their circles—not loud, not performative, but unmistakably Yours. Protect their relationships, soften their words where needed, and use their life to point people toward hope.

${SIGN_OFF}`,
    tags: [TEAM_WELCOME_TAG, "family"],
  },
  {
    title: "Health in body, mind, and spirit",
    content: `Lord, we pray for whole-person health over the one reading this: strength where there is weakness, healing where there is hurt, and wisdom for rest, food, movement, and care. Sustain them; they matter to Your heart and to ours.

${SIGN_OFF}`,
    tags: [TEAM_WELCOME_TAG, "healing"],
  },
  {
    title: "Peace that guards your heart",
    content: `Prince of Peace, surround this beloved member with a peace that doesn’t depend on circumstances. When anxiety rises or the schedule squeezes, would they feel carried—not alone, not rushed, but held by You?

${SIGN_OFF}`,
    tags: [TEAM_WELCOME_TAG, "peace"],
  },
  {
    title: "Deepening salvation and closeness with Jesus",
    content: `We’re praying boldly for their life to be rooted in Jesus: for the beauty of salvation to stay fresh, for intimacy with You to grow, and for the Holy Spirit to keep drawing them into truth, freedom, and joy. Keep them, save them, satisfy them in You.

${SIGN_OFF}`,
    tags: [TEAM_WELCOME_TAG, "faith"],
  },
  {
    title: "We’re praying for you today",
    content: `Hey—you’re not an afterthought around here. Everyone at Awake & Align is honored you’re part of this movement. We’re asking God to meet you right where you are: to strengthen you, encourage you, and remind you that your story still matters.

Use these starter prayers as yours to keep, edit, archive, or replace. They’re simply us saying: we see you, we’re with you, and we’re trusting Jesus alongside you.

${SIGN_OFF}`,
    tags: [TEAM_WELCOME_TAG, "friends"],
  },
];

/** Same copy as seeded welcome entries — used for Vercel/offline preview when the DB is unavailable. */
export const WELCOME_JOURNAL_DEMO_ENTRIES = WELCOME_ENTRIES;

/**
 * Ensures the user has the standard “from our team” prayer pack once.
 * Safe to call on every journal load; no-ops if already present.
 */
export async function ensureWelcomePrayerJournalEntries(
  userId: string,
  db: PrismaClient = prisma
): Promise<void> {
  const existing = await db.prayerJournalEntry.findFirst({
    where: {
      userId,
      title: WELCOME_ENTRIES[0]!.title,
    },
    select: { id: true },
  });
  if (existing) return;

  const base = Date.now();
  const staggerMs = 90_000;

  await db.$transaction(
    WELCOME_ENTRIES.map((entry, i) =>
      db.prayerJournalEntry.create({
        data: {
          userId,
          title: entry.title,
          content: entry.content,
          tags: entry.tags as Prisma.InputJsonValue,
          photos: [] as Prisma.InputJsonValue,
          status: PrayerJournalStatus.ACTIVE,
          createdAt: new Date(base + i * staggerMs),
        },
      })
    )
  );
}
