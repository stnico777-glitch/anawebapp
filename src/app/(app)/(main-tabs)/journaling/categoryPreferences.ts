const PINNED_KEY = "prayer-journal-pinned-categories";
const ALIASES_KEY = "prayer-journal-category-aliases";
const HIDDEN_KEY = "prayer-journal-hidden-categories";

function normalizeSlugList(raw: string[]): string[] {
  return [
    ...new Set(
      raw
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0 && s.length <= 48 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)),
    ),
  ];
}

export function loadPinnedCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    if (!raw) return [];
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return normalizeSlugList(v.filter((x): x is string => typeof x === "string"));
  } catch {
    return [];
  }
}

export function savePinnedCategories(slugs: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PINNED_KEY, JSON.stringify(normalizeSlugList(slugs)));
}

export function loadHiddenCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (!raw) return [];
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return normalizeSlugList(v.filter((x): x is string => typeof x === "string"));
  } catch {
    return [];
  }
}

export function saveHiddenCategories(slugs: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(normalizeSlugList(slugs)));
}

export function loadCategoryAliases(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ALIASES_KEY);
    if (!raw) return {};
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v)) {
      const slug = k.trim().toLowerCase();
      if (typeof val === "string" && slug) out[slug] = val.trim();
    }
    return out;
  } catch {
    return {};
  }
}

export function saveCategoryAliases(aliases: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(aliases)) {
    const slug = k.trim().toLowerCase();
    const label = v.trim();
    if (slug && label) cleaned[slug] = label;
  }
  localStorage.setItem(ALIASES_KEY, JSON.stringify(cleaned));
}
