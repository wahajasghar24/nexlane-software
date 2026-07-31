-- 051 QA hotfixes captured 2026-07-31 (live DB already patched via Management API)
-- Consistency: fresh setups apply these so they match the live production DB.

-- 1. employees: denormalized full_name (+ sync trigger from profiles)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE employees e SET full_name = p.full_name FROM profiles p WHERE e.profile_id = p.id AND e.full_name IS NULL;

CREATE OR REPLACE FUNCTION sync_employee_full_name() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE employees SET full_name = NEW.full_name WHERE profile_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_employee_full_name ON profiles;
CREATE TRIGGER trg_sync_employee_full_name
  AFTER INSERT OR UPDATE OF full_name ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_employee_full_name();

-- 2. Correct FK targets: actor columns must reference profiles(id) (services pass user ids)
ALTER TABLE accounting_periods DROP CONSTRAINT IF EXISTS accounting_periods_closed_by_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_created_by_fkey;
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_posted_by_fkey;
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_voided_by_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_created_by_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_created_by_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE file_attachments DROP CONSTRAINT IF EXISTS file_attachments_uploaded_by_fkey;

UPDATE journal_entries SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM profiles);
UPDATE journal_entries SET posted_by = NULL WHERE posted_by IS NOT NULL AND posted_by NOT IN (SELECT id FROM profiles);
UPDATE journal_entries SET voided_by = NULL WHERE voided_by IS NOT NULL AND voided_by NOT IN (SELECT id FROM profiles);
UPDATE invoices SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM profiles);
UPDATE payments SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM profiles);
UPDATE notifications SET user_id = NULL WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM profiles);
UPDATE file_attachments SET uploaded_by = NULL WHERE uploaded_by IS NOT NULL AND uploaded_by NOT IN (SELECT id FROM profiles);
UPDATE audit_logs SET actor_id = NULL WHERE actor_id IS NOT NULL AND actor_id NOT IN (SELECT id FROM profiles);
UPDATE accounting_periods SET closed_by = NULL WHERE closed_by IS NOT NULL AND closed_by NOT IN (SELECT id FROM profiles);

ALTER TABLE accounting_periods ADD CONSTRAINT accounting_periods_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_voided_by_fkey FOREIGN KEY (voided_by) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE payments ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE file_attachments ADD CONSTRAINT file_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. RLS helper functions + company-scoped policies for tables created without policies
-- (auth_company_id reads JWT claim; inline pattern used by the app's working tables)
CREATE OR REPLACE FUNCTION public.auth_company_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'company_id', ''),
    NULL
  )::uuid
$$;

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid, cid uuid)
RETURNS boolean LANGUAGE plpgsql STABLE AS $$
DECLARE
  admin_roles TEXT[] := ARRAY['Owner', 'Admin'];
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = uid AND ur.company_id = cid AND r.name = ANY(admin_roles)
  );
END;
$$;

-- 4. leads columns (040 ALTERs) + teams.created_by
ALTER TABLE leads ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS crm_company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
