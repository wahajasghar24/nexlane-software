-- UP
-- Task extensions: multiple assignees, labels, checklists, watchers, dependencies

-- Task assignees (multiple)
CREATE TABLE task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, employee_id)
);

-- Task labels
CREATE TABLE task_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Task-label mapping
CREATE TABLE task_label_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES task_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, label_id)
);

-- Task checklist items
CREATE TABLE task_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task watchers
CREATE TABLE task_watchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, employee_id)
);

-- Task dependencies
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'blocks' CHECK (dependency_type IN ('blocks', 'depends_on', 'related')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Update tasks table statuses
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES project_modules(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Drop existing CHECK constraint if any and re-add with expanded statuses
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('todo', 'in_progress', 'blocked', 'review', 'testing', 'completed', 'cancelled'));

-- Indexes
CREATE INDEX idx_task_assignees_task ON task_assignees(task_id);
CREATE INDEX idx_task_assignees_employee ON task_assignees(employee_id);
CREATE INDEX idx_task_label_mappings_task ON task_label_mappings(task_id);
CREATE INDEX idx_task_checklist_items_task ON task_checklist_items(task_id, sort_order);
CREATE INDEX idx_task_watchers_task ON task_watchers(task_id);
CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends ON task_dependencies(depends_on_task_id);
CREATE INDEX idx_tasks_module ON tasks(module_id);
CREATE INDEX idx_tasks_archived ON tasks(company_id, is_archived);

-- DOWN
DROP INDEX IF EXISTS idx_tasks_archived;
DROP INDEX IF EXISTS idx_tasks_module;
DROP INDEX IF EXISTS idx_task_dependencies_depends;
DROP INDEX IF EXISTS idx_task_dependencies_task;
DROP INDEX IF EXISTS idx_task_watchers_task;
DROP INDEX IF EXISTS idx_task_checklist_items_task;
DROP INDEX IF EXISTS idx_task_label_mappings_task;
DROP INDEX IF EXISTS idx_task_assignees_employee;
DROP INDEX IF EXISTS idx_task_assignees_task;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('todo', 'in_progress', 'review', 'completed'));
ALTER TABLE tasks DROP COLUMN IF EXISTS is_archived;
ALTER TABLE tasks DROP COLUMN IF EXISTS module_id;

DROP TABLE IF EXISTS task_dependencies;
DROP TABLE IF EXISTS task_watchers;
DROP TABLE IF EXISTS task_checklist_items;
DROP TABLE IF EXISTS task_label_mappings;
DROP TABLE IF EXISTS task_labels;
DROP TABLE IF EXISTS task_assignees;
