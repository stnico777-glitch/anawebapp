import { PRESET_CATEGORY_SLUGS, STATUS_NAV, slugToLabel } from "@/constants/prayerJournalNav";

export function parseArr(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** First preset slug found in tags, else first valid slug-like tag. */
export function primaryCategorySlug(tags: string[]): string | null {
  const normalized = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
  for (const p of PRESET_CATEGORY_SLUGS) {
    if (normalized.includes(p)) return p;
  }
  for (const t of normalized) {
    if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t) && t.length <= 48) return t;
  }
  return null;
}

export function tagsWithoutPrimary(tags: string[], primary: string | null): string[] {
  if (!primary) return tags.map((t) => t.trim()).filter(Boolean);
  const p = primary.toLowerCase();
  return tags.map((t) => t.trim()).filter(Boolean).filter((t) => t.toLowerCase() !== p);
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case "ANSWERED":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "PAUSED":
      return "bg-stone-200 text-stone-700 dark:bg-stone-600 dark:text-stone-100";
    default:
      return "bg-sky-blue/15 text-sky-blue dark:bg-sky-blue/25 dark:text-sky-blue";
  }
}

export function statusDisplayLabel(status: string): string {
  const row = STATUS_NAV.find((s) => s.apiValue === status);
  return row?.label ?? status.toLowerCase();
}

export function categoryLabelForSlug(slug: string | null): string | null {
  if (!slug) return null;
  return slugToLabel(slug);
}

export async function shareJournalEntry(title: string | null, content: string) {
  const line = title ? `${title}\n\n${content}` : content;
  const excerpt = line.length > 320 ? `${line.slice(0, 320)}…` : line;
  const url = typeof window !== "undefined" ? `${window.location.origin}/journaling` : "";
  try {
    if (navigator.share) {
      await navigator.share({ title: "Prayer", text: excerpt, url });
    } else {
      await navigator.clipboard.writeText(`${excerpt}\n${url}`);
    }
  } catch {
    /* noop */
  }
}

export function normalizeTagSlug(raw: string): string | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (!s || s.length > 48) return null;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) return null;
  return s;
}
