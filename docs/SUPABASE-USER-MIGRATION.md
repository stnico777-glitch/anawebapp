# Supabase backend: setup order and user migration

## Apply schema to a new Supabase project

1. Create a Supabase project and copy **Database URL**, **anon key**, **service role key**, and **URL** into `.env` (see [.env.example](../.env.example)).
2. Run Prisma migrations against that database:

   ```bash
   npx prisma migrate deploy
   ```

3. In the Supabase SQL editor (or `supabase db push` if you use the Supabase CLI), run the bundled policy and Realtime script **after** Prisma has created tables:

   - [supabase/migrations/20260407170000_rls_auth_realtime.sql](../supabase/migrations/20260407170000_rls_auth_realtime.sql)

   This adds the `profiles` → `auth.users` foreign key, the signup trigger, RLS policies, and `supabase_realtime` publication entries. If a table is already in the publication, remove the corresponding `ALTER PUBLICATION` line or ignore the error.

4. In **Authentication → URL configuration**, set **Site URL** and add redirect URLs, including `{YOUR_SITE}/auth/callback` for email confirmation.

5. Seed content and bootstrap Auth users (requires `SUPABASE_SERVICE_ROLE_KEY`):

   ```bash
   npm run db:seed
   ```

## Unified CMS → web + iOS

- **CMS and app** read/write the same Postgres database. Next.js Route Handlers use Prisma with the database role from `DATABASE_URL`, which bypasses RLS (same as a typical server backend).
- **Realtime:** the SQL migration registers CMS tables on `supabase_realtime`. The web schedule tab uses [ScheduleWeekRealtime.tsx](../src/app/(app)/(main-tabs)/schedule/ScheduleWeekRealtime.tsx) to call `router.refresh()` when `schedule_day` or `week_schedule` rows change.
- **iOS (Swift):** subscribe with the same filters, for example:
  - Table `schedule_day`, filter `week_schedule_id=eq.<activeWeekUuid>`
  - Table `week_schedule`, filter `id=eq.<activeWeekUuid>`
  Use the Supabase Swift client with the **anon** key and the user’s session JWT so RLS applies for any direct reads.

## Migrating existing users (SQLite / old `User.cuid` → Supabase `auth.users` UUID)

- **Greenfield:** simplest path is new Supabase Auth accounts and a fresh `profiles` row per user (trigger on signup).
- **Production ETL (high level):**
  1. Export legacy `User` rows (email, `is_admin`, `is_subscriber`, `stripe_customer_id`, etc.).
  2. For each user, call `auth.admin.createUser` (or the Auth REST admin API) with a **temporary password** or magic-link flow; capture the new UUID.
  3. Update `public.profiles` for that UUID (`is_admin`, `is_subscriber`, `stripe_customer_id`, `display_name`).
  4. Re-key child tables (`user_id`, `prayer_journal_entry`, completions, etc.) from old cuid to the new UUID using a mapping table during a maintenance window.
  5. Force password reset or email verification so credentials live only in Supabase Auth.

There is no automatic migration script in this repo; treat the above as a checklist for your data team.
