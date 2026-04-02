/** Lowercase slugs stored in entry `tags` JSON for Notebook-style categories */

export const PRESET_CATEGORY_SLUGS = [
  "friends",
  "family",
  "ministry-partners",
  "pastors",
  "small-group",
] as const;

const LABELS: Record<string, string> = {
  "team-welcome": "From our team",
  friends: "Friends",
  family: "Family",
  "ministry-partners": "Ministry partners",
  pastors: "Pastors",
  "small-group": "Small group",
};

export function slugToLabel(slug: string): string {
  return LABELS[slug] ?? humanizeSlug(slug);
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const STATUS_NAV = [
  { key: "ACTIVE" as const, apiValue: "ACTIVE" as const, label: "Unanswered" },
  { key: "ANSWERED" as const, apiValue: "ANSWERED" as const, label: "Answered" },
  { key: "PAUSED" as const, apiValue: "PAUSED" as const, label: "Archive" },
] as const;

export type JournalStatusFilterKey = (typeof STATUS_NAV)[number]["key"] | "ALL";
