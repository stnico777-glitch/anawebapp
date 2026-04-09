import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthFromRequest } from "@/lib/auth";
import { parseJsonStringArray } from "@/lib/prayer-journal";
import { PRESET_CATEGORY_SLUGS, slugToLabel } from "@/constants/prayerJournalNav";

function presetSlugsSorted(): string[] {
  const presetSet = new Set<string>(PRESET_CATEGORY_SLUGS);
  return [...presetSet].sort((a, b) => {
    const aPreset = presetSet.has(a);
    const bPreset = presetSet.has(b);
    if (aPreset !== bPreset) return aPreset ? -1 : 1;
    return slugToLabel(a).localeCompare(slugToLabel(b));
  });
}

export async function GET(request: Request) {
  const user = await requireAuthFromRequest(request);
  if (!user) {
    return NextResponse.json({ slugs: presetSlugsSorted() });
  }

  try {
    const rows = await prisma.prayerJournalEntry.findMany({
      where: { userId: user.id },
      select: { tags: true },
    });

    const fromDb = new Set<string>();
    for (const row of rows) {
      try {
        const arr =
          Array.isArray(row.tags) && row.tags.every((x) => typeof x === "string")
            ? (row.tags as string[])
            : typeof row.tags === "string"
              ? parseJsonStringArray(row.tags, "tags")
              : [];
        for (const raw of arr) {
          const s = raw.trim().toLowerCase();
          if (s && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length <= 48) fromDb.add(s);
        }
      } catch {
        /* skip bad row */
      }
    }

    const presetSet = new Set<string>(PRESET_CATEGORY_SLUGS);
    const merged = new Set<string>([...presetSet, ...fromDb]);
    const slugs = [...merged].sort((a, b) => {
      const aPreset = presetSet.has(a);
      const bPreset = presetSet.has(b);
      if (aPreset !== bPreset) return aPreset ? -1 : 1;
      return slugToLabel(a).localeCompare(slugToLabel(b));
    });

    return NextResponse.json({ slugs });
  } catch {
    return NextResponse.json({ slugs: presetSlugsSorted() });
  }
}
