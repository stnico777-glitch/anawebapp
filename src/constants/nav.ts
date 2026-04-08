/**
 * Single source of truth for primary/marketing navigation.
 * Used by homepage header, mobile menu, and footer.
 */
export const PRIMARY_NAV = [
  { href: "/#schedule", label: "Schedule" },
  { href: "/movement", label: "Movement" },
  { href: "/prayer", label: "Audio" },
  { href: "/journaling", label: "Prayer journal" },
  { href: "/community", label: "Community" },
  { href: "/more", label: "More" },
] as const;

/** Logged-in app shell: same labels as marketing; schedule is the app route (not homepage anchor). */
export const APP_PRIMARY_NAV = [
  { href: "/schedule", label: "Schedule" },
  { href: "/movement", label: "Movement" },
  { href: "/prayer", label: "Audio" },
  { href: "/journaling", label: "Prayer journal" },
  { href: "/community", label: "Community" },
  { href: "/more", label: "More" },
] as const;

/** Shared link classes for primary nav (desktop header) */
export const PRIMARY_NAV_LINK_CLASS =
  "text-xs font-medium uppercase tracking-wider text-gray [font-family:var(--font-headline),sans-serif] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-sm";

/** Current route — theme sky-blue */
export const PRIMARY_NAV_LINK_ACTIVE_CLASS =
  "font-semibold text-sky-blue hover:text-sky-blue hover:opacity-90";

/** Mobile dropdown variant */
export const PRIMARY_NAV_LINK_CLASS_MOBILE =
  "rounded-sm py-2 text-xs font-medium uppercase tracking-wider text-gray [font-family:var(--font-headline),sans-serif] hover:bg-background hover:opacity-80";

export const PRIMARY_NAV_LINK_MOBILE_ACTIVE_CLASS =
  "font-semibold text-sky-blue hover:bg-pastel-blue-light/40 hover:text-sky-blue";
