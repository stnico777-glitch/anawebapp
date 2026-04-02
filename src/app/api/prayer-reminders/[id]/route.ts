import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { PrayerReminderCadence } from "@prisma/client";
import { z } from "zod";

const cadenceSchema = z.enum(["DAILY", "WEEKLY"]);

const patchSchema = z
  .object({
    label: z.string().min(1).max(500).optional(),
    cadence: cadenceSchema.optional(),
    timeLocal: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm (24h)").optional(),
    weekDay: z.number().int().min(0).max(6).optional().nullable(),
    enabled: z.boolean().optional(),
    prayerJournalEntryId: z.string().min(1).max(128).optional().nullable(),
  })
  .strict();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.prayerReminder.findFirst({
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
  const cadence = (d.cadence ?? existing.cadence) as PrayerReminderCadence;
  let weekDay = d.weekDay !== undefined ? d.weekDay : existing.weekDay;

  if (cadence === "WEEKLY" && (weekDay === undefined || weekDay === null)) {
    return NextResponse.json(
      { error: "weekDay (0–6) required for WEEKLY reminders" },
      { status: 400 }
    );
  }
  if (cadence === "DAILY") weekDay = null;

  if (d.prayerJournalEntryId) {
    const entry = await prisma.prayerJournalEntry.findFirst({
      where: { id: d.prayerJournalEntryId, userId: user.id },
    });
    if (!entry) return NextResponse.json({ error: "Prayer entry not found" }, { status: 404 });
  }

  const updated = await prisma.prayerReminder.update({
    where: { id },
    data: {
      ...(d.label !== undefined ? { label: d.label } : {}),
      ...(d.cadence !== undefined ? { cadence: d.cadence as PrayerReminderCadence } : {}),
      ...(d.timeLocal !== undefined ? { timeLocal: d.timeLocal } : {}),
      weekDay,
      ...(d.enabled !== undefined ? { enabled: d.enabled } : {}),
      ...(d.prayerJournalEntryId !== undefined
        ? { prayerJournalEntryId: d.prayerJournalEntryId }
        : {}),
      updatedAt: new Date(),
    },
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

  const existing = await prisma.prayerReminder.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.prayerReminder.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
