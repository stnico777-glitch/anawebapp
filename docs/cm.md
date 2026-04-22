# CMS → Supabase (Postgres): instructions for the website team

This file is **context for whoever edits** [anawebapp](https://github.com/stnico777-glitch/anawebapp) admin and public pages. Goal: **content managers enter data once**, it **lands in the same Postgres database** your Supabase project uses, and **both the website and the mobile app** read the same truth.

**Canonical architecture:** [MOBILE-BACKEND-CONTEXT.md](./MOBILE-BACKEND-CONTEXT.md). **Mobile parity (tabs, nuances, gaps):** [MOBILE-APP-PARITY.md](./MOBILE-APP-PARITY.md). **Verification steps:** [VERIFY-CMS-BACKEND.md](./VERIFY-CMS-BACKEND.md).

---

## 1. How writes actually work in this repo

- **Admin (`/api/admin/*`)** persists catalog and schedule content with **Prisma** using **`DATABASE_URL`**.
- Prisma models map to **Postgres `public` tables** with **snake_case** columns (e.g. `workout.thumbnail_url`). Those are the **same rows** you see in **Supabase → Table Editor** when `DATABASE_URL` points at that project.
- **`SUPABASE_SERVICE_ROLE_KEY`** is **not** used for routine CMS CRUD on workouts, schedule, audio, etc. It is used for **seeding**, Auth admin helpers, and similar (see `prisma/seed.ts`).

**Misconfiguration to watch for:** If **`DATABASE_URL`** in production pointed at a **different** database than the Supabase project you inspect in the dashboard (for example local SQLite vs cloud Postgres), the CMS could “save successfully” while **another** environment’s data is what mobile or Table Editor shows. The fix is **one** Postgres URL for the deployed server, not adding more keys.

---

## 2. Tables (Supabase Table Editor names)

| Table | Purpose |
|--------|---------|
| `workout` | Movement **Library** rail (title, duration, category, `video_url`, `thumbnail_url`, …) |
| `prayer_audio` | Audio library / prayers |
| `week_schedule` | Weekly schedule header (Monday `week_start`, etc.) |
| `schedule_day` | Days in a week (`day_index`, titles, ids, affirmations, movement intro copy, media, …) |
| `daily_verse` | Daily verse rows (`verse_date`, reference, text, …) |
| `movement_landing_copy` | Single row `id = main`: “Just Getting Started” + Quickie intro copy |
| `movement_hero_tile` | Hero tiles (`image_url`, `video_url`, `sort_order`, …) |
| `movement_quickie_card` | Quickie cards (`meta_line`, `summary`, `image_url`, `video_url`, …) |

**Naming:** Postgres uses **`snake_case`**; Prisma uses **`camelCase`** in TypeScript with `@map(...)` where needed.

**RLS:** See `supabase/migrations/` for policies. **Server-side** Prisma uses the database connection and bypasses RLS like a typical backend.

---

## 3. Required environment (Vercel / server)

| Variable | Role |
|----------|------|
| **`DATABASE_URL`** | **Required.** Supabase Postgres URI; prefer **Transaction pooler** (port **6543**, `?pgbouncer=true` when applicable). See [`.env.example`](../.env.example). |
| **`NEXT_PUBLIC_SUPABASE_URL`** | Supabase project URL (Auth, client Realtime). Same project as the DB above. |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Publishable anon key (browser / native clients). |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Server-only; **seed** and admin Auth tooling—not the primary path for CMS content writes. |

**Recommended** for resolving relative asset URLs in APIs:

| Variable | Role |
|----------|------|
| **`NEXT_PUBLIC_SITE_URL`** | Public site origin (no trailing slash), e.g. `https://your-app.vercel.app`. |

**Check:** After deploy, edit a workout in admin, then open **Supabase → Table Editor → `workout`** and confirm the row. See [VERIFY-CMS-BACKEND.md](./VERIFY-CMS-BACKEND.md).

---

## 4. How member apps read data

- **Website and mobile (catalog):** **`GET /api/public/*`** (same Prisma DB as CMS). See [MOBILE-BACKEND-CONTEXT.md](./MOBILE-BACKEND-CONTEXT.md).
- **Optional:** Supabase **Realtime** on the same tables, then **re-fetch** the public endpoints (web already does this for schedule and movement).

---

## 5. Media URLs in CMS fields

**Best for mobile + web:**

- Prefer **full HTTPS URLs** (`https://...`): Vercel Blob, Supabase Storage, CDN, or your site’s absolute URLs.
- **Site-relative paths** are OK only if **`NEXT_PUBLIC_SITE_URL`** (or your public API layer) turns them into absolute URLs for clients that cannot resolve your site origin.

If images work on the **website** but not in the **app**, check **relative URLs** or **missing `NEXT_PUBLIC_SITE_URL`** on the server that serves public JSON.

---

## 6. Mobile app configuration

- Point **`EXPO_PUBLIC_WEB_API_URL`** (or your HTTP client base URL) at the **deployed** Next origin used in §3.
- Use **`GET /api/public/*`** for Movement, Audio catalog, schedule, daily verse, etc.
- After env changes: **`npx expo start -c`**.

---

## 7. Adding columns or APIs

If you add Postgres columns or new CMS fields:

- Update **Prisma schema** and **admin** create/update handlers.
- Update **`/api/public/*`** mappers so mobile and web stay in sync.

---

*Update this doc when schema or env requirements change.*
