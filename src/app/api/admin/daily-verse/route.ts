import { withAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toEntryDate } from "@/lib/journal";

export const GET = withAdmin(async () => {
  const verses = await prisma.dailyVerse.findMany({
    orderBy: { verseDate: "desc" },
    take: 120,
  });
  return NextResponse.json(verses);
});

export const POST = withAdmin(async (_, request) => {
  const body = await request.json();
  const { verseDate, reference, text, translation } = body;
  if (!verseDate || !reference || !text) {
    return NextResponse.json(
      { error: "verseDate, reference, and text required" },
      { status: 400 }
    );
  }

  const date = toEntryDate(new Date(String(verseDate)));
  const verse = await prisma.dailyVerse.create({
    data: {
      verseDate: date,
      reference: String(reference),
      text: String(text),
      translation: translation ? String(translation) : null,
    },
  });
  return NextResponse.json(verse);
});
