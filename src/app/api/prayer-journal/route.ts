import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthFromRequest } from "@/lib/auth";
import { PrayerJournalStatus } from "@prisma/client";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { parseStatus, parseTagFilter } from "@/lib/prayer-journal";

const statusSchema = z.enum(["ACTIVE", "ANSWERED", "PAUSED"]);

const createSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(1).max(20_000),
  tags: z.array(z.string().max(80)).max(20).optional(),
  status: statusSchema.optional(),
  photos: z.array(z.string().max(2048)).max(6).optional(),
  answerNote: z.string().max(5000).optional().nullable(),
});

export async function GET(request: Request) {
  const user = await requireAuthFromRequest(request);

  const { searchParams } = new URL(request.url);
  const status = parseStatus(searchParams.get("status") ?? undefined);
  const tag =
    parseTagFilter(searchParams.get("tag") ?? undefined) ??
    parseTagFilter(searchParams.get("category") ?? undefined);
  const take = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50") || 50));

  if (!user) {
    return NextResponse.json([]);
  }

  try {
    const entries = await prisma.prayerJournalEntry.findMany({
      where: {
        userId: user.id,
        ...(status ? { status } : {}),
        ...(tag ? { tags: { string_contains: `"${tag}"` } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    return NextResponse.json(entries);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const user = await requireAuthFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, content, tags, status, photos, answerNote } = parsed.data;
  const resolvedStatus = status ?? PrayerJournalStatus.ACTIVE;
  const entry = await prisma.prayerJournalEntry.create({
    data: {
      userId: user.id,
      title: title ?? null,
      content,
      tags: (tags ?? []) as Prisma.InputJsonValue,
      photos: (photos ?? []) as Prisma.InputJsonValue,
      status: resolvedStatus,
      answeredAt: resolvedStatus === PrayerJournalStatus.ANSWERED ? new Date() : null,
      answerNote:
        resolvedStatus === PrayerJournalStatus.ANSWERED ? (answerNote?.trim() || null) : null,
    },
  });

  return NextResponse.json(entry);
}
