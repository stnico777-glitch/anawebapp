import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { PrayerJournalStatus } from "@prisma/client";
import { z } from "zod";
import { tagsToJson, photosToJson } from "@/lib/prayer-journal";

const statusSchema = z.enum(["ACTIVE", "ANSWERED", "PAUSED"]);

const patchSchema = z
  .object({
    title: z.string().max(200).optional().nullable(),
    content: z.string().min(1).max(20_000).optional(),
    tags: z.array(z.string().max(80)).max(20).optional(),
    status: statusSchema.optional(),
    photos: z.array(z.string().max(2048)).max(6).optional(),
    answerNote: z.string().max(5000).optional().nullable(),
    answeredAt: z.union([z.string().datetime(), z.null()]).optional(),
  })
  .strict();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const entry = await prisma.prayerJournalEntry.findFirst({
    where: { id, userId: user.id },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.prayerJournalEntry.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const data: Parameters<typeof prisma.prayerJournalEntry.update>[0]["data"] = {
    updatedAt: new Date(),
  };

  if (d.title !== undefined) data.title = d.title;
  if (d.content !== undefined) data.content = d.content;
  if (d.tags !== undefined) data.tags = tagsToJson(d.tags);
  if (d.photos !== undefined) data.photos = photosToJson(d.photos);
  if (d.answerNote !== undefined) data.answerNote = d.answerNote;

  if (d.status !== undefined) {
    data.status = d.status as PrayerJournalStatus;
    if (d.status === "ANSWERED") {
      data.answeredAt = d.answeredAt !== undefined
        ? d.answeredAt
          ? new Date(d.answeredAt)
          : null
        : new Date();
    } else {
      data.answeredAt = null;
    }
  } else if (d.answeredAt !== undefined) {
    data.answeredAt = d.answeredAt ? new Date(d.answeredAt) : null;
  }

  const updated = await prisma.prayerJournalEntry.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.prayerJournalEntry.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.prayerJournalEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
