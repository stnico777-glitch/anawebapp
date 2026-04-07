import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  addDaysUtc,
  utcMondayMidnightForInstant,
  weekStartMondayUtcFromDateInput,
} from "@/lib/weekScheduleCalendar";

export const PATCH = withAdmin<{ params: Promise<{ id: string }> }>(
  async (_, request, { params }) => {
    const { id } = await params;
    const body = await request.json();
    const { weekStart } = body;
    if (weekStart == null || typeof weekStart !== "string" || !weekStart.trim()) {
      return NextResponse.json({ error: "weekStart required" }, { status: 400 });
    }
    const ws = weekStart.trim();
    const start = /^\d{4}-\d{2}-\d{2}$/.test(ws)
      ? weekStartMondayUtcFromDateInput(ws)
      : utcMondayMidnightForInstant(new Date(ws));
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: "Invalid weekStart" }, { status: 400 });
    }

    const existing = await prisma.weekSchedule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const nextMonday = addDaysUtc(start, 7);
    const clash = await prisma.weekSchedule.findFirst({
      where: {
        id: { not: id },
        weekStart: { gte: start, lt: nextMonday },
      },
    });
    if (clash) {
      return NextResponse.json(
        { error: "Another schedule already exists for that week" },
        { status: 409 }
      );
    }

    const updated = await prisma.weekSchedule.update({
      where: { id },
      data: { weekStart: start },
      include: { days: { orderBy: { dayIndex: "asc" } } },
    });
    return NextResponse.json(updated);
  }
);

export const DELETE = withAdmin<{ params: Promise<{ id: string }> }>(
  async (_, _request, { params }) => {
    const { id } = await params;
    const existing = await prisma.weekSchedule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }
    await prisma.weekSchedule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
);
