-- handle_new_user() inserts profiles without updated_at; column was NOT NULL with no default,
-- which caused Supabase Auth createUser/signUp to fail (500) and left no users to sign in.
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
