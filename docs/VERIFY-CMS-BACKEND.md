# Verify CMS → Postgres (Supabase) single source of truth

Use this checklist after deploy or when debugging “CMS saves but mobile / Table Editor doesn’t match.”

## 1. One database

In this repo, **CMS writes go through Prisma** using **`DATABASE_URL`**. There is **no** separate Supabase service-role write path for catalog content.

- **Required:** `DATABASE_URL` must point at your **Supabase Postgres** project (prefer the **Transaction pooler** URL, port **6543**, with `?pgbouncer=true` where applicable). See [`.env.example`](../.env.example) and [`src/lib/prisma.ts`](../src/lib/prisma.ts).
- **Same project:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be from the **same** Supabase project as the database behind `DATABASE_URL`.
- **`SUPABASE_SERVICE_ROLE_KEY`** is used for **seeding** and admin Auth operations, **not** for normal CMS CRUD on workouts/schedule/audio.

If `DATABASE_URL` pointed at SQLite (local) while you inspected **production** Supabase in the dashboard, you would see **no** new rows—that is a configuration mismatch, not a missing service role key.

## 2. Confirm writes in Supabase Table Editor

After saving in the CMS (example: create or edit a **Movement library** workout):

1. Open **Supabase → Table Editor → `workout`** (or `movement_hero_tile`, `schedule_day`, `prayer_audio`, etc.).
2. Confirm the row appears or updates with your edit.

If the row updates, the server is persisting to the database mobile and `/api/public/*` read from (when that API uses the same `DATABASE_URL`).

## 3. Confirm public API sees the same data

From a terminal (replace the origin):

```bash
curl -sS "https://YOUR_DEPLOYED_ORIGIN/api/public/workouts" | head -c 500
```

You should see JSON with the same titles/ids as in the `workout` table.

## 4. Mobile app

- Set the app’s **API base URL** to your deployed site origin (e.g. `EXPO_PUBLIC_WEB_API_URL`).
- Use **`GET /api/public/*`** for catalog data; see [MOBILE-BACKEND-CONTEXT.md](./MOBILE-BACKEND-CONTEXT.md).
- Optional: subscribe to **Supabase Realtime** on the same tables, then **re-fetch** the public endpoints when events fire.

## Related docs

- [MOBILE-BACKEND-CONTEXT.md](./MOBILE-BACKEND-CONTEXT.md) — endpoints, Realtime, auth patterns
- [cm.md](./cm.md) — CMS env and URL rules (aligned with this repo’s Prisma-first writes)
