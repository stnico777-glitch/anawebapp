# Codebase Efficiency & Cleanup Report

**Project:** Awake & Align (Next.js 16, React 19, Prisma, NextAuth)  
**Date:** February 16, 2026

This report summarizes inefficiencies, duplication, and opportunities to clean up or make the codebase more efficient.

---

## 1. Duplication & DRY Violations

### 1.1 Homepage header vs. app header

- **`src/app/page.tsx`** (lines 18–106): Inline header with logo, desktop nav, mobile `<details>`, search, Register/Login. ~90 lines of markup.
- **`src/components/AppHeader.tsx`** and **`src/components/Navigation.tsx`**: Used only in `(app)` layout for logged-in pages.

**Recommendation:** Extract a shared **`SiteHeader`** (or **`MarketingHeader`**) used on the homepage and any other public pages. Reuse the same nav links from a single config (e.g. `constants/nav.ts`) so adding/renaming a route is done in one place. The app layout can keep `AppHeader` + `Navigation` for the authenticated shell.

### 1.2 Nav link config duplicated

- Homepage: nav links hardcoded in desktop nav and again in mobile `<details>` (Schedule, Workouts, Prayer Wall, Journal, Community, Shop).
- Footer: different link set and labels (e.g. “Prayer & Audio” → `/prayer`, “Schedule” → `/schedule`).
- **`Navigation.tsx`**: `navItems` with `/schedule`, `/workouts`, `/prayer`, `/journaling`, `/community` (no Shop; “Prayer” not “Prayer Wall”).

**Recommendation:** Single source of truth for primary nav, e.g. `constants/nav.ts`:

```ts
export const PRIMARY_NAV = [
  { href: "/#schedule", label: "Schedule" },
  { href: "/workouts", label: "Workouts" },
  { href: "/prayer-wall", label: "Prayer Wall" },  // or /prayer — see 1.5
  { href: "/journal", label: "Journal" },
  { href: "/community", label: "Community" },
  { href: "/shop", label: "Shop" },
] as const;
```

Use this for both header and footer; keep app bottom nav as a separate list if it intentionally differs.

### 1.3 Footer duplicated and inconsistent

- Footer (~120 lines) lives only in **`src/app/page.tsx`**. Other routes (e.g. `/login`, `/register`) have no footer.
- Footer “Practice” links: `/schedule`, `/workouts`, **`/prayer`** (not `/prayer-wall`). Homepage nav uses “Prayer Wall” → `/prayer-wall`. App bottom nav uses “Prayer” → `/prayer`.

**Recommendation:** Move footer into **`src/components/Footer.tsx`** and render it from `layout.tsx` (or a shared marketing layout) so every page has a consistent footer. Unify “Prayer” vs “Prayer Wall” and pick one URL (`/prayer` recommended; redirect `/prayer-wall` → `/prayer` if needed for SEO/legacy).

### 1.4 Admin API route auth pattern repeated

Every admin route repeats:

```ts
try {
  await requireAdmin();
} catch {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Recommendation:** Introduce a small wrapper or helper so route handlers don’t repeat this, e.g.:

- **Option A:** `withAdmin(handler)` that runs `requireAdmin()` and returns 401 on throw, then calls `handler(session, request, context)`.
- **Option B:** Middleware or a shared `getAdminSession()` that returns `{ session } | { error, status }` so each route does one `if (error) return NextResponse.json(...)`.

Same idea can apply to user-authenticated API routes (see 1.6).

### 1.5 Prayer URL inconsistency

- Homepage and features: “Prayer Wall” → **`/prayer-wall`**.
- Footer “Practice”: “Prayer & Audio” → **`/prayer`**.
- App bottom nav: “Prayer” → **`/prayer`** (actual app route).

**Recommendation:** Standardize on **`/prayer`** everywhere. Add a redirect from `/prayer-wall` to `/prayer` in `next.config` or a route so old links and marketing copy still work.

### 1.6 Session/auth pattern repeated in app pages and API routes

- **App pages:** Repeated pattern: `const session = await auth(); const isSubscriber = session?.user?.isSubscriber ?? false; const userId = session?.user?.id;`
- **API routes:** Repeated: `const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`

**Recommendation:**

- **Pages:** Add a small helper, e.g. `getSessionForApp()` in `lib/auth.ts` that returns `{ session, userId, isSubscriber }` (or null) so pages do one call.
- **API:** Add `requireAuth()` that returns session or throws/returns a 401 response, and use it in all user-scoped API routes to avoid copy-paste.

### 1.7 Week range formatting duplicated

- **`lib/schedule.ts`:** `formatWeekRange(weekStart)` → `"Jan 13 – Jan 18, 2026"`.
- **`app/admin/schedules/SchedulesClient.tsx`:** Local `formatWeek(d)` doing the same.

**Recommendation:** Use `formatWeekRange` from `@/lib/schedule` in `SchedulesClient` and remove the local `formatWeek`.

### 1.8 Play/pause SVG icons duplicated

- **`VideoPlayer.tsx`** and **`AudioPlayer.tsx`** both inline the same play and pause SVG paths.

**Recommendation:** Add a small **`components/icons/MediaIcons.tsx`** (or use a shared icon set) and reuse Play/Pause (and optionally fullscreen) so you don’t duplicate SVG markup.

---

## 2. Performance & Asset Efficiency

### 2.1 Raw `<img>` instead of Next.js `Image`

- **`src/app/page.tsx`:** Four `<img>` tags (weekly schedule grid, feature cards).
- **`src/components/InstagramCarousel.tsx`:** One `<img>` per placeholder.
- **`src/app/(app)/workouts/page.tsx`:** Thumbnail `<img>`.

**Recommendation:** Use Next.js **`next/image`** for these. You get automatic optimization, sizing, and (if you configure domains) external URLs. Add `images` in `next.config.ts` if you later use external image URLs. For local `/public` assets, `next/image` still helps with responsive `sizes` and modern formats.

### 2.2 Hero videos all loaded up front

- **`HeroVideo.tsx`:** Renders three `<video>` elements, each with `src` set (e.g. `/hero-video.mp4`, `hero-video2.mp4`, `hero-video3.mp4`). Only one is visible at a time but all can be loaded depending on browser behavior.

**Recommendation:** For the non-active videos, use a single `src` only when the slide becomes active (e.g. set `src` in the effect when `activeIndex` changes, or use `data-src` and assign `src` when needed). Optionally use `preload="metadata"` for the first video and `preload="none"` for others until they’re about to play.

### 2.3 Prayer card video: multiple handlers to enforce start time

- **`PrayerCardVideo.tsx`:** Uses `onCanPlay`, `onLoadedMetadata`, and `onTimeUpdate` to keep `currentTime >= START_TIME`. That can cause repeated work and possible flicker.

**Recommendation:** Rely on one or two handlers (e.g. `onLoadedMetadata` and optionally `onTimeUpdate` with a guard so you only seek once per “session”). Consider seeking only when `currentTime < START_TIME` and debouncing or limiting updates in `onTimeUpdate`.

### 2.4 Large inline SVGs in footer

- **`page.tsx`** footer: Inline SVG for Instagram, YouTube, Spotify, Pinterest, App Store, Google Play. Increases HTML and makes the component long.

**Recommendation:** Move each to a small component under e.g. `components/icons/SocialIcons.tsx` and import by name. Improves readability and allows reuse (e.g. in header or other pages).

### 2.5 Marquee content duplicated in JSX

- The 7-day trial marquee repeats the same three text chunks twice to create a seamless loop. That’s intentional for the effect but is a lot of repeated markup.

**Recommendation:** Define an array of fragments (e.g. `["Start your 7-day free trial", "✦", "No credit card required", …]`) and map twice (or use CSS `animation` with duplicated content in a single loop) to keep the markup DRY and easier to change.

---

## 3. Structure & Maintainability

### 3.1 Homepage is a single 491-line file

- **`src/app/page.tsx`** contains hero, marquee, schedule, features, Instagram carousel, and full footer. Hard to scan and to test in isolation.

**Recommendation:** Split into sections as components, e.g.:
- `HeroSection` (hero + CTA)
- `TrialBanner` (marquee)
- `ScheduleSection` (uses `getCurrentWeekSchedule` or receives data)
- `FeaturesSection`
- `InstagramSection` (wraps `InstagramCarousel`)
- Use `Footer` as in 1.3

Keep `page.tsx` as a thin composition of these + layout. Data fetching can stay in `page.tsx` and be passed down, or live in the section that needs it.

### 3.2 Hardcoded design tokens

- Hex colors repeated across many files: `#F8F4ED`, `#4A4039`, `#E8DBCF`, `#AA9578`, `#7F6B58`, `#B5C9D9`, `#E8EEF3`, `#5A8BA8`, etc. `globals.css` already defines CSS variables and `@theme` for Tailwind.

**Recommendation:** Use Tailwind theme names consistently. Replace raw hex in components with theme classes, e.g. `bg-cream`, `text-foreground`, `border-sand`, `bg-gold`, so the design system is one place to change colors. Audit files that still use `#...` and switch to theme tokens.

### 3.3 Admin layout uses a different design system

- **`app/admin/layout.tsx`** and **`app/(app)/prayer/page.tsx`** use `stone-*` and `dark:` instead of the app’s cream/sand/gold palette.

**Recommendation:** Decide whether admin (and prayer page) should match the main app. If yes, switch to the same CSS variables / Tailwind theme. If admin is intentionally “neutral,” document that and consider a small admin-only theme so it’s consistent across all admin pages.

### 3.4 Prisma schema: `datasource db` has no `url`

- **`prisma/schema.prisma`:** `datasource db { provider = "sqlite" }` with no `url`. Prisma often expects `url = env("DATABASE_URL")` for portability.

**Recommendation:** Add `url = env("DATABASE_URL")` (or a default in `.env.example`) and set `DATABASE_URL` in development/production so schema is explicit and env-based.

### 3.5 Auth config split across two files

- **`src/auth.ts`:** Full NextAuth config with Credentials, Prisma, callbacks, session extension.
- **`src/auth-edge.ts`:** Edge-friendly config with empty `providers`, same session shape.

**Recommendation:** Keep the split (edge can’t use Prisma/Node), but document in a short comment in both files that `auth-edge` is for middleware and must stay dependency-light. Ensure session shape and callback behavior stay in sync when you change one.

---

## 4. Accessibility & Semantics

### 4.1 Two `<header role="banner">` on homepage

- Sticky nav and hero each have a `<header role="banner">`. Only one main banner per page is expected for assistive tech.

**Recommendation:** Keep the sticky nav as the single `<header>` and make the hero area a `<section>` with no banner role, or use a more specific role/label for the hero “header” block.

### 4.2 Empty or generic `alt` on images

- Feature card “Journaling” image: `alt=""`.
- Instagram placeholder images: `alt=""`.

**Recommendation:** Provide short, meaningful `alt` text for each image (e.g. “Journaling and reflection” or “Instagram post preview”) so screen readers and SEO are consistent. Use `alt=""` only for purely decorative images and ensure they are not critical content.

### 4.3 Footer form has no success/error handling

- Email signup form uses `action="#"`. No client or server action, no feedback.

**Recommendation:** Either wire to an API/action and show success/error state, or remove the form until it’s implemented to avoid misleading users.

---

## 5. Small Cleanups

### 5.1 Unused or redundant code

- **`PrayerCardVideo`:** `onTimeUpdate` runs often; ensure it doesn’t cause unnecessary re-renders (handlers are already `useCallback`’d; good).
- **`InstagramCarousel`:** `style={{ scrollbarWidth: "none", ... }}` duplicates `.scrollbar-hide` in CSS. Prefer a single source (e.g. only the class).

### 5.2 Constants and magic numbers

- **`lib/schedule.ts`:** `getCurrentWeekSchedule` uses “this Monday” and “next Monday” with no shared constant for “week length” (e.g. 7 days). Minor; consider a small constant if you ever support different week lengths.
- **`InstagramCarousel`:** `SCROLL_AMOUNT = 280` and 8 placeholder posts all use the same image. Consider a constant for “posts to show” and varying placeholder images (or a single placeholder constant) for clarity.

### 5.3 Type safety

- **`page.tsx` schedule block:** `schedule.days.map((d: { id: string; dayIndex: number }) => ...)` — the type could come from `getCurrentWeekSchedule` return type so you don’t repeat and risk drift.

### 5.4 Schedule section IIFE

- The `{(() => { ... })()}` in the schedule section is used to compute `displayDays` and `weeklyImages`. This can be a variable computed before the JSX (e.g. `const displayDays = ...; const weeklyImages = ...;`) and then a simple `return (...)` in the component, which is easier to read and test.

---

## 6. Priority Summary

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| High | Extract shared header + nav config; single Footer component | Medium | Less duplication, consistent nav/footer |
| High | Unify Prayer URL (`/prayer` vs `/prayer-wall`) and add redirect | Low | Fewer broken or confusing links |
| High | Use `next/image` for all images | Low–Medium | Better performance and consistency |
| Medium | Admin API wrapper (`withAdmin` or `requireAdmin` response helper) | Low | Cleaner, less repeated auth code |
| Medium | Session helper for app pages (`getSessionForApp`) and API (`requireAuth`) | Low | DRY and consistent auth |
| Medium | Split homepage into section components | Medium | Easier maintenance and testing |
| Medium | Replace hardcoded hex with Tailwind theme tokens | Medium | Single source for design tokens |
| Low | Use `formatWeekRange` in SchedulesClient; remove duplicate `formatWeek` | Low | DRY |
| Low | Shared media icons (play/pause); smaller icon components for footer SVGs | Low | Cleaner components |
| Low | Hero video lazy-load `src`; PrayerCardVideo seek logic simplification | Low | Slightly better perf and clarity |
| Low | Fix double banner role; add meaningful `alt` text; document or implement footer form | Low | A11y and UX |

---

## 7. Suggested Next Steps

1. **Quick wins (1–2 hours):** Unify Prayer URL + redirect; use `formatWeekRange` in admin; add `requireAuth`/session helper and use in one API route and one page as a template.
2. **Short term (half day):** Extract `Footer` and shared nav config; use `next/image` on the homepage and workouts.
3. **Refactor (1–2 days):** Extract `SiteHeader` and section components from homepage; replace hex with theme tokens; add `withAdmin` and migrate admin routes.

If you tell me which area you want to tackle first (e.g. “nav + footer” or “images + performance”), I can outline concrete file-level changes and code snippets next.
