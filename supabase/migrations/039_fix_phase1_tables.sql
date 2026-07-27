-- UP
-- Fix Phase 1 table inconsistencies: missing columns and tables

-- employee_skills: add company_id and audit columns
ALTER TABLE employee_skills ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE employee_skills ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE employee_skills ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
UPDATE employee_skills SET company_id = (SELECT company_id FROM employees WHERE employees.id = employee_skills.employee_id);
ALTER TABLE employee_skills ALTER COLUMN company_id SET NOT NULL;

-- task_assignees: add company_id and assigned_by
ALTER TABLE task_assignees ADD COLUMN IF NOT EXISTS company_id UUID NOT NULL REFERENCES companies(id);
ALTER TABLE task_assignees ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES profiles(id);

-- task_checklist_items: add company_id and audit columns
ALTER TABLE task_checklist_items ADD COLUMN IF NOT EXISTS company_id UUID NOT NULL REFERENCES companies(id);
ALTER TABLE task_checklist_items ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE task_checklist_items ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);

-- task_watchers: add company_id
ALTER TABLE task_watchers ADD COLUMN IF NOT EXISTS company_id UUID NOT NULL REFERENCES companies(id);

-- task_dependencies: add company_id and created_by
ALTER TABLE task_dependencies ADD COLUMN IF NOT EXISTS company_id UUID NOT NULL REFERENCES companies(id);
ALTER TABLE task_dependencies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- work_logs: add audit columns
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);

-- task_attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_company ON employee_skills(company_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_company ON task_assignees(company_id);
CREATE INDEX IF NOT EXISTS idx_task_checklist_company ON task_checklist_items(company_id);
CREATE INDEX IF NOT EXISTS idx_task_watchers_company ON task_watchers(company_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_company ON task_dependencies(company_id);

-- DOWN
DROP INDEX IF EXISTS idx_task_dependencies_company;
DROP INDEX IF EXISTS idx_task_watchers_company;
DROP INDEX IF EXISTS idx_task_checklist_company;
DROP INDEX IF EXISTS idx_task_assignees_company;
DROP INDEX IF EXISTS idx_employee_skills_company;
DROP INDEX IF EXISTS idx_task_attachments_task;

DROP TABLE IF EXISTS task_attachments;

ALTER TABLE work_logs DROP COLUMN IF EXISTS updated_by;
ALTER TABLE work_logs DROP COLUMN IF EXISTS created_by;
ALTER TABLE task_dependencies DROP COLUMN IF EXISTS created_by;
ALTER TABLE task_dependencies DROP COLUMN IF EXISTS company_id;
ALTER TABLE task_watchers DROP COLUMN IF EXISTS company_id;
ALTER TABLE task_checklist_items DROP COLUMN IF EXISTS updated_by;
ALTER TABLE task_checklist_items DROP COLUMN IF EXISTS created_by;
ALTER TABLE task_checklist_items DROP COLUMN IF EXISTS company_id;
ALTER TABLE task_assignees DROP COLUMN IF EXISTS assigned_by;
ALTER TABLE task_assignees DROP COLUMN IF EXISTS company_id;
ALTER TABLE employee_skills DROP COLUMN IF EXISTS updated_by;
ALTER TABLE employee_skills DROP COLUMN IF EXISTS created_by;
ALTER TABLE employee_skills DROP COLUMN IF EXISTS company_id;
