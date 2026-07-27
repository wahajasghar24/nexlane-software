-- Seed Data for Nexlane
-- Run after all migrations are applied

-- 0. Demo Auth Users (for local development)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'alex@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"Alex Chen"}', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000002', 'sarah@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"Sarah Johnson"}', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000003', 'mike@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"Mike Rivera"}', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000004', 'priya@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"Priya Sharma"}', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000005', 'james@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"James Wilson"}', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000006', 'emma@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"Emma Davis"}', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000007', 'omar@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"Omar Hassan"}', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000008', 'lisa@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"Lisa Kim"}', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000009', 'david@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"David Thompson"}', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000010', 'anna@nexlane.com', crypt('password123', gen_salt('bf')), NOW(), '{"full_name":"Anna Martinez"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 1. Profiles
INSERT INTO profiles (id, email, full_name, phone) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'alex@nexlane.com', 'Alex Chen', '+1-555-0101'),
  ('f0000000-0000-0000-0000-000000000002', 'sarah@nexlane.com', 'Sarah Johnson', '+1-555-0102'),
  ('f0000000-0000-0000-0000-000000000003', 'mike@nexlane.com', 'Mike Rivera', '+1-555-0103'),
  ('f0000000-0000-0000-0000-000000000004', 'priya@nexlane.com', 'Priya Sharma', '+1-555-0104'),
  ('f0000000-0000-0000-0000-000000000005', 'james@nexlane.com', 'James Wilson', '+1-555-0105'),
  ('f0000000-0000-0000-0000-000000000006', 'emma@nexlane.com', 'Emma Davis', '+1-555-0106'),
  ('f0000000-0000-0000-0000-000000000007', 'omar@nexlane.com', 'Omar Hassan', '+1-555-0107'),
  ('f0000000-0000-0000-0000-000000000008', 'lisa@nexlane.com', 'Lisa Kim', '+1-555-0108'),
  ('f0000000-0000-0000-0000-000000000009', 'david@nexlane.com', 'David Thompson', '+1-555-0109'),
  ('f0000000-0000-0000-0000-000000000010', 'anna@nexlane.com', 'Anna Martinez', '+1-555-0110')
ON CONFLICT (id) DO NOTHING;

-- 1b. Company Memberships
INSERT INTO company_members (company_id, profile_id, is_default) VALUES
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', true),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003', true),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000004', true),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', true),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000006', true),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000007', true),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000008', true),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000009', true),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000010', true)
ON CONFLICT DO NOTHING;

-- 2. Permissions (all modules) — preserved from original
INSERT INTO permissions (code, name, module) VALUES
  -- RBAC
  ('rbac.manage', 'Manage RBAC', 'rbac'),
  -- Employees
  ('employees.list', 'List Employees', 'employees'),
  ('employees.read', 'View Employee', 'employees'),
  ('employees.create', 'Create Employee', 'employees'),
  ('employees.update', 'Update Employee', 'employees'),
  ('employees.delete', 'Delete Employee', 'employees'),
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
  -- Projects
  ('projects.list', 'List Projects', 'projects'),
  ('projects.read', 'View Project', 'projects'),
  ('projects.create', 'Create Project', 'projects'),
  ('projects.update', 'Update Project', 'projects'),
  ('projects.delete', 'Delete Project', 'projects'),
  ('projects.manage_members', 'Manage Project Members', 'projects'),
  ('projects.modules', 'Manage Project Modules', 'projects'),
  ('projects.milestones', 'Manage Milestones', 'projects'),
  ('projects.archive', 'Archive Projects', 'projects'),
  -- Tasks
  ('tasks.list', 'List Tasks', 'tasks'),
  ('tasks.read', 'View Task', 'tasks'),
  ('tasks.create', 'Create Task', 'tasks'),
  ('tasks.update', 'Update Task', 'tasks'),
  ('tasks.delete', 'Delete Task', 'tasks'),
  ('tasks.comment', 'Comment on Task', 'tasks'),
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
  -- Leads
  ('leads.list', 'List Leads', 'crm'),
  ('leads.read', 'View Lead', 'crm'),
  ('leads.create', 'Create Lead', 'crm'),
  ('leads.update', 'Update Lead', 'crm'),
  ('leads.delete', 'Delete Lead', 'crm'),
  ('leads.convert', 'Convert Lead', 'crm'),
  -- Customers
  ('customers.list', 'List Customers', 'crm'),
  ('customers.read', 'View Customer', 'crm'),
  ('customers.create', 'Create Customer', 'crm'),
  ('customers.update', 'Update Customer', 'crm'),
  ('customers.delete', 'Delete Customer', 'crm'),
  -- Accounting
  ('accounting.read', 'View Accounting Data', 'accounting'),
  ('accounting.create', 'Create Accounting Entries', 'accounting'),
  ('accounting.manage', 'Manage Accounting Configuration', 'accounting'),
  ('accounting.reports', 'View Accounting Reports', 'accounting'),
  -- Spreadsheets
  ('spreadsheets.list', 'List Spreadsheets', 'spreadsheets'),
  ('spreadsheets.read', 'View Spreadsheet', 'spreadsheets'),
  ('spreadsheets.create', 'Create Spreadsheet', 'spreadsheets'),
  ('spreadsheets.update', 'Update Spreadsheet', 'spreadsheets'),
  ('spreadsheets.delete', 'Delete Spreadsheet', 'spreadsheets'),
  ('spreadsheets.manage_columns', 'Manage Columns', 'spreadsheets'),
  ('spreadsheets.edit_data', 'Edit Spreadsheet Data', 'spreadsheets'),
  -- Settings
  ('settings.read', 'View Settings', 'settings'),
  ('settings.manage', 'Manage Settings', 'settings'),
  -- Files
  ('files.upload', 'Upload Files', 'files'),
  ('files.read', 'View Files', 'files'),
  ('files.delete', 'Delete Files', 'files'),
  -- Comments
  ('comments.read', 'View Comments', 'comments'),
  ('comments.create', 'Create Comment', 'comments'),
  ('comments.update', 'Update Comment', 'comments'),
  ('comments.delete', 'Delete Comment', 'comments'),
  -- Tags
  ('tags.read', 'View Tags', 'tags'),
  ('tags.manage', 'Manage Tags', 'tags'),
  -- Reports
  ('reports.dashboard', 'View Dashboard', 'reports'),
  ('reports.financial', 'View Financial Reports', 'reports'),
  ('reports.projects', 'View Project Reports', 'reports'),
  ('reports.tasks', 'View Task Reports', 'reports'),
  -- Activity
  ('activity.list', 'View Activity Log', 'activity'),
  -- Notifications
  ('notifications.read', 'View Notifications', 'notifications'),
  ('notifications.manage', 'Manage Notifications', 'notifications'),
  -- Admin
  ('admin.access', 'Admin Access', 'admin'),
  ('admin.manage_jobs', 'Manage Background Jobs', 'admin'),
  ('admin.manage_events', 'Manage Domain Events', 'admin'),
  ('admin.observability', 'View Observability Data', 'admin'),
  -- Invoices
  ('invoices.list', 'List Invoices', 'invoices'),
  ('invoices.read', 'View Invoice', 'invoices')
ON CONFLICT (code) DO NOTHING;

-- 3. Departments
INSERT INTO departments (id, company_id, name, description) VALUES
  ('d1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Engineering', 'Software development and infrastructure'),
  ('d1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Design', 'UI/UX and visual design'),
  ('d1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Product', 'Product strategy and management'),
  ('d1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Marketing', 'Brand and demand generation'),
  ('d1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Sales', 'Revenue and account management'),
  ('d1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Operations', 'Business operations and HR')
ON CONFLICT (company_id, name) DO NOTHING;

-- 4. Designations
INSERT INTO designations (id, company_id, name, description) VALUES
  ('e1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'CEO', 'Chief Executive Officer'),
  ('e1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'CTO', 'Chief Technology Officer'),
  ('e1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'VP of Engineering', 'Vice President of Engineering'),
  ('e1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Engineering Manager', 'Manages engineering team'),
  ('e1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Senior Software Engineer', 'Senior level engineer'),
  ('e1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Software Engineer', 'Mid-level engineer'),
  ('e1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Junior Software Engineer', 'Entry level engineer'),
  ('e1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Design Lead', 'Leads design team'),
  ('e1000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Product Designer', 'Product design specialist'),
  ('e1000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Product Manager', 'Product management'),
  ('e1000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Marketing Lead', 'Leads marketing'),
  ('e1000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Sales Manager', 'Manages sales team'),
  ('e1000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'HR Manager', 'Human resources manager'),
  ('e1000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'DevOps Engineer', 'Infrastructure and DevOps')
ON CONFLICT (company_id, name) DO NOTHING;

-- 5. Employees
INSERT INTO employees (id, company_id, profile_id, employee_code, department_id, designation_id, position, hire_date, employment_status, manager_id, created_by, bio, total_hours) VALUES
  ('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'EMP-001', 'd1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'CEO', '2020-01-15', 'active', NULL, 'f0000000-0000-0000-0000-000000000001', 'Founder and CEO with 15+ years of experience in enterprise SaaS.', 520),
  ('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'EMP-002', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', 'CTO', '2020-01-15', 'active', 'a1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'CTO with expertise in distributed systems and cloud architecture.', 480),
  ('a1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003', 'EMP-003', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000003', 'VP of Engineering', '2020-06-01', 'active', 'a1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'VP Eng leading a team of 12 engineers across multiple squads.', 510),
  ('a1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000004', 'EMP-004', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000005', 'Senior Software Engineer', '2021-03-15', 'active', 'a1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'Full-stack engineer specializing in React, Node.js, and PostgreSQL.', 420),
  ('a1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', 'EMP-005', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000006', 'Software Engineer', '2022-01-10', 'active', 'a1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'Backend engineer focused on API design and database optimization.', 350),
  ('a1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000006', 'EMP-006', 'd1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000008', 'Design Lead', '2021-06-01', 'active', 'a1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Design lead with passion for creating intuitive user experiences.', 380),
  ('a1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000007', 'EMP-007', 'd1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000009', 'Product Designer', '2022-06-15', 'active', 'a1000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000006', 'Product designer skilled in Figma, prototyping, and design systems.', 310),
  ('a1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000008', 'EMP-008', 'd1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000010', 'Product Manager', '2021-09-01', 'active', 'a1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'PM driving product strategy for the core platform.', 360),
  ('a1000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000009', 'EMP-009', 'd1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000011', 'Marketing Lead', '2021-11-01', 'active', 'a1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Marketing leader focused on B2B SaaS growth strategies.', 290),
  ('a1000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000010', 'EMP-010', 'd1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000014', 'DevOps Engineer', '2022-03-01', 'active', 'a1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'DevOps engineer managing cloud infrastructure and CI/CD pipelines.', 330)
ON CONFLICT (company_id, employee_code) DO NOTHING;

-- 6. Employee Skills
INSERT INTO employee_skills (employee_id, skill, proficiency) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'PostgreSQL', 'expert'),
  ('a1000000-0000-0000-0000-000000000002', 'Kubernetes', 'expert'),
  ('a1000000-0000-0000-0000-000000000002', 'TypeScript', 'advanced'),
  ('a1000000-0000-0000-0000-000000000003', 'React', 'expert'),
  ('a1000000-0000-0000-0000-000000000003', 'Node.js', 'expert'),
  ('a1000000-0000-0000-0000-000000000003', 'System Design', 'expert'),
  ('a1000000-0000-0000-0000-000000000004', 'React', 'expert'),
  ('a1000000-0000-0000-0000-000000000004', 'TypeScript', 'expert'),
  ('a1000000-0000-0000-0000-000000000004', 'Next.js', 'advanced'),
  ('a1000000-0000-0000-0000-000000000004', 'Node.js', 'advanced'),
  ('a1000000-0000-0000-0000-000000000005', 'Python', 'advanced'),
  ('a1000000-0000-0000-0000-000000000005', 'PostgreSQL', 'advanced'),
  ('a1000000-0000-0000-0000-000000000005', 'REST APIs', 'advanced'),
  ('a1000000-0000-0000-0000-000000000006', 'Figma', 'expert'),
  ('a1000000-0000-0000-0000-000000000006', 'Design Systems', 'expert'),
  ('a1000000-0000-0000-0000-000000000006', 'User Research', 'advanced'),
  ('a1000000-0000-0000-0000-000000000007', 'Figma', 'advanced'),
  ('a1000000-0000-0000-0000-000000000007', 'Prototyping', 'advanced'),
  ('a1000000-0000-0000-0000-000000000007', 'UI Design', 'advanced'),
  ('a1000000-0000-0000-0000-000000000010', 'AWS', 'expert'),
  ('a1000000-0000-0000-0000-000000000010', 'Docker', 'expert'),
  ('a1000000-0000-0000-0000-000000000010', 'Terraform', 'advanced'),
  ('a1000000-0000-0000-0000-000000000010', 'CI/CD', 'advanced')
ON CONFLICT DO NOTHING;

-- 7. Teams
INSERT INTO teams (id, company_id, name, description, lead_id) VALUES
  ('b1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Platform Team', 'Core platform development', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Design Team', 'Product and brand design', 'a1000000-0000-0000-0000-000000000006'),
  ('b1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Infrastructure Team', 'Cloud and DevOps', 'a1000000-0000-0000-0000-000000000010'),
  ('b1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Product Squad', 'Product management and strategy', 'a1000000-0000-0000-0000-000000000008')
ON CONFLICT (company_id, name) DO NOTHING;

-- 8. Team Members
INSERT INTO team_members (team_id, employee_id, role) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Lead'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'Member'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Member'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 'Lead'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000007', 'Member'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000010', 'Lead'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Member'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000008', 'Lead'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Member')
ON CONFLICT DO NOTHING;

-- 9. Projects
INSERT INTO projects (id, company_id, name, description, status, priority, start_date, end_date, budget, created_by, client_name, color, progress_percentage) VALUES
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Nexlane Core Platform', 'Main SaaS platform development', 'in_progress', 'high', '2024-01-01', '2024-12-31', 500000, 'f0000000-0000-0000-0000-000000000001', NULL, '#6366f1', 65),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Mobile App v2', 'React Native mobile application redesign', 'in_progress', 'high', '2024-03-01', '2024-09-30', 200000, 'f0000000-0000-0000-0000-000000000008', NULL, '#f59e0b', 40),
  ('c1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Customer Portal', 'Self-service customer dashboard', 'planning', 'medium', '2024-06-01', '2024-11-30', 150000, 'f0000000-0000-0000-0000-000000000008', 'Acme Corp', '#10b981', 10),
  ('c1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Analytics Dashboard', 'Real-time business analytics platform', 'completed', 'medium', '2023-09-01', '2024-02-28', 180000, 'f0000000-0000-0000-0000-000000000001', NULL, '#8b5cf6', 100),
  ('c1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'API Gateway Migration', 'Migrate from REST to GraphQL API gateway', 'on_hold', 'low', '2024-04-01', '2024-08-31', 120000, 'f0000000-0000-0000-0000-000000000002', NULL, '#ef4444', 25)
ON CONFLICT DO NOTHING;

-- 10. Project Members
INSERT INTO project_members (project_id, employee_id, role) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Tech Lead'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'Developer'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 'Designer'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 'Product Owner'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'Developer'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000007', 'Designer'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008', 'Product Owner'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'Developer'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006', 'Designer'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000008', 'Product Owner'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'Lead Developer'),
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000010', 'Lead'),
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Architect')
ON CONFLICT DO NOTHING;

-- 11. Project Modules
INSERT INTO project_modules (id, company_id, project_id, name, description, status, sort_order, created_by) VALUES
  ('g1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Authentication', 'User auth and SSO', 'completed', 1, 'f0000000-0000-0000-0000-000000000001'),
  ('g1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Employee Management', 'Employee CRUD and profiles', 'completed', 2, 'f0000000-0000-0000-0000-000000000001'),
  ('g1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Project Management', 'Project CRUD and tracking', 'in_progress', 3, 'f0000000-0000-0000-0000-000000000001'),
  ('g1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Task Management', 'Task CRUD and workflow', 'in_progress', 4, 'f0000000-0000-0000-0000-000000000001'),
  ('g1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Reporting', 'Reports and analytics', 'planned', 5, 'f0000000-0000-0000-0000-000000000001'),
  ('g1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'User Profile', 'User profile screens', 'in_progress', 1, 'f0000000-0000-0000-0000-000000000008'),
  ('g1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Dashboard', 'Mobile dashboard', 'in_progress', 2, 'f0000000-0000-0000-0000-000000000008'),
  ('g1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Notifications', 'Push notifications', 'planned', 3, 'f0000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

-- 12. Milestones
INSERT INTO milestones (id, company_id, project_id, name, description, due_date, status, created_by) VALUES
  ('h1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'MVP Launch', 'Minimum viable product release', '2024-06-30', 'completed', 'f0000000-0000-0000-0000-000000000001'),
  ('h1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Phase 1 Complete', 'All core modules delivered', '2024-09-30', 'in_progress', 'f0000000-0000-0000-0000-000000000001'),
  ('h1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Beta Release', 'Beta testing with early customers', '2024-12-31', 'pending', 'f0000000-0000-0000-0000-000000000001'),
  ('h1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Design Complete', 'All mobile screens designed', '2024-05-30', 'completed', 'f0000000-0000-0000-0000-000000000008'),
  ('h1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'App Store Submission', 'Submit to App Store and Play Store', '2024-09-30', 'pending', 'f0000000-0000-0000-0000-000000000008'),
  ('h1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'Go Live', 'Analytics dashboard go-live', '2024-02-28', 'completed', 'f0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 13. Task Labels
INSERT INTO task_labels (id, company_id, name, color) VALUES
  ('i1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'bug', '#ef4444'),
  ('i1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'feature', '#6366f1'),
  ('i1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'enhancement', '#10b981'),
  ('i1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'documentation', '#f59e0b'),
  ('i1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'design', '#ec4899'),
  ('i1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'urgent', '#ef4444'),
  ('i1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'backend', '#8b5cf6'),
  ('i1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'frontend', '#06b6d4')
ON CONFLICT DO NOTHING;

-- 14. Tasks
INSERT INTO tasks (id, company_id, title, description, project_id, module_id, status, priority, due_date, estimated_hours, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Implement employee CRUD API', 'Build REST API endpoints for employee management', 'c1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000002', 'completed', 'high', '2024-02-15', 40, 'f0000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Design employee profile page', 'Create Figma designs for employee profile', 'c1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000002', 'completed', 'medium', '2024-02-10', 16, 'f0000000-0000-0000-0000-000000000006'),
  ('d1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Build project dashboard', 'Create project overview dashboard with progress tracking', 'c1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000003', 'in_progress', 'high', '2024-07-30', 60, 'f0000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Add task dependencies', 'Allow tasks to depend on other tasks', 'c1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000004', 'in_progress', 'medium', '2024-08-15', 24, 'f0000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Implement work log feature', 'Daily work logging with approval workflow', 'c1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000004', 'todo', 'high', '2024-09-01', 40, 'f0000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Fix pagination in employee list', 'Employee list pagination breaks with >100 records', 'c1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000002', 'blocked', 'high', '2024-07-20', 8, 'f0000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Design mobile dashboard', 'Create mobile-friendly dashboard layout', 'c1000000-0000-0000-0000-000000000002', 'g1000000-0000-0000-0000-000000000007', 'in_progress', 'high', '2024-08-01', 20, 'f0000000-0000-0000-0000-000000000006'),
  ('d1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Set up CI/CD pipeline', 'Configure GitHub Actions for automated deployment', 'c1000000-0000-0000-0000-000000000005', NULL, 'in_progress', 'high', '2024-07-15', 16, 'f0000000-0000-0000-0000-000000000010'),
  ('d1000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Write API documentation', 'Document all REST API endpoints', 'c1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000004', 'review', 'low', '2024-08-30', 12, 'f0000000-0000-0000-0000-000000000008'),
  ('d1000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Performance optimization', 'Optimize database queries and API response times', 'c1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000003', 'testing', 'medium', '2024-08-15', 32, 'f0000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Customer portal login page', 'Build login UI for customer portal', 'c1000000-0000-0000-0000-000000000003', NULL, 'todo', 'medium', '2024-07-30', 12, 'f0000000-0000-0000-0000-000000000008'),
  ('d1000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Data export feature', 'Allow users to export data as CSV/Excel', 'c1000000-0000-0000-0000-000000000004', NULL, 'completed', 'low', '2024-02-20', 16, 'f0000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Setup monitoring and alerting', 'Configure Datadog monitoring and PagerDuty alerts', 'c1000000-0000-0000-0000-000000000005', NULL, 'completed', 'high', '2024-05-01', 20, 'f0000000-0000-0000-0000-000000000010'),
  ('d1000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Implement task checklist', 'Add checklist subtask support to tasks', 'c1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000004', 'todo', 'medium', '2024-08-20', 16, 'f0000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Add dark mode support', 'Implement dark theme across all pages', 'c1000000-0000-0000-0000-000000000001', NULL, 'cancelled', 'low', '2024-06-30', 12, 'f0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 15. Task Assignees
INSERT INTO task_assignees (task_id, employee_id) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000007'),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000007'),
  ('d1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000010'),
  ('d1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000008'),
  ('d1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000010'),
  ('d1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- 16. Task Label Mappings
INSERT INTO task_label_mappings (task_id, label_id) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000007'),
  ('d1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000007'),
  ('d1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000006', 'i1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000006', 'i1000000-0000-0000-0000-000000000006'),
  ('d1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000008', 'i1000000-0000-0000-0000-000000000007'),
  ('d1000000-0000-0000-0000-000000000009', 'i1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000003'),
  ('d1000000-0000-0000-0000-000000000010', 'i1000000-0000-0000-0000-000000000008'),
  ('d1000000-0000-0000-0000-000000000014', 'i1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000015', 'i1000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- 17. Task Checklist Items
INSERT INTO task_checklist_items (task_id, content, is_completed, sort_order) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Create employee table migration', true, 1),
  ('d1000000-0000-0000-0000-000000000001', 'Implement GET /api/employees', true, 2),
  ('d1000000-0000-0000-0000-000000000001', 'Implement POST /api/employees', true, 3),
  ('d1000000-0000-0000-0000-000000000001', 'Add input validation', true, 4),
  ('d1000000-0000-0000-0000-000000000003', 'Design dashboard layout', true, 1),
  ('d1000000-0000-0000-0000-000000000003', 'Implement stat widgets', false, 2),
  ('d1000000-0000-0000-0000-000000000003', 'Add activity feed', false, 3),
  ('d1000000-0000-0000-0000-000000000003', 'Add chart components', false, 4),
  ('d1000000-0000-0000-0000-000000000004', 'Create task_dependencies table', true, 1),
  ('d1000000-0000-0000-0000-000000000004', 'Implement dependency CRUD API', false, 2),
  ('d1000000-0000-0000-0000-000000000004', 'Add UI for dependency graph', false, 3),
  ('d1000000-0000-0000-0000-000000000007', 'Create dashboard wireframes', true, 1),
  ('d1000000-0000-0000-0000-000000000007', 'Design KPI cards', true, 2),
  ('d1000000-0000-0000-0000-000000000007', 'Design charts and graphs', false, 3)
ON CONFLICT DO NOTHING;

-- 18. Task Watchers
INSERT INTO task_watchers (task_id, employee_id) VALUES
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000008'),
  ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003'),
  ('d1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- 19. Task Dependencies
INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type) VALUES
  ('d1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', 'depends_on'),
  ('d1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000003', 'depends_on'),
  ('d1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'depends_on'),
  ('d1000000-0000-0000-0000-000000000014', 'd1000000-0000-0000-0000-000000000004', 'depends_on')
ON CONFLICT DO NOTHING;

-- 20. Work Logs
INSERT INTO work_logs (id, company_id, employee_id, task_id, log_date, hours, description, status, created_at) VALUES
  ('j1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003', '2024-07-22', 7.5, 'Working on project dashboard API endpoints', 'submitted', '2024-07-22 09:00:00+00'),
  ('j1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003', '2024-07-23', 8.0, 'Dashboard widget implementation and testing', 'submitted', '2024-07-23 09:00:00+00'),
  ('j1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', '2024-07-22', 6.0, 'Database design for task dependencies', 'approved', '2024-07-22 09:00:00+00'),
  ('j1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', '2024-07-23', 7.0, 'API implementation for dependencies', 'draft', '2024-07-23 09:00:00+00'),
  ('j1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000008', '2024-07-22', 8.0, 'Setting up GitHub Actions workflows', 'approved', '2024-07-22 09:00:00+00'),
  ('j1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000007', '2024-07-23', 5.5, 'Mobile dashboard UI design in Figma', 'submitted', '2024-07-23 09:00:00+00'),
  ('j1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000006', '2024-07-21', 3.0, 'Investigating pagination bug - identified root cause', 'submitted', '2024-07-21 09:00:00+00'),
  ('j1000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000009', '2024-07-23', 4.0, 'Drafting API documentation structure', 'draft', '2024-07-23 09:00:00+00')
ON CONFLICT DO NOTHING;

-- 21. Comments
INSERT INTO comments (id, company_id, entity_type, entity_id, author_id, content, created_at) VALUES
  ('k1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'task', 'd1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000008', 'Can we prioritize the chart components? The client demo is next week.', '2024-07-22 10:30:00+00'),
  ('k1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'task', 'd1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000004', 'Sure, I will focus on charts first. Should have a working version by Thursday.', '2024-07-22 11:00:00+00'),
  ('k1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'task', 'd1000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003', 'This is blocked by the database indexing change. I will unblock it today.', '2024-07-23 09:15:00+00'),
  ('k1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'task', 'd1000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000002', 'We need to add indexes on the activity_logs table for this.', '2024-07-21 14:00:00+00'),
  ('k1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'project', 'c1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Great progress on the platform team! Phase 1 is on track.', '2024-07-22 16:00:00+00')
ON CONFLICT DO NOTHING;

-- 22. Tags
INSERT INTO tags (id, company_id, name, color) VALUES
  ('l1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'priority', '#ef4444'),
  ('l1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'blocked', '#f59e0b'),
  ('l1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'in-progress', '#3b82f6'),
  ('l1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'completed', '#10b981'),
  ('l1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'needs-review', '#8b5cf6')
ON CONFLICT DO NOTHING;

-- 23. Activity Logs
INSERT INTO activity_logs (company_id, actor_id, entity_type, entity_id, action, new_data, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'project', 'c1000000-0000-0000-0000-000000000001', 'project.created', '{"name":"Nexlane Core Platform"}', '2024-01-01 09:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'task', 'd1000000-0000-0000-0000-000000000001', 'task.created', '{"title":"Implement employee CRUD API"}', '2024-01-15 10:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000004', 'task', 'd1000000-0000-0000-0000-000000000001', 'task.completed', '{"title":"Implement employee CRUD API"}', '2024-02-15 16:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'project', 'c1000000-0000-0000-0000-000000000004', 'project.completed', '{"name":"Analytics Dashboard"}', '2024-02-28 17:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000008', 'project', 'c1000000-0000-0000-0000-000000000002', 'project.created', '{"name":"Mobile App v2"}', '2024-03-01 09:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000008', 'project', 'c1000000-0000-0000-0000-000000000003', 'project.created', '{"name":"Customer Portal"}', '2024-06-01 09:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000004', 'task', 'd1000000-0000-0000-0000-000000000003', 'task.started', '{"title":"Build project dashboard"}', '2024-06-15 10:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000004', 'task', 'd1000000-0000-0000-0000-000000000006', 'task.blocked', '{"title":"Fix pagination in employee list"}', '2024-07-20 14:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', 'task', 'd1000000-0000-0000-0000-000000000004', 'task.started', '{"title":"Add task dependencies"}', '2024-07-15 09:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000004', 'work_log', 'j1000000-0000-0000-0000-000000000001', 'worklog.created', '{"hours":7.5,"task":"Build project dashboard"}', '2024-07-22 17:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', 'work_log', 'j1000000-0000-0000-0000-000000000003', 'worklog.created', '{"hours":6.0,"task":"Add task dependencies"}', '2024-07-22 17:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000008', 'comment', 'k1000000-0000-0000-0000-000000000001', 'comment.created', '{"entity_type":"task","entity_id":"d1000000-0000-0000-0000-000000000003"}', '2024-07-22 10:30:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'employee', 'a1000000-0000-0000-0000-000000000001', 'employee.created', '{"name":"Alex Chen"}', '2020-01-15 09:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'employee', 'a1000000-0000-0000-0000-000000000010', 'employee.created', '{"name":"Anna Martinez"}', '2022-03-01 09:00:00+00')
ON CONFLICT DO NOTHING;

-- 24. Roles — preserved from original with Phase 1 permission additions
DO $$
DECLARE
  company_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
  owner_id UUID;
  admin_id UUID;
  manager_id UUID;
  employee_id UUID;
  accountant_id UUID;
BEGIN
  -- Owner role (all permissions)
  INSERT INTO roles (company_id, name, description, is_system)
  VALUES (company_id, 'Owner', 'Full system access', true)
  RETURNING id INTO owner_id;

  INSERT INTO role_permissions (role_id, permission_id)
  SELECT owner_id, id FROM permissions
  ON CONFLICT DO NOTHING;

  -- Admin role (all except admin.access)
  INSERT INTO roles (company_id, name, description, is_system)
  VALUES (company_id, 'Admin', 'Administrative access', true)
  RETURNING id INTO admin_id;

  INSERT INTO role_permissions (role_id, permission_id)
  SELECT admin_id, id FROM permissions WHERE code NOT IN ('admin.access')
  ON CONFLICT DO NOTHING;

  -- Manager role
  INSERT INTO roles (company_id, name, description, is_system)
  VALUES (company_id, 'Manager', 'Department management access', true)
  RETURNING id INTO manager_id;

  INSERT INTO role_permissions (role_id, permission_id)
  SELECT manager_id, id FROM permissions
  WHERE code IN (
    'employees.list', 'employees.read', 'employees.create', 'employees.update',
    'departments.list', 'departments.create', 'departments.update',
    'designations.list', 'designations.create', 'designations.update',
    'teams.list', 'teams.create', 'teams.update',
    'projects.list', 'projects.read', 'projects.create', 'projects.update',
    'projects.modules', 'projects.milestones', 'projects.archive',
    'tasks.list', 'tasks.read', 'tasks.create', 'tasks.update',
    'tasks.assign', 'tasks.checklist', 'tasks.labels',
    'work_logs.list', 'work_logs.create', 'work_logs.update', 'work_logs.approve',
    'timeline.view',
    'leads.list', 'leads.read', 'leads.create', 'leads.update',
    'customers.list', 'customers.read', 'customers.create', 'customers.update',
    'spreadsheets.list', 'spreadsheets.read', 'spreadsheets.create', 'spreadsheets.edit_data',
    'comments.read', 'comments.create',
    'tags.read', 'tags.manage',
    'reports.dashboard', 'reports.projects', 'reports.tasks',
    'activity.list',
    'notifications.read',
    'settings.read',
    'files.upload', 'files.read'
  )
  ON CONFLICT DO NOTHING;

  -- Employee role (self-service)
  INSERT INTO roles (company_id, name, description, is_system)
  VALUES (company_id, 'Employee', 'Basic self-service access', true)
  RETURNING id INTO employee_id;

  INSERT INTO role_permissions (role_id, permission_id)
  SELECT employee_id, id FROM permissions
  WHERE code IN (
    'tasks.list', 'tasks.read', 'tasks.create', 'tasks.update', 'tasks.comment',
    'tasks.watch',
    'work_logs.list', 'work_logs.create', 'work_logs.update',
    'timeline.view',
    'comments.read', 'comments.create',
    'tags.read',
    'reports.dashboard', 'reports.tasks',
    'activity.list',
    'notifications.read',
    'settings.read',
    'files.upload', 'files.read'
  )
  ON CONFLICT DO NOTHING;

  -- Accountant role
  INSERT INTO roles (company_id, name, description, is_system)
  VALUES (company_id, 'Accountant', 'Financial module access', true)
  RETURNING id INTO accountant_id;

  INSERT INTO role_permissions (role_id, permission_id)
  SELECT accountant_id, id FROM permissions
  WHERE code IN (
    'accounting.read', 'accounting.create', 'accounting.reports',
    'customers.list', 'customers.read',
    'invoices.list', 'invoices.read',
    'spreadsheets.list', 'spreadsheets.read',
    'comments.read', 'comments.create',
    'reports.dashboard', 'reports.financial',
    'notifications.read',
    'files.upload', 'files.read'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- 25. User-Role Assignments
INSERT INTO user_roles (user_id, role_id, company_id) 
SELECT p.id, r.id, '00000000-0000-0000-0000-000000000001'
FROM profiles p, roles r
WHERE r.company_id = '00000000-0000-0000-0000-000000000001'
  AND r.name = 'Owner'
  AND p.email = 'alex@nexlane.com'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id, company_id) 
SELECT p.id, r.id, '00000000-0000-0000-0000-000000000001'
FROM profiles p, roles r
WHERE r.company_id = '00000000-0000-0000-0000-000000000001'
  AND r.name = 'Admin'
  AND p.email IN ('sarah@nexlane.com', 'priya@nexlane.com')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id, company_id) 
SELECT p.id, r.id, '00000000-0000-0000-0000-000000000001'
FROM profiles p, roles r
WHERE r.company_id = '00000000-0000-0000-0000-000000000001'
  AND r.name = 'Manager'
  AND p.email IN ('mike@nexlane.com', 'emma@nexlane.com', 'lisa@nexlane.com')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id, company_id) 
SELECT p.id, r.id, '00000000-0000-0000-0000-000000000001'
FROM profiles p, roles r
WHERE r.company_id = '00000000-0000-0000-0000-000000000001'
  AND r.name = 'Employee'
  AND p.email IN ('james@nexlane.com', 'omar@nexlane.com', 'david@nexlane.com', 'anna@nexlane.com')
ON CONFLICT DO NOTHING;

-- 26. Default Chart of Accounts (preserved from original)
DO $$
DECLARE
  company_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO chart_of_accounts (company_id, code, name, type) VALUES
    (company_id, '1000', 'Cash & Bank', 'asset'),
    (company_id, '1100', 'Accounts Receivable', 'asset'),
    (company_id, '1200', 'Inventory', 'asset'),
    (company_id, '1300', 'Prepaid Expenses', 'asset'),
    (company_id, '1400', 'Fixed Assets', 'asset'),
    (company_id, '1500', 'Accumulated Depreciation', 'asset'),
    (company_id, '2000', 'Accounts Payable', 'liability'),
    (company_id, '2100', 'Accrued Expenses', 'liability'),
    (company_id, '2200', 'Unearned Revenue', 'liability'),
    (company_id, '2300', 'Taxes Payable', 'liability'),
    (company_id, '2400', 'Loans Payable', 'liability'),
    (company_id, '3000', 'Owner Equity', 'equity'),
    (company_id, '3100', 'Retained Earnings', 'equity'),
    (company_id, '3200', 'Dividends', 'equity'),
    (company_id, '4000', 'Service Revenue', 'income'),
    (company_id, '4100', 'Product Sales', 'income'),
    (company_id, '4200', 'Consulting Income', 'income'),
    (company_id, '4300', 'Interest Income', 'income'),
    (company_id, '5000', 'Salaries & Wages', 'expense'),
    (company_id, '5100', 'Rent & Utilities', 'expense'),
    (company_id, '5200', 'Office Supplies', 'expense'),
    (company_id, '5300', 'Travel & Transportation', 'expense'),
    (company_id, '5400', 'Marketing & Advertising', 'expense'),
    (company_id, '5500', 'Software & Subscriptions', 'expense'),
    (company_id, '5600', 'Professional Services', 'expense'),
    (company_id, '5700', 'Depreciation', 'expense'),
    (company_id, '5800', 'Taxes & Licenses', 'expense'),
    (company_id, '5900', 'Miscellaneous', 'expense')
  ON CONFLICT DO NOTHING;
END $$;

-- 27. Default Feature Flags (preserved from original)
INSERT INTO feature_flags (code, name, module, is_enabled) VALUES
  ('module.employees', 'Employee Management', 'employees', true),
  ('module.projects', 'Project Management', 'projects', true),
  ('module.tasks', 'Task Management', 'tasks', true),
  ('module.work_logs', 'Work Logs', 'work_logs', true),
  ('module.timeline', 'Activity Timeline', 'timeline', true),
  ('module.crm', 'CRM Module', 'crm', true),
  ('module.spreadsheets', 'Spreadsheet Engine', 'spreadsheets', true),
  ('module.accounting', 'Accounting Module', 'accounting', true),
  ('module.reports', 'Reporting & Analytics', 'reports', true),
  ('module.notifications', 'Notification System', 'notifications', true),
  ('module.files', 'File Management', 'files', true),
  ('module.search', 'Global Search', 'search', true),
  ('module.ai', 'AI Features', 'ai', false),
  ('beta.kanban', 'Kanban Board View', 'tasks', true),
  ('beta.api_access', 'Public API Access', 'admin', false)
ON CONFLICT (code) DO NOTHING;

-- 28. Default Notification Templates (preserved from original)
DO $$
DECLARE
  company_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO notification_templates (company_id, code, name, channels, subject, body, variables) VALUES
    (company_id, 'task.assigned', 'Task Assigned', '{"in_app": true, "email": true, "push": false}', 'New Task: {{title}}', 'You have been assigned to task "{{title}}" in project "{{project}}".', '["title", "project", "assignee"]'),
    (company_id, 'task.status_changed', 'Task Status Changed', '{"in_app": true, "email": false}', 'Task Updated: {{title}}', 'Task "{{title}}" status changed to {{status}}.', '["title", "status"]'),
    (company_id, 'lead.assigned', 'Lead Assigned', '{"in_app": true, "email": true}', 'New Lead: {{company}}', 'Lead "{{company}}" has been assigned to you.', '["company", "value"]'),
    (company_id, 'invoice.created', 'Invoice Created', '{"in_app": true, "email": true}', 'Invoice #{{number}} Created', 'Invoice #{{number}} for {{amount}} has been created.', '["number", "amount", "customer"]'),
    (company_id, 'invoice.paid', 'Invoice Paid', '{"in_app": true, "email": true}', 'Invoice #{{number}} Paid', 'Invoice #{{number}} has been paid in full.', '["number", "amount"]'),
    (company_id, 'lead.converted', 'Lead Converted', '{"in_app": true, "email": false}', 'Lead Converted: {{company}}', 'Lead "{{company}}" has been converted to a customer.', '["company"]')
   ON CONFLICT (company_id, code) DO NOTHING;
END $$;

-- 29. CRM Companies
DO $$
DECLARE
  company_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO crm_companies (company_id, name, industry, website, phone, email, notes, created_by) VALUES
    (company_id, 'Acme Corporation', 'Technology', 'https://acme.example.com', '+1-555-0201', 'info@acme.com', 'Major technology corporation looking for enterprise solutions.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'GlobalTech Solutions', 'Information Technology', 'https://globaltech.example.com', '+1-555-0202', 'sales@globaltech.com', 'IT services company interested in our platform.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'HealthFirst Medical', 'Healthcare', 'https://healthfirst.example.com', '+1-555-0203', 'contact@healthfirst.com', 'Healthcare provider evaluating our solution.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'GreenLeaf Enterprises', 'Retail', 'https://greenleaf.example.com', '+1-555-0204', 'info@greenleaf.com', 'Retail chain looking for inventory management.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'DataVault Systems', 'Cybersecurity', 'https://datavault.example.com', '+1-555-0205', 'partners@datavault.com', 'Cybersecurity firm interested in partnership.', 'f0000000-0000-0000-0000-000000000001')
  ON CONFLICT DO NOTHING;
END $$;

-- 30. Contacts
DO $$
DECLARE
  company_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
  acme_id UUID;
  globaltech_id UUID;
  healthfirst_id UUID;
  greenleaf_id UUID;
  datavault_id UUID;
BEGIN
  SELECT id INTO acme_id FROM crm_companies WHERE name = 'Acme Corporation';
  SELECT id INTO globaltech_id FROM crm_companies WHERE name = 'GlobalTech Solutions';
  SELECT id INTO healthfirst_id FROM crm_companies WHERE name = 'HealthFirst Medical';
  SELECT id INTO greenleaf_id FROM crm_companies WHERE name = 'GreenLeaf Enterprises';
  SELECT id INTO datavault_id FROM crm_companies WHERE name = 'DataVault Systems';

  INSERT INTO contacts (company_id, crm_company_id, name, designation, email, phone, whatsapp, is_primary, notes, created_by) VALUES
    (company_id, acme_id, 'John Smith', 'CTO', 'john@acme.com', '+1-555-0301', '+1-555-0301', true, 'Primary technical contact at Acme.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, acme_id, 'Sarah Connor', 'VP Engineering', 'sarah@acme.com', '+1-555-0302', NULL, false, 'Leads engineering team.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, globaltech_id, 'Mike Chen', 'CEO', 'mike@globaltech.com', '+1-555-0303', '+1-555-0303', true, 'CEO and founder.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, healthfirst_id, 'Emily Davis', 'IT Director', 'emily@healthfirst.com', '+1-555-0304', NULL, true, 'Decision maker for IT purchases.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, greenleaf_id, 'Robert Wilson', 'Operations Manager', 'robert@greenleaf.com', '+1-555-0305', '+1-555-0305', true, 'Primary operational contact.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, datavault_id, 'Lisa Park', 'Head of Security', 'lisa@datavault.com', '+1-555-0306', NULL, true, 'Security decision maker.', 'f0000000-0000-0000-0000-000000000001')
  ON CONFLICT DO NOTHING;
END $$;

-- 31. Leads
DO $$
DECLARE
  company_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
  emp_id UUID;
BEGIN
  SELECT id INTO emp_id FROM employees WHERE employee_code = 'EMP-005';
  INSERT INTO leads (company_id, title, name, email, phone, company, website, industry, source, status, priority, estimated_value, assigned_to, notes, created_by) VALUES
    (company_id, 'Enterprise Platform Deal', 'James Wilson', 'james.w@bigcorp.com', '+1-555-0401', 'BigCorp International', 'https://bigcorp.example.com', 'Finance', 'referral', 'new', 'high', 50000.00, emp_id, 'Hot lead from existing customer referral. Looking for full enterprise suite.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'SaaS Migration Project', 'Anna Martinez', 'anna@midcloud.com', '+1-555-0402', 'MidCloud Services', 'https://midcloud.example.com', 'Cloud Computing', 'website', 'contacted', 'medium', 25000.00, emp_id, 'Interested in migrating from legacy system. Demo scheduled.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'Startup Onboarding', 'David Park', 'david@startup.io', '+1-555-0403', 'Startup.io', 'https://startup.io', 'Technology', 'cold_outreach', 'qualified', 'medium', 10000.00, NULL, 'Fast-growing startup. Needs basic CRM and project management.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'Partnership Opportunity', 'Rachel Green', 'rachel@partner.net', '+1-555-0404', 'PartnerNet', 'https://partner.example.com', 'Consulting', 'partner', 'new', 'low', 0.00, NULL, 'Potential strategic partnership. Evaluating integration possibilities.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'Enterprise Security Suite', 'Tom Hardy', 'tom@securecorp.com', '+1-555-0405', 'SecureCorp', 'https://securecorp.example.com', 'Cybersecurity', 'event', 'contacted', 'high', 75000.00, emp_id, 'Met at Security Conference. Very interested in compliance features.', 'f0000000-0000-0000-0000-000000000001')
  ON CONFLICT DO NOTHING;
END $$;

-- 32. Deals
DO $$
DECLARE
  company_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
  lead1_id UUID;
  lead2_id UUID;
  lead3_id UUID;
  emp_id UUID;
  acme_id UUID;
  globaltech_id UUID;
  healthfirst_id UUID;
BEGIN
  SELECT id INTO emp_id FROM employees WHERE employee_code = 'EMP-005';
  SELECT id INTO acme_id FROM crm_companies WHERE name = 'Acme Corporation';
  SELECT id INTO globaltech_id FROM crm_companies WHERE name = 'GlobalTech Solutions';
  SELECT id INTO healthfirst_id FROM crm_companies WHERE name = 'HealthFirst Medical';
  SELECT id INTO lead1_id FROM leads ORDER BY created_at ASC LIMIT 1 OFFSET 0;
  SELECT id INTO lead2_id FROM leads ORDER BY created_at ASC LIMIT 1 OFFSET 1;
  SELECT id INTO lead3_id FROM leads ORDER BY created_at ASC LIMIT 1 OFFSET 2;

  INSERT INTO deals (company_id, lead_id, crm_company_id, name, value, probability, stage, expected_close_date, owner_id, notes, created_by) VALUES
    (company_id, lead1_id, NULL, 'BigCorp Enterprise Suite', 50000.00, 20, 'new', '2026-09-30', emp_id, 'Initial discussions phase.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, lead2_id, NULL, 'MidCloud Migration', 25000.00, 40, 'demo_scheduled', '2026-08-15', emp_id, 'Demo scheduled for next week.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, NULL, acme_id, 'Acme Platform Renewal', 35000.00, 80, 'negotiation', '2026-07-30', emp_id, 'Negotiating terms for annual renewal.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, NULL, globaltech_id, 'GlobalTech Implementation', 45000.00, 60, 'proposal_sent', '2026-08-15', emp_id, 'Proposal sent awaiting feedback.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, NULL, healthfirst_id, 'HealthFirst Pilot Program', 15000.00, 30, 'contacted', '2026-09-01', emp_id, 'Initial contact made, interested in pilot.', 'f0000000-0000-0000-0000-000000000001')
  ON CONFLICT DO NOTHING;
END $$;

-- 33. Activities
DO $$
DECLARE
  company_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
  deal1_id UUID;
  deal2_id UUID;
  emp_id UUID;
BEGIN
  SELECT id INTO emp_id FROM employees WHERE employee_code = 'EMP-005';
  SELECT id INTO deal1_id FROM deals ORDER BY created_at ASC LIMIT 1 OFFSET 0;
  SELECT id INTO deal2_id FROM deals ORDER BY created_at ASC LIMIT 1 OFFSET 1;

  INSERT INTO activities (company_id, entity_type, entity_id, type, subject, description, scheduled_at, assigned_to, created_by) VALUES
    (company_id, 'deal', deal1_id, 'call', 'Initial Discovery Call', 'Discussed requirements and timeline.', NOW() - INTERVAL '3 days', emp_id, 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'deal', deal2_id, 'email', 'Sent Proposal Document', 'Sent detailed proposal with pricing.', NOW() - INTERVAL '1 day', emp_id, 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'deal', deal1_id, 'meeting', 'Technical Deep Dive', 'Walked through technical architecture.', NOW() + INTERVAL '5 days', emp_id, 'f0000000-0000-0000-0000-000000000001'),
    (company_id, 'deal', deal2_id, 'follow_up', 'Follow up on Demo', 'Check in after demo presentation.', NOW() + INTERVAL '2 days', emp_id, 'f0000000-0000-0000-0000-000000000001')
  ON CONFLICT DO NOTHING;
END $$;

-- 34. Lead Notes (for first lead)
DO $$
DECLARE
  company_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
  lead1_id UUID;
BEGIN
  SELECT id INTO lead1_id FROM leads ORDER BY created_at ASC LIMIT 1;
  INSERT INTO lead_notes (company_id, lead_id, content, created_by) VALUES
    (company_id, lead1_id, 'Initial call went well. They are actively looking for a solution.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, lead1_id, 'Sent over pricing information. Waiting for response.', 'f0000000-0000-0000-0000-000000000001'),
    (company_id, lead1_id, 'Followed up — they are reviewing with their team.', 'f0000000-0000-0000-0000-000000000001')
  ON CONFLICT DO NOTHING;
END $$;
