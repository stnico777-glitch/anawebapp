import { PrayerJournalStatus } from "@prisma/client";
import { PRESET_CATEGORY_SLUGS, slugToLabel } from "@/constants/prayerJournalNav";
import { WELCOME_JOURNAL_DEMO_ENTRIES } from "@/lib/welcome-prayer-journal";
import {
  parseJsonStringArray,
  photosToJson,
  tagsToJson,
} from "@/lib/prayer-journal";

/**
 * JSON-shaped rows matching `prisma.prayerJournalEntry` for GET /api/prayer-journal
 * when the database cannot be reached (preview / demo).
 */
export function getDemoPrayerJournalApiRows(
  status?: PrayerJournalStatus,
  tag?: string,
) {
  const base = Date.now();
  const rows = WELCOME_JOURNAL_DEMO_ENTRIES.map((entry, i) => ({
    id: `demo-journal-${i}`,
    userId: "demo-preview",
    title: entry.title,
    content: entry.content,
    tags: tagsToJson(entry.tags),
    photos: photosToJson([]),
    status: PrayerJournalStatus.ACTIVE,
    answeredAt: null,
    answerNote: null,
    createdAt: new Date(base - i * 90_000),
    updatedAt: new Date(base - i * 90_000),
  }));

  let out = rows;
  if (status) {
    out = out.filter((r) => r.status === status);
  }
  if (tag) {
    out = out.filter((r) => {
      try {
        const arr = parseJsonStringArray(r.tags, "tags");
        return arr.some((t) => t.toLowerCase() === tag);
      } catch {
        return false;
      }
    });
  }
  return out;
}

/** Tag slugs for GET /api/prayer-journal/tag-suggestions when the DB is unavailable. */
export function getDemoPrayerJournalTagSlugs(): string[] {
  const fromWelcome = new Set<string>();
  for (const e of WELCOME_JOURNAL_DEMO_ENTRIES) {
    for (const raw of e.tags) {
      const s = raw.trim().toLowerCase();
      if (s && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length <= 48) {
        fromWelcome.add(s);
      }
    }
  }
  const presetSet = new Set<string>(PRESET_CATEGORY_SLUGS);
  const merged = new Set<string>([...presetSet, ...fromWelcome]);
  return [...merged].sort((a, b) => {
    const aPreset = presetSet.has(a);
    const bPreset = presetSet.has(b);
    if (aPreset !== bPreset) return aPreset ? -1 : 1;
    return slugToLabel(a).localeCompare(slugToLabel(b));
  });
}
