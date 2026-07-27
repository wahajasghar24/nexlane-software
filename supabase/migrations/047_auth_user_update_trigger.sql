-- UP
-- ====================================================================
-- Add UPDATE trigger on auth.users so that email / metadata changes
-- in Supabase Auth are automatically propagated to the profiles table.
--
-- The UPSERT function handle_auth_user_change() already exists from
-- migration 046; we just need an additional trigger on UPDATE.
--
-- Note: Supabase Auth may also update other fields (e.g. phone,
-- confirmed_at) that are not stored in profiles — those are ignored.
-- ====================================================================

CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email
     OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION handle_auth_user_change();


-- DOWN
-- ====================================================================
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
