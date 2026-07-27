-- UP
-- Add Phase 1 permissions

INSERT INTO permissions (code, name, module) VALUES
  -- Departments
  ('departments.list', 'List Departments', 'departments'),
  ('departments.create', 'Create Departments', 'departments'),
  ('departments.update', 'Update Departments', 'departments'),
  ('departments.delete', 'Delete Departments', 'departments'),
  -- Designations
  ('designations.list', 'List Designations', 'designations'),
  ('designations.create', 'Create Designations', 'designations'),
  ('designations.update', 'Update Designations', 'designations'),
  ('designations.delete', 'Delete Designations', 'designations'),
  -- Teams
  ('teams.list', 'List Teams', 'teams'),
  ('teams.create', 'Create Teams', 'teams'),
  ('teams.update', 'Update Teams', 'teams'),
  ('teams.delete', 'Delete Teams', 'teams'),
  -- Tasks (extended)
  ('tasks.assign', 'Assign Tasks', 'tasks'),
  ('tasks.watch', 'Watch Tasks', 'tasks'),
  ('tasks.checklist', 'Manage Task Checklists', 'tasks'),
  ('tasks.labels', 'Manage Task Labels', 'tasks'),
  -- Work Logs
  ('work_logs.list', 'List Work Logs', 'work_logs'),
  ('work_logs.create', 'Create Work Log', 'work_logs'),
  ('work_logs.update', 'Update Work Log', 'work_logs'),
  ('work_logs.approve', 'Approve Work Logs', 'work_logs'),
  -- Timeline
  ('timeline.view', 'View Activity Timeline', 'timeline'),
  ('timeline.export', 'Export Timeline', 'timeline'),
  -- Projects (extended)
  ('projects.modules', 'Manage Project Modules', 'projects'),
  ('projects.milestones', 'Manage Milestones', 'projects'),
  ('projects.archive', 'Archive Projects', 'projects')
ON CONFLICT (code) DO NOTHING;

-- DOWN
DELETE FROM permissions WHERE code IN (
  'departments.list', 'departments.create', 'departments.update', 'departments.delete',
  'designations.list', 'designations.create', 'designations.update', 'designations.delete',
  'teams.list', 'teams.create', 'teams.update', 'teams.delete',
  'tasks.assign', 'tasks.watch', 'tasks.checklist', 'tasks.labels',
  'work_logs.list', 'work_logs.create', 'work_logs.update', 'work_logs.approve',
  'timeline.view', 'timeline.export',
  'projects.modules', 'projects.milestones', 'projects.archive'
);
