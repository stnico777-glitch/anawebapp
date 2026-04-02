import { PrayerJournalStatus } from "@prisma/client";

export function tagsToJson(tags: string[]): string {
  const cleaned = tags
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
  return JSON.stringify(cleaned);
}

export function photosToJson(urls: string[]): string {
  const cleaned = urls.map((u) => u.trim()).filter(Boolean).slice(0, 6);
  return JSON.stringify(cleaned);
}

export function parseJsonStringArray(raw: string, field: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) throw new Error("not array");
    return v
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    throw new Error(`Invalid ${field}`);
  }
}

const STATUSES = new Set(Object.values(PrayerJournalStatus));

export function parseStatus(s: string | undefined): PrayerJournalStatus | undefined {
  if (s == null || s === "" || s === "ALL") return undefined;
  if (!STATUSES.has(s as PrayerJournalStatus)) return undefined;
  return s as PrayerJournalStatus;
}

/** Validates slug for tag/category API filter (alphanumeric + hyphens). */
export function parseTagFilter(s: string | null | undefined): string | undefined {
  if (s == null || s === "" || s === "ALL") return undefined;
  const t = s.trim().toLowerCase();
  if (t.length > 48 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t)) return undefined;
  return t;
}
