-- 053_schema_drift_sync.sql
-- QA audit (2026-07-31): live DB was missing columns the app code writes.
-- Applied directly to live via Management API; captured here for fresh installs.

-- work_logs: approve flow + extended logging fields
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS progress_percentage INTEGER;
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS blockers TEXT;
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS next_step TEXT;
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- contacts: designation (was 'position' in an older schema), whatsapp, notes
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;

-- crm_companies: structured address + notes
ALTER TABLE crm_companies ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE crm_companies ADD COLUMN IF NOT EXISTS notes TEXT;

-- notifications: channel + metadata payloads
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS channel TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB;

-- project_members: missing company_id/role (RLS + insert path depend on them)
ALTER TABLE project_members ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE project_members ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- project_members had RLS enabled but ZERO policies (live drift) -> default deny blocked all access.
-- Recreate with the inline company_members subquery pattern (same as projects).
DROP POLICY IF EXISTS project_members_select ON project_members;
DROP POLICY IF EXISTS project_members_insert ON project_members;
DROP POLICY IF EXISTS project_members_update ON project_members;
DROP POLICY IF EXISTS project_members_delete ON project_members;
CREATE POLICY project_members_select ON project_members FOR SELECT
  USING (company_id IN (SELECT company_members.company_id FROM company_members WHERE company_members.profile_id = auth.uid()));
CREATE POLICY project_members_insert ON project_members FOR INSERT
  WITH CHECK (company_id IN (SELECT company_members.company_id FROM company_members WHERE company_members.profile_id = auth.uid()));
CREATE POLICY project_members_update ON project_members FOR UPDATE
  USING (company_id IN (SELECT company_members.company_id FROM company_members WHERE company_members.profile_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_members.company_id FROM company_members WHERE company_members.profile_id = auth.uid()));
CREATE POLICY project_members_delete ON project_members FOR DELETE
  USING (company_id IN (SELECT company_members.company_id FROM company_members WHERE company_members.profile_id = auth.uid()));

-- updated_by missing on tables the code updates (PATCH flows were 500)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE crm_companies ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE project_modules ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE employee_notes ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE task_dependencies ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
