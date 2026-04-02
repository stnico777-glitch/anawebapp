import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toEntryDate } from "@/lib/journal";

export const PATCH = withAdmin<{ params: Promise<{ id: string }> }>(
  async (_, request, { params }) => {
    const { id } = await params;
    const existing = await prisma.dailyVerse.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { verseDate, reference, text, translation } = body;

    const data: Parameters<typeof prisma.dailyVerse.update>[0]["data"] = {
      updatedAt: new Date(),
    };
    if (verseDate !== undefined) data.verseDate = toEntryDate(new Date(String(verseDate)));
    if (reference !== undefined) data.reference = String(reference);
    if (text !== undefined) data.text = String(text);
    if (translation !== undefined) data.translation = translation ? String(translation) : null;

    const verse = await prisma.dailyVerse.update({ where: { id }, data });
    return NextResponse.json(verse);
  }
);

export const DELETE = withAdmin<{ params: Promise<{ id: string }> }>(
  async (_, _request, { params }) => {
    const { id } = await params;
    await prisma.dailyVerse.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }
);
