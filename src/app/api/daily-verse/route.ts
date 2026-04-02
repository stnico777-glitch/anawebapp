import { NextResponse } from "next/server";
import { getDailyVerseForDateInput } from "@/lib/daily-verse";

/** Public read: daily verse is not secret content; used on schedule and share flows. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const verse = await getDailyVerseForDateInput(date);
  if (!verse) {
    return NextResponse.json({ verse: null });
  }
  return NextResponse.json({
    verse: {
      id: verse.id,
      verseDate: verse.verseDate.toISOString(),
      reference: verse.reference,
      text: verse.text,
      translation: verse.translation,
    },
  });
}
