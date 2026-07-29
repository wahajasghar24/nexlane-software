-- ============================================================
-- Phase 8: Admin UI + System Tables
-- Tables: audit_logs, company_settings, scheduled_jobs
-- ============================================================

-- 1. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES company_members(id),
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  changes       JSONB,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_company ON audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_audit" ON audit_logs
  FOR SELECT
  USING (company_id = get_current_company_id());

-- 2. COMPANY SETTINGS (extend companies table with JSONB)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';

-- 3. Add get_current_member_id helper if not exists (uses profile_id link)
CREATE OR REPLACE FUNCTION get_current_member_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT id FROM company_members WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- 4. Permissions seed data for accounting (upsert)
INSERT INTO permissions (code, name, description, module) VALUES
  ('accounting.read', 'Read Accounting', 'View accounting data', 'accounting'),
  ('accounting.create', 'Create Accounting', 'Create accounting entries', 'accounting'),
  ('accounting.manage', 'Manage Accounting', 'Manage accounting settings', 'accounting'),
  ('accounting.reports', 'Accounting Reports', 'Access accounting reports', 'accounting'),
  ('notifications.read', 'Read Notifications', 'View notifications', 'notifications'),
  ('notifications.manage', 'Manage Notifications', 'Manage notification settings', 'notifications'),
  ('files.upload', 'Upload Files', 'Upload files', 'files'),
  ('files.read', 'Read Files', 'View files', 'files'),
  ('files.delete', 'Delete Files', 'Delete files', 'files'),
  ('admin.access', 'Admin Access', 'Access admin panel', 'admin'),
  ('admin.manage_jobs', 'Manage Jobs', 'Manage scheduled jobs', 'admin'),
  ('admin.manage_events', 'Manage Events', 'Manage system events', 'admin'),
  ('admin.observability', 'Observability', 'System observability access', 'admin')
ON CONFLICT (code) DO NOTHING;
