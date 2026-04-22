# Mobile app ↔ unified backend (parity guide)

This document is for **mobile engineers** (Expo, Swift, Kotlin, etc.) who want the **phone app to show the same content as the website** after admins edit the CMS. It complements [MOBILE-BACKEND-CONTEXT.md](./MOBILE-BACKEND-CONTEXT.md) (API shapes and reference) and [VERIFY-CMS-BACKEND.md](./VERIFY-CMS-BACKEND.md) (ops checks).

**Core idea:** There is **one** PostgreSQL database (hosted on Supabase). The Next.js server reads it with **Prisma** and exposes **catalog** data at **`GET /api/public/*`**. Your app should call those URLs on the **deployed site origin** and use **Supabase Auth + Realtime** from the **same** Supabase project.

---

## 1. Configuration (must match production web)

| Setting | What to use |
|--------|-------------|
| **HTTP API base** | Deployed Next.js origin, e.g. `https://your-app.vercel.app` — **no** trailing slash. In Expo, often `EXPO_PUBLIC_WEB_API_URL`. |
| **Supabase URL** | Same `NEXT_PUBLIC_SUPABASE_URL` as the web app. |
| **Supabase anon key** | Same `NEXT_PUBLIC_SUPABASE_ANON_KEY` as the web app. |
| **Never ship** | `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or any server-only secret. |

If the API base URL or Supabase project **does not** match what the website uses, the app will show **wrong or stale** content even when your code is correct.

---

## 2. One-page map: screen → how to load data

| App area | What the website uses | What mobile should use |
|----------|------------------------|-------------------------|
| **Schedule (week + day cards)** | Server components + Prisma | `GET /api/public/schedules`, `GET /api/public/schedule?weekStart=...` |
| **Movement (landing copy, hero, quickies, library)** | Prisma + layout helpers | `GET /api/public/movement-layout`, `GET /api/public/workouts`, `GET /api/public/workouts/[id]` |
| **Audio (layout rails + prayer catalog)** | Prisma | `GET /api/public/audio-layout`, `GET /api/public/prayers`, `GET /api/public/prayers/[id]` |
| **Prayer journal (user’s entries)** | Cookie session or API + Prisma | **`/api/prayer-journal*`** with `Authorization: Bearer <access_token>` **or** Supabase **PostgREST** on `prayer_journal_entry` under RLS |
| **Daily verse** (if you mirror web) | `GET /api/daily-verse` or public | `GET /api/public/daily-verse?date=` |

---

## 3. Schedule tab — nuances

### Endpoints

- **`GET /api/public/schedules`** — List of weeks (newest first). Use for a week picker.
- **`GET /api/public/schedule?weekStart=<optional ISO date>`** — Full week + **days** for the Monday-aligned week. If `weekStart` is omitted, the server anchors on “today” (see server implementation).

### Day card fields (JSON)

Each day includes: `prayerTitle`, `prayerId`, `workoutTitle`, `workoutId`, `affirmationText`, `dayImageUrl`, `dayVideoUrl`, `daySubtext`, **`movementIntroHeadline`**, **`movementIntroSubtext`** (pre-workout copy; may be `null`).

Treat **`week: null`** as “no schedule published for that week” — same as web.

### Checkmarks / completion state

- **Stored per user** in Postgres (`user_day_completion`), not in `/api/public/schedule`.
- The web app updates completion via **Next.js** routes with **cookie** auth.
- **Native apps** should use **Supabase + RLS** (or your team extends Next routes to accept **Bearer** tokens) for writing completions. See [MOBILE-BACKEND-CONTEXT.md](./MOBILE-BACKEND-CONTEXT.md) — **`PATCH /api/schedule/[dayId]/complete`** currently uses **cookie-only** `requireAuth()`.

### Staying fresh after CMS edits

Subscribe to **Realtime** on `week_schedule` and `schedule_day` (filtered by active `week_schedule_id`), then **re-fetch** `GET /api/public/schedule` for that week. Debounce bursts so you do not refetch dozens of times per second.

---

## 4. Movement tab — nuances

### Endpoints

- **`GET /api/public/movement-layout`** — Landing copy (`justStartedTagline`, `quickieIntro`), **hero tiles**, **quickie cards**.
- **`GET /api/public/workouts`** — Movement **library** list (sorted by title on server).
- **`GET /api/public/workouts/[id]`** — Single workout detail.

### Defaults vs CMS (important)

The server **merges** database rows with **built-in defaults** when a section is empty or on error:

- If **hero** or **quickie** tables have **no rows**, the JSON still returns **default** hero/quickie content (same idea as the member web app).
- **Landing copy** (`movement_landing_copy`, id `main`) is upserted so taglines are usually present.

So: **mobile will not see an “empty” Movement landing** the same way an empty database might suggest — **defaults fill the gaps**. Once the CMS adds real rows, **those** replace the defaults for non-empty sections.

### Workout library

- The list is **whatever is in `workout`** — if there are **no** workouts, the API returns an **empty** `workouts` array (no fake defaults for the library rail).
- **`instructor`** exists in the DB but **is not** in the public list/detail JSON today; do not rely on it for mobile unless you add a field or use PostgREST.

### Media URLs

Prefer **absolute `https://` URLs** in CMS. If you see relative paths, the web server may resolve them using `NEXT_PUBLIC_SITE_URL`; mobile must either resolve URLs the same way or use full URLs in CMS.

---

## 5. Audio tab — nuances

### Endpoints

- **`GET /api/public/audio-layout`** — Collections, essentials, spotlight marquee.
- **`GET /api/public/prayers`** — Full prayer audio catalog.
- **`GET /api/public/prayers/[id]`** — Single prayer.

### Defaults

On first load, if layout tables are **empty**, the server **seeds** default rows (same as web) so **collections / essentials / spotlight** are not blank. After CMS edits, **database** wins.

### `linkHref` (routing)

Layout cards include **`linkHref`** (often a **web path** like `/prayer#...`). On mobile you may need to map these to **in-app routes** or deep links — the JSON does not know your navigator’s stack.

### Playback

Use **`audioUrl`** from the prayer object for streaming. **Duration** is in seconds (integer) as in the API.

---

## 6. Prayer journal tab — nuances

### What “journal” is

- **Personal entries** per user (`prayer_journal_entry`).
- **Admin broadcast:** CMS can create the **same** entry for **every** user — those show up **as normal rows** for each account.

### Option A — Next.js APIs (same as web, with Bearer)

These routes accept **cookie session (web)** or **`Authorization: Bearer <Supabase access token>`**:

- `GET/POST /api/prayer-journal`
- `GET/PATCH/DELETE /api/prayer-journal/[id]`
- `POST /api/prayer-journal/upload` (images)
- `GET /api/prayer-journal/tag-suggestions`

Implementations: [`src/lib/auth.ts`](../src/lib/auth.ts) (`requireAuthFromRequest`).

### Option B — Supabase only

Read/write **`prayer_journal_entry`** via **PostgREST** with the user’s JWT; **RLS** enforces `user_id = auth.uid()`. See `supabase/migrations/20260407170000_rls_auth_realtime.sql`.

Pick **one** primary path for journal CRUD so you do not duplicate logic.

### Tags and photos

- **`tags`** and **`photos`** are stored as JSON; mirror web validation limits if you reuse the same API.

---

## 7. Daily verse (optional parity with web)

- **`GET /api/public/daily-verse?date=`** — `date` optional; returns `{ verse: null }` or `{ verse: { ... } }`.

Use the **same** date rules as the web product if you show “verse of the day” on mobile.

---

## 8. Realtime (stay in sync without polling forever)

After the SQL migration, these **`public`** tables are in the realtime publication (see [MOBILE-BACKEND-CONTEXT.md](./MOBILE-BACKEND-CONTEXT.md)):

`week_schedule`, `schedule_day`, `workout`, `prayer_audio`, `daily_verse`, `audio_collection_card`, `audio_essential_tile`, `music_spotlight_entry`, `movement_landing_copy`, `movement_hero_tile`, `movement_quickie_card`.

**Pattern:** subscribe → on event → **debounce** → **re-fetch** the matching **`/api/public/*`** route. This matches the web components (`ScheduleWeekRealtime`, `MovementLibraryRealtime`).

---

## 9. CORS and auth headers

- **`/api/public/*`** — `GET` + `OPTIONS`; CORS allows `Content-Type` and `Authorization` ([`src/lib/public-json.ts`](../src/lib/public-json.ts)).
- **Authenticated routes** — send **`Authorization: Bearer`** for native clients where supported.

---

## 10. Known parity gaps to track

| Topic | Detail |
|--------|--------|
| Schedule completion via Next API | **`/api/schedule/[dayId]/complete`** may still be **cookie-only**; native may need **Bearer** or use **Supabase** for writes. |
| Workout `instructor` | In DB, not exposed on public workout JSON. |
| `linkHref` in audio layout | Web paths; map in native navigation. |
| Relative asset URLs | Resolve with site origin or store full URLs in CMS. |

---

## 11. Pre-ship checklist

1. **`EXPO_PUBLIC_WEB_API_URL`** (or equivalent) = **production** Next origin.
2. Supabase **URL + anon key** = **same project** as web.
3. Schedule: load **`/api/public/schedule`** and render **all** day fields including **movement intro** lines.
4. Movement: load **`movement-layout` + `workouts`**; understand **default** hero/quickie behavior.
5. Audio: load **`audio-layout` + `prayers`**; handle **`linkHref`** for navigation.
6. Journal: Bearer on **`/api/prayer-journal*`** **or** PostgREST + RLS — not both inconsistently.
7. Realtime + debounced refetch for **fresh** CMS edits.

---

*Update this file when the team adds fields to public routes or changes auth behavior.*
