import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { PrayerReminderCadence } from "@prisma/client";
import { z } from "zod";

const cadenceSchema = z.enum(["DAILY", "WEEKLY"]);

const createSchema = z.object({
  label: z.string().min(1).max(500),
  cadence: cadenceSchema,
  timeLocal: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm (24h)"),
  weekDay: z.number().int().min(0).max(6).optional().nullable(),
  prayerJournalEntryId: z.string().min(1).max(128).optional().nullable(),
  enabled: z.boolean().optional(),
});

export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reminders = await prisma.prayerReminder.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reminders);
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { label, cadence, timeLocal, weekDay, prayerJournalEntryId, enabled } = parsed.data;

  if (cadence === "WEEKLY" && (weekDay === undefined || weekDay === null)) {
    return NextResponse.json(
      { error: "weekDay (0–6, Sunday–Saturday) required for WEEKLY reminders" },
      { status: 400 }
    );
  }
  if (cadence === "DAILY" && weekDay !== undefined && weekDay !== null) {
    return NextResponse.json({ error: "weekDay must be omitted for DAILY reminders" }, { status: 400 });
  }

  if (prayerJournalEntryId) {
    const entry = await prisma.prayerJournalEntry.findFirst({
      where: { id: prayerJournalEntryId, userId: user.id },
    });
    if (!entry) {
      return NextResponse.json({ error: "Prayer entry not found" }, { status: 404 });
    }
  }

  const reminder = await prisma.prayerReminder.create({
    data: {
      userId: user.id,
      label,
      cadence: cadence as PrayerReminderCadence,
      timeLocal,
      weekDay: cadence === "WEEKLY" ? weekDay! : null,
      prayerJournalEntryId: prayerJournalEntryId ?? null,
      enabled: enabled ?? true,
    },
  });

  return NextResponse.json(reminder);
}
