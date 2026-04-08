import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrayerRequestInteractionKind, PrismaClient } from "@prisma/client";
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
  DEFAULT_MUSIC_SPOTLIGHT_ALBUMS,
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
  const nS = await prisma.musicSpotlightEntry.count();
  if (nS === 0) {
    await prisma.musicSpotlightEntry.createMany({
      data: DEFAULT_MUSIC_SPOTLIGHT_ALBUMS.map((row, i) => ({
        title: row.title,
        artist: row.artist,
        coverUrl: row.coverUrl,
        listenUrl: row.listenUrl,
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

  const prayerRequestCount = await prisma.prayerRequest.count();
  if (prayerRequestCount === 0) {
    const base = new Date();
    const makeDate = (daysAgo: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() - daysAgo);
      return d;
    };
    await prisma.prayerRequest.createMany({
      data: [
        { content: "Please pray for my sister’s health. She’s going through a difficult season and we’re trusting God for healing. Thank you ♡", authorName: "Megan", createdAt: makeDate(0) },
        { content: "Closer relationship with Jesus. I want to hear His voice more clearly and follow where He leads.", authorName: "James", createdAt: makeDate(1) },
        { content: "Dear Lord, I need Your guidance with a big decision at work. Please walk with me in clarity and peace.", authorName: "Rachel", createdAt: makeDate(1) },
        { content: "Praying for my family—that we would grow in faith together and support each other. Grateful for this community ♡", authorName: "David", createdAt: makeDate(2) },
        { content: "Thank you for your prayers. My mom’s surgery went well. Please keep praying for her recovery.", authorName: "Sarah", createdAt: makeDate(2) },
        { content: "Strength for the week ahead. Body, mind, and spirit—I want to honor God in all of it.", authorName: "Chris", createdAt: makeDate(3) },
        { content: "Please pray for peace in our home. We’re going through some tension and need God’s grace to lead.", authorName: "Elena", createdAt: makeDate(4) },
        { content: "Wisdom as a parent. I want to point my kids to Jesus and love them well. ♡", authorName: "Michael", createdAt: makeDate(5) },
        { content: "Thankful for this prayer wall. Please pray that I would stay consistent in my quiet time and movement.", authorName: "Jordan", createdAt: makeDate(6) },
      ],
    });
  }

  /** Mock praise wall posts — idempotent: skips rows already in DB (matched by exact content). */
  const mockPraiseReports: { content: string; authorName: string; daysAgo: number }[] = [
    { content: "God answered prayer — my contract renewal came through! Thank you for standing with me in faith.", authorName: "Taylor", daysAgo: 0 },
    { content: "A whole month sober. Grateful to Jesus and this community for every encouraging word.", authorName: "Alex", daysAgo: 0 },
    { content: "We welcomed our daughter this week. Healthy, strong, and so loved. Praise God from whom all blessings flow.", authorName: "Priya", daysAgo: 1 },
    { content: "Finally made peace with my sister after years of distance. Only God could have softened both of our hearts.", authorName: "Marcus", daysAgo: 1 },
    { content: "Passed my board exam on the second try. Studied with scriptures plastered on the wall — He is faithful.", authorName: "Nina", daysAgo: 2 },
    { content: "Church small group feels like family now. Didn’t think I’d ever belong somewhere again — He restores.", authorName: "Leo", daysAgo: 2 },
    { content: "Rain after a long drought, literally and spiritually. Fields and soul both drinking it in.", authorName: "Aisha", daysAgo: 3 },
    { content: "Ten years married today. Through valleys and mountaintops, grace has carried us. Celebrating Jesus.", authorName: "Jon + Beth", daysAgo: 4 },
    { content: "First paycheck from the new career path. Scared to leap; God caught me. Grateful isn’t big enough.", authorName: "Sam", daysAgo: 0 },
    { content: "Our foster placement became adoption final today. The judge cried. We all did. God is kind.", authorName: "Renee", daysAgo: 1 },
    { content: "Tumor markers came back clear. Still processing the gift. Thank you for praying when I couldn’t speak.", authorName: "Damon", daysAgo: 1 },
    { content: "Spoke at youth night — three kids stayed after to pray. That’s the win. Not my talk; His presence.", authorName: "Imani", daysAgo: 2 },
    { content: "Paid off the last student loan. Snowball + Sabbath rhythm + unexpected bonus. Only God.", authorName: "Greg", daysAgo: 3 },
    { content: "Mom came to Easter service with me. First time in fifteen years. Soft tears, loud worship.", authorName: "Viv", daysAgo: 3 },
    { content: "Garden froze last week; this morning we still had strawberries. Small mercy, loud praise.", authorName: "Hank", daysAgo: 4 },
    { content: "Language exam passed — we’re cleared to serve overseas next spring. Stunned and thankful.", authorName: "Noah & Kate", daysAgo: 4 },
    { content: "Therapist said she sees real change. I feel it too. Jesus + work + community = hope.", authorName: "Monica", daysAgo: 5 },
    { content: "Coffee shop barista asked why I’m peaceful. Got to share the whole story. Best tip jar ever.", authorName: "Eli", daysAgo: 5 },
    { content: "House offer accepted under asking. Not lucky — led. Closing next month. Hallelujah.", authorName: "Tessa", daysAgo: 6 },
    { content: "Band played our first originals night. Room sang along. What started in the garage ended in worship.", authorName: "Jules", daysAgo: 6 },
  ];

  const praiseContentSet = new Set(
    (await prisma.praiseReport.findMany({ select: { content: true } })).map((r) => r.content),
  );
  const praiseBase = new Date();
  const praiseAt = (daysAgo: number) => {
    const d = new Date(praiseBase);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };
  const newPraises = mockPraiseReports
    .filter((m) => !praiseContentSet.has(m.content))
    .map((m) => ({
      content: m.content,
      authorName: m.authorName,
      createdAt: praiseAt(m.daysAgo),
    }));
  if (newPraises.length > 0) {
    await prisma.praiseReport.createMany({ data: newPraises });
  }

  /**
   * Demo engagement counts (idempotent): synthetic participants so the wall shows real-looking tallies.
   * Keys are prefixed so they never collide with real `user:` / `v:` participants.
   */
  const demoPrayTargets = [3, 12, 5, 20, 8, 1, 14, 7, 9, 24, 6, 11, 15, 4, 18];
  const demoEncTargets = [2, 5, 1, 8, 3, 4, 6, 2, 7, 9, 3, 5, 4, 1, 6];
  const demoCelTargets = [4, 14, 6, 18, 9, 2, 11, 5, 16, 7, 12, 20, 8, 3, 22];

  const allPrayers = await prisma.prayerRequest.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  for (let i = 0; i < allPrayers.length; i++) {
    const { id } = allPrayers[i]!;
    const wantPray = demoPrayTargets[i % demoPrayTargets.length]!;
    const wantEnc = demoEncTargets[i % demoEncTargets.length]!;
    const prayPrefix = `seed:demo:${id}:pray:`;
    const encPrefix = `seed:demo:${id}:enc:`;

    const havePray = await prisma.prayerRequestInteraction.count({
      where: {
        prayerRequestId: id,
        kind: PrayerRequestInteractionKind.PRAY,
        participantKey: { startsWith: prayPrefix },
      },
    });
    for (let j = havePray; j < wantPray; j++) {
      await prisma.prayerRequestInteraction.create({
        data: {
          prayerRequestId: id,
          participantKey: `${prayPrefix}${j}`,
          kind: PrayerRequestInteractionKind.PRAY,
        },
      });
    }

    const haveEnc = await prisma.prayerRequestInteraction.count({
      where: {
        prayerRequestId: id,
        kind: PrayerRequestInteractionKind.ENCOURAGE,
        participantKey: { startsWith: encPrefix },
      },
    });
    for (let j = haveEnc; j < wantEnc; j++) {
      await prisma.prayerRequestInteraction.create({
        data: {
          prayerRequestId: id,
          participantKey: `${encPrefix}${j}`,
          kind: PrayerRequestInteractionKind.ENCOURAGE,
        },
      });
    }
  }

  const allPraises = await prisma.praiseReport.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  for (let i = 0; i < allPraises.length; i++) {
    const { id } = allPraises[i]!;
    const want = demoCelTargets[i % demoCelTargets.length]!;
    const celPrefix = `seed:demo:${id}:cel:`;
    const have = await prisma.praiseReportLike.count({
      where: {
        praiseReportId: id,
        participantKey: { startsWith: celPrefix },
      },
    });
    for (let j = have; j < want; j++) {
      await prisma.praiseReportLike.create({
        data: {
          praiseReportId: id,
          participantKey: `${celPrefix}${j}`,
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
