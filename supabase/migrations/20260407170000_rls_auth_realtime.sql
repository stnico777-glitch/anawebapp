-- Run AFTER `prisma migrate deploy` against the same Supabase Postgres database.
-- Adds: profiles ↔ auth.users FK, signup profile trigger, RLS, Realtime publication.

-- -----------------------------------------------------------------------------
-- 1) Link public.profiles to Supabase Auth (orphan rows must not exist)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- 2) Auto-create profile on new auth user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 3) Prevent clients from self-promoting admin / subscriber via PostgREST
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_lock_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL AND NEW.id = auth.uid() THEN
    NEW.is_admin := OLD.is_admin;
    NEW.is_subscriber := OLD.is_subscriber;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_lock_privileged ON public.profiles;
CREATE TRIGGER profiles_lock_privileged
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.profiles_lock_privileged_columns();

-- -----------------------------------------------------------------------------
-- 4) RLS helper
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profile_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    FALSE
  );
$$;

-- -----------------------------------------------------------------------------
-- 5) Enable RLS on all public app tables
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_day_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workout_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prayer_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_journal_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_reminder ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_verse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.praise_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_request_interaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.praise_report_like ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_request_comment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.praise_report_comment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_collection_card ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_essential_tile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_spotlight_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_landing_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_hero_tile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_quickie_card ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running migration
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles','week_schedule','schedule_day','user_day_completion','workout',
        'user_workout_completion','prayer_audio','user_prayer_completion',
        'prayer_journal_entry','prayer_reminder','daily_verse','prayer_request',
        'praise_report','prayer_request_interaction','praise_report_like',
        'prayer_request_comment','praise_report_comment','audio_collection_card',
        'audio_essential_tile','music_spotlight_entry','movement_landing_copy',
        'movement_hero_tile','movement_quickie_card'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- profiles: own row
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- CMS / catalog: world-readable; admin writes (server uses Prisma and bypasses RLS)
CREATE POLICY week_schedule_select_all ON public.week_schedule FOR SELECT USING (true);
CREATE POLICY week_schedule_write_admin ON public.week_schedule FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY week_schedule_update_admin ON public.week_schedule FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY week_schedule_delete_admin ON public.week_schedule FOR DELETE USING (public.profile_is_admin());

CREATE POLICY schedule_day_select_all ON public.schedule_day FOR SELECT USING (true);
CREATE POLICY schedule_day_write_admin ON public.schedule_day FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY schedule_day_update_admin ON public.schedule_day FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY schedule_day_delete_admin ON public.schedule_day FOR DELETE USING (public.profile_is_admin());

CREATE POLICY workout_select_all ON public.workout FOR SELECT USING (true);
CREATE POLICY workout_write_admin ON public.workout FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY workout_update_admin ON public.workout FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY workout_delete_admin ON public.workout FOR DELETE USING (public.profile_is_admin());

CREATE POLICY prayer_audio_select_all ON public.prayer_audio FOR SELECT USING (true);
CREATE POLICY prayer_audio_write_admin ON public.prayer_audio FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY prayer_audio_update_admin ON public.prayer_audio FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY prayer_audio_delete_admin ON public.prayer_audio FOR DELETE USING (public.profile_is_admin());

CREATE POLICY daily_verse_select_all ON public.daily_verse FOR SELECT USING (true);
CREATE POLICY daily_verse_write_admin ON public.daily_verse FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY daily_verse_update_admin ON public.daily_verse FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY daily_verse_delete_admin ON public.daily_verse FOR DELETE USING (public.profile_is_admin());

CREATE POLICY audio_collection_select_all ON public.audio_collection_card FOR SELECT USING (true);
CREATE POLICY audio_collection_write_admin ON public.audio_collection_card FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY audio_collection_update_admin ON public.audio_collection_card FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY audio_collection_delete_admin ON public.audio_collection_card FOR DELETE USING (public.profile_is_admin());

CREATE POLICY audio_essential_select_all ON public.audio_essential_tile FOR SELECT USING (true);
CREATE POLICY audio_essential_write_admin ON public.audio_essential_tile FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY audio_essential_update_admin ON public.audio_essential_tile FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY audio_essential_delete_admin ON public.audio_essential_tile FOR DELETE USING (public.profile_is_admin());

CREATE POLICY music_spotlight_select_all ON public.music_spotlight_entry FOR SELECT USING (true);
CREATE POLICY music_spotlight_write_admin ON public.music_spotlight_entry FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY music_spotlight_update_admin ON public.music_spotlight_entry FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY music_spotlight_delete_admin ON public.music_spotlight_entry FOR DELETE USING (public.profile_is_admin());

CREATE POLICY movement_copy_select_all ON public.movement_landing_copy FOR SELECT USING (true);
CREATE POLICY movement_copy_insert_admin ON public.movement_landing_copy FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY movement_copy_update_admin ON public.movement_landing_copy FOR UPDATE USING (public.profile_is_admin());

CREATE POLICY movement_hero_select_all ON public.movement_hero_tile FOR SELECT USING (true);
CREATE POLICY movement_hero_write_admin ON public.movement_hero_tile FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY movement_hero_update_admin ON public.movement_hero_tile FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY movement_hero_delete_admin ON public.movement_hero_tile FOR DELETE USING (public.profile_is_admin());

CREATE POLICY movement_quickie_select_all ON public.movement_quickie_card FOR SELECT USING (true);
CREATE POLICY movement_quickie_write_admin ON public.movement_quickie_card FOR INSERT WITH CHECK (public.profile_is_admin());
CREATE POLICY movement_quickie_update_admin ON public.movement_quickie_card FOR UPDATE USING (public.profile_is_admin());
CREATE POLICY movement_quickie_delete_admin ON public.movement_quickie_card FOR DELETE USING (public.profile_is_admin());

-- User completions & journal: own rows only
CREATE POLICY udc_all_own ON public.user_day_completion FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY uwc_all_own ON public.user_workout_completion FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY upc_all_own ON public.user_prayer_completion FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY pje_all_own ON public.prayer_journal_entry FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY prm_all_own ON public.prayer_reminder FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Community: read all; create posts; mutations aligned with logged-in user when set
CREATE POLICY prayer_req_select ON public.prayer_request FOR SELECT USING (true);
CREATE POLICY prayer_req_insert ON public.prayer_request FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY praise_rep_select ON public.praise_report FOR SELECT USING (true);
CREATE POLICY praise_rep_insert ON public.praise_report FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY pri_select ON public.prayer_request_interaction FOR SELECT USING (true);
CREATE POLICY pri_insert ON public.prayer_request_interaction FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY pri_update ON public.prayer_request_interaction FOR UPDATE USING (user_id IS NOT NULL AND user_id = auth.uid());
CREATE POLICY pri_delete ON public.prayer_request_interaction FOR DELETE USING (user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY prl_select ON public.praise_report_like FOR SELECT USING (true);
CREATE POLICY prl_insert ON public.praise_report_like FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY prl_delete ON public.praise_report_like FOR DELETE USING (user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY prc_select ON public.prayer_request_comment FOR SELECT USING (true);
CREATE POLICY prc_insert ON public.prayer_request_comment FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY plc_select ON public.praise_report_comment FOR SELECT USING (true);
CREATE POLICY plc_insert ON public.praise_report_comment FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 6) Realtime (CMS + schedule sync for web / iOS)
-- -----------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.week_schedule;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_day;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_audio;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_verse;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audio_collection_card;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audio_essential_tile;
ALTER PUBLICATION supabase_realtime ADD TABLE public.music_spotlight_entry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movement_landing_copy;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movement_hero_tile;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movement_quickie_card;
