import { getDailyVerseForDateInput } from "@/lib/daily-verse";
import { publicJson, publicOptions } from "@/lib/public-json";

export async function OPTIONS() {
  return publicOptions();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const verse = await getDailyVerseForDateInput(date);
  if (!verse) {
    return publicJson({ verse: null });
  }
  return publicJson({
    verse: {
      id: verse.id,
      verseDate: verse.verseDate.toISOString(),
      reference: verse.reference,
      text: verse.text,
      translation: verse.translation,
    },
  });
}
