import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthFromRequest, requireMemberFromRequest } from "@/lib/auth";
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await prisma.prayerJournalEntry.findMany({
      where: {
        userId: user.id,
        ...(status ? { status } : {}),
        // `tags` is a JSON array column; Prisma's `array_contains` for a root-level
        // JSON array expects an array argument. Passing a raw string matches nothing.
        ...(tag ? { tags: { array_contains: [tag] } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    return NextResponse.json(entries);
  } catch (err) {
    console.error("prayer-journal GET failed", err);
    return NextResponse.json(
      { error: "Failed to load journal entries" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const gate = await requireMemberFromRequest(request);
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const user = gate.user;

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
