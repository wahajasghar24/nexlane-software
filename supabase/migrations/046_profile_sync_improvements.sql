-- UP
-- ====================================================================
-- Upgrade the profile-sync database trigger so it is idempotent:
--   • On INSERT into auth.users  → create profile (as before)
--   • ON CONFLICT                → update email / full_name / last_sign_in_at
--
-- Combined with the application-level sync in profile-sync.ts this
-- covers both self-hosted (DB trigger) and hosted Supabase (app code).
-- ====================================================================

-- Replace the old function with a robust upsert version
CREATE OR REPLACE FUNCTION handle_auth_user_change()
RETURNS TRIGGER AS $$
DECLARE
  _full_name TEXT;
BEGIN
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'Unknown'
  );

  INSERT INTO public.profiles (id, email, full_name, last_sign_in_at)
  VALUES (NEW.id, NEW.email, _full_name, NOW())
  ON CONFLICT (id) DO UPDATE SET
    email           = EXCLUDED.email,
    full_name       = CASE
                        WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL
                        THEN EXCLUDED.full_name
                        ELSE profiles.full_name
                      END,
    last_sign_in_at = NOW(),
    updated_at      = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger and function so we can re-register
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user;

-- Register the new trigger on INSERT (profile creation for new users)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_change();


-- DOWN
-- ====================================================================
-- Restore the original (insert-only) behaviour.
-- ====================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_auth_user_change;

CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();
