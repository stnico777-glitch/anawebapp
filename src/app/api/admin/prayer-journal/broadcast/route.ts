import { withAdmin } from "@/lib/admin";
import { TEAM_BROADCAST_TAG } from "@/constants/teamWelcomeJournal";
import { prisma } from "@/lib/prisma";
import { PrayerJournalStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const statusSchema = z.enum(["ACTIVE", "ANSWERED", "PAUSED"]);

const bodySchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(1).max(20_000),
  tags: z.array(z.string().max(80)).max(20).optional(),
  status: statusSchema.optional(),
  photos: z.array(z.string().max(2048)).max(6).optional(),
  answerNote: z.string().max(5000).optional().nullable(),
});

const BATCH = 400;

export const POST = withAdmin(async (_, request) => {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { title, content, tags, status, photos, answerNote } = parsed.data;
  const resolvedStatus = status ?? PrayerJournalStatus.ACTIVE;

  const tagSet = new Set<string>([TEAM_BROADCAST_TAG]);
  for (const t of tags ?? []) {
    const trimmed = t.trim();
    if (trimmed) tagSet.add(trimmed.slice(0, 80));
  }
  const mergedTags = [...tagSet];
  const photosJson = (photos ?? []) as Prisma.InputJsonValue;

  const profiles = await prisma.profile.findMany({ select: { id: true } });
  if (profiles.length === 0) {
    return NextResponse.json({ created: 0, userCount: 0 });
  }

  const answeredAt =
    resolvedStatus === PrayerJournalStatus.ANSWERED ? new Date() : null;
  const resolvedAnswerNote =
    resolvedStatus === PrayerJournalStatus.ANSWERED ? (answerNote?.trim() || null) : null;

  const titleVal = title != null && String(title).trim() ? String(title).trim() : null;

  const rows = profiles.map((p) => ({
    userId: p.id,
    title: titleVal,
    content,
    tags: mergedTags as Prisma.InputJsonValue,
    status: resolvedStatus,
    answeredAt,
    answerNote: resolvedAnswerNote,
    photos: photosJson,
  }));

  let created = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const result = await prisma.prayerJournalEntry.createMany({ data: chunk });
    created += result.count;
  }

  return NextResponse.json({
    created,
    userCount: profiles.length,
  });
});
