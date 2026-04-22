import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { addDaysUtc, utcMondayMidnightForInstant } from "../src/lib/weekScheduleCalendar";
import { dedupeWeekSchedulesByWeekStart } from "../src/lib/schedule";
import { getDefaultScheduleDaysForSeed } from "../src/lib/schedule-default-week";
import { AUDIO_LIBRARY_SEED_COVER_BY_TITLE } from "../src/constants/audioLibraryCovers";
import { toEntryDate } from "../src/lib/journal";
import {
  DEFAULT_AUDIO_COLLECTION_CARDS,
  DEFAULT_AUDIO_ESSENTIAL_TILES,
} from "../src/lib/audio-layout-defaults";
import { ensureMovementLayoutSeeded, seedMovementHeroAndQuickieIfEmpty } from "../src/lib/movement-layout";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for db:seed (Supabase Postgres connection string).");
}
const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

async function upsertAuthProfile(options: {
  email: string;
  password: string;
  displayName: string;
  isAdmin?: boolean;
  isSubscriber?: boolean;
}): Promise<string> {
  if (!supabaseUrl || !serviceRole) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to create seed users in auth.users.",
    );
  }
  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const perPage = 200;
  let page = 1;
  let existing: { id: string } | undefined;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users ?? [];
    existing = users.find((u) => u.email?.toLowerCase() === options.email.toLowerCase());
    if (existing || users.length < perPage) break;
    page += 1;
  }

  let userId: string;
  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: options.password,
      user_metadata: { full_name: options.displayName, name: options.displayName },
    });
    if (error) throw error;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: options.email,
      password: options.password,
      email_confirm: true,
      user_metadata: { full_name: options.displayName, name: options.displayName },
    });
    if (error || !data.user) throw error ?? new Error("auth.admin.createUser failed");
    userId = data.user.id;
  }

  await prisma.profile.update({
    where: { id: userId },
    data: {
      displayName: options.displayName,
      isAdmin: options.isAdmin ?? false,
      isSubscriber: options.isSubscriber ?? false,
    },
  });

  return userId;
}

async function profileIdForEmail(email: string): Promise<string | null> {
  if (!supabaseUrl || !serviceRole) return null;
  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const perPage = 200;
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return null;
    const users = data.users ?? [];
    const hit = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (users.length < perPage) return null;
    page += 1;
  }
}

async function seedAudioTabLayout() {
  const nC = await prisma.audioCollectionCard.count();
  if (nC === 0) {
    await prisma.audioCollectionCard.createMany({
      data: DEFAULT_AUDIO_COLLECTION_CARDS.map((row, i) => ({
        title: row.title,
        metaLine: row.metaLine,
        imageUrl: row.imageUrl,
        summary: row.summary,
        linkHref: row.linkHref,
        sortOrder: i,
      })),
    });
  }
  const nE = await prisma.audioEssentialTile.count();
  if (nE === 0) {
    await prisma.audioEssentialTile.createMany({
      data: DEFAULT_AUDIO_ESSENTIAL_TILES.map((row, i) => ({
        title: row.title,
        subtitle: row.subtitle,
        imageUrl: row.imageUrl,
        linkHref: row.linkHref,
        sortOrder: i,
      })),
    });
  }
}

async function main() {
  /** First: week rows (Prisma only) so CMS has data even if Supabase Auth seed fails. */
  const thisMonday = utcMondayMidnightForInstant(new Date());
  const defaultDays = getDefaultScheduleDaysForSeed().map((d) => ({
    dayIndex: d.dayIndex,
    prayerTitle: d.prayerTitle,
    workoutTitle: d.workoutTitle,
    affirmationText: d.affirmationText,
    dayImageUrl: d.dayImageUrl,
    dayVideoUrl: d.dayVideoUrl,
    daySubtext: d.daySubtext,
  }));
  for (let offset = -4; offset <= 4; offset++) {
    const weekStart = addDaysUtc(thisMonday, offset * 7);
    const nextMonday = addDaysUtc(weekStart, 7);
    const existingWeek = await prisma.weekSchedule.findFirst({
      where: { weekStart: { gte: weekStart, lt: nextMonday } },
    });
    if (!existingWeek) {
      await prisma.weekSchedule.create({
        data: {
          weekStart,
          days: { create: defaultDays },
        },
      });
    }
  }

  const masterEmail =
    process.env.MASTER_ACCOUNT_EMAIL ?? "master@awakealign.com";
  const masterPasswordPlain =
    process.env.MASTER_ACCOUNT_PASSWORD ?? "AwakeAlignMaster!2026";

  let demoUserId: string | null = null;
  try {
    demoUserId = await upsertAuthProfile({
      email: "demo@awakealign.com",
      password: "password123",
      displayName: "Demo User",
      isAdmin: true,
      isSubscriber: true,
    });
    await upsertAuthProfile({
      email: masterEmail,
      password: masterPasswordPlain,
      displayName: "Master CMS",
      isAdmin: true,
      isSubscriber: true,
    });
  } catch (e) {
    console.warn(
      "[seed] Supabase Auth user creation failed (schedules still seeded). Fix Auth in dashboard or run again.",
      e,
    );
  }

  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const initialWorkouts = [
    { title: "Morning Strength", duration: 20, category: "Strength", videoUrl, scripture: "Philippians 4:13" },
    { title: "Cardio Blast", duration: 15, category: "Cardio", videoUrl },
    { title: "Restorative Yoga", duration: 25, category: "Yoga", videoUrl, scripture: "Psalm 46:10" },
    { title: "Pilates Core", duration: 22, category: "Pilates", videoUrl, scripture: "Isaiah 40:31" },
    { title: "HIIT Burn", duration: 18, category: "HIIT", videoUrl },
    { title: "Evening Stretch", duration: 15, category: "Stretch", videoUrl, scripture: "Psalm 23:1-3" },
    { title: "Full Body Flow", duration: 30, category: "Full Body", videoUrl },
    { title: "Quick Cardio", duration: 10, category: "Cardio", videoUrl },
    { title: "Gentle Yoga", duration: 20, category: "Yoga", videoUrl, scripture: "Matthew 11:28" },
  ];

  const workoutCount = await prisma.workout.count();
  if (workoutCount === 0) {
    await prisma.workout.createMany({ data: initialWorkouts });
  } else if (workoutCount < initialWorkouts.length) {
    const existing = await prisma.workout.findMany({ select: { title: true } });
    const existingTitles = new Set(existing.map((w) => w.title));
    const toAdd = initialWorkouts.filter((w) => !existingTitles.has(w.title));
    if (toAdd.length > 0) {
      await prisma.workout.createMany({ data: toAdd });
    }
  }

  const demoPrayerAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const initialPrayerAudios = [
    { title: "Affirmations for today", description: "Speak life over your morning", scripture: "Philippians 4:8", audioUrl: demoPrayerAudioUrl, duration: 180 },
    { title: "Prayer for peace", description: "Stillness when your mind won’t stop", scripture: "John 14:27", audioUrl: demoPrayerAudioUrl, duration: 300 },
    { title: "Release anxiety", description: "Lay worry down; breathe and pray", scripture: "1 Peter 5:7", audioUrl: demoPrayerAudioUrl, duration: 240 },
    { title: "Gratitude pause", description: "Short reset—with thanks", scripture: "Psalm 100:4", audioUrl: demoPrayerAudioUrl, duration: 200 },
    { title: "Strength for the week", description: "Courage and endurance", scripture: "Isaiah 40:31", audioUrl: demoPrayerAudioUrl, duration: 260 },
    { title: "Sleep well tonight", description: "Hand today to God; rest deep", scripture: "Psalm 4:8", audioUrl: demoPrayerAudioUrl, duration: 220 },
    { title: "Morning mercy", description: "Fresh mercy before the day", scripture: "Lamentations 3:22-23", audioUrl: demoPrayerAudioUrl, duration: 195 },
    { title: "Healing hope", description: "Prayer for heart and body", scripture: "James 5:15", audioUrl: demoPrayerAudioUrl, duration: 320 },
    { title: "Forgive and release", description: "Let go; walk lighter", scripture: "Colossians 3:13", audioUrl: demoPrayerAudioUrl, duration: 275 },
    { title: "Courage to begin", description: "When you’re afraid to start", scripture: "Joshua 1:9", audioUrl: demoPrayerAudioUrl, duration: 210 },
    { title: "Wait on the Lord", description: "Patience in the in-between", scripture: "Psalm 27:14", audioUrl: demoPrayerAudioUrl, duration: 285 },
    { title: "Joy in the journey", description: "Delight—not perfection", scripture: "Psalm 16:11", audioUrl: demoPrayerAudioUrl, duration: 190 },
    { title: "Blessing body and spirit", description: "Honor the temple; honor the soul", scripture: "1 Corinthians 6:19-20", audioUrl: demoPrayerAudioUrl, duration: 245 },
    { title: "Calm the storm inside", description: "When everything feels loud", scripture: "Mark 4:39", audioUrl: demoPrayerAudioUrl, duration: 305 },
    { title: "Sabbath heart", description: "Pause, praise, presence", scripture: "Exodus 20:8", audioUrl: demoPrayerAudioUrl, duration: 230 },
    { title: "Evening prayer", description: "Name the day and hand it back to God", scripture: "Psalm 141:2", audioUrl: demoPrayerAudioUrl, duration: 240 },
    { title: "Scripture meditation", description: "Slow listening—space between the verses", scripture: "Joshua 1:8", audioUrl: demoPrayerAudioUrl, duration: 300 },
  ].map((p) => ({
    ...p,
    coverImageUrl: AUDIO_LIBRARY_SEED_COVER_BY_TITLE[p.title],
  }));

  /** Keep library art in sync when re-running seed (`AUDIO_LIBRARY_SEED_COVER_BY_TITLE` mix). */
  const prayerCoverByTitle = Object.fromEntries(
    initialPrayerAudios.map((p) => [p.title, p.coverImageUrl]),
  ) as Record<string, string>;

  const prayerCount = await prisma.prayerAudio.count();
  if (prayerCount === 0) {
    await prisma.prayerAudio.createMany({ data: initialPrayerAudios });
  } else if (prayerCount < initialPrayerAudios.length) {
    const existing = await prisma.prayerAudio.findMany({ select: { title: true } });
    const existingTitles = new Set(existing.map((p) => p.title));
    const prayersToAdd = initialPrayerAudios.filter((p) => !existingTitles.has(p.title));
    if (prayersToAdd.length > 0) {
      await prisma.prayerAudio.createMany({ data: prayersToAdd });
    }
  }

  for (const [title, coverImageUrl] of Object.entries(prayerCoverByTitle)) {
    await prisma.prayerAudio.updateMany({ where: { title }, data: { coverImageUrl } });
  }

  const dailyVerseSnippets: { reference: string; text: string; translation: string }[] = [
    {
      reference: "Philippians 4:6-7",
      text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
      translation: "NIV",
    },
    {
      reference: "Isaiah 40:31",
      text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
      translation: "NIV",
    },
    {
      reference: "Psalm 46:10",
      text: "He says, ‘Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.’",
      translation: "NIV",
    },
    {
      reference: "Matthew 11:28-30",
      text: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.",
      translation: "NIV",
    },
    {
      reference: "Romans 15:13",
      text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.",
      translation: "NIV",
    },
    {
      reference: "Joshua 1:9",
      text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
      translation: "NIV",
    },
    {
      reference: "Lamentations 3:22-23",
      text: "Because of the Lord’s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
      translation: "NIV",
    },
    {
      reference: "Colossians 3:15",
      text: "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. And be thankful.",
      translation: "NIV",
    },
    {
      reference: "1 Peter 5:7",
      text: "Cast all your anxiety on him because he cares for you.",
      translation: "NIV",
    },
    {
      reference: "Psalm 23:1-3",
      text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
      translation: "NIV",
    },
    {
      reference: "James 1:5",
      text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.",
      translation: "NIV",
    },
    {
      reference: "2 Timothy 1:7",
      text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.",
      translation: "NIV",
    },
    {
      reference: "Micah 6:8",
      text: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.",
      translation: "NIV",
    },
    {
      reference: "John 14:27",
      text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
      translation: "NIV",
    },
  ];

  const verseStart = toEntryDate(new Date());
  for (let i = 0; i < 70; i++) {
    const verseDate = new Date(verseStart);
    verseDate.setUTCDate(verseDate.getUTCDate() + i);
    const v = dailyVerseSnippets[i % dailyVerseSnippets.length]!;
    const existing = await prisma.dailyVerse.findUnique({
      where: { verseDate },
    });
    if (!existing) {
      await prisma.dailyVerse.create({
        data: {
          verseDate,
          reference: v.reference,
          text: v.text,
          translation: v.translation,
        },
      });
    }
  }

  await seedAudioTabLayout();
  await ensureMovementLayoutSeeded();
  await seedMovementHeroAndQuickieIfEmpty();

  const removedDupSchedules = await dedupeWeekSchedulesByWeekStart(prisma);
  if (removedDupSchedules > 0) {
    console.log(
      `[seed] Removed ${removedDupSchedules} duplicate week schedule(s) (same Monday anchor; kept oldest).`,
    );
  }

  console.log(
    "Seed complete.",
    demoUserId
      ? `Auth: demo@awakealign.com | Master: ${masterEmail}`
      : "Auth users skipped (see warning above).",
    "| Weeks (±4), movement, prayers, daily verses, community ensured",
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
