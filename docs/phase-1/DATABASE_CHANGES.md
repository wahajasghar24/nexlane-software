# Phase 1 Database Changes

## Migrations

| Migration | Purpose |
|-----------|---------|
| `034_employee_extensions.sql` | Departments, designations, teams, skills, notes + employee ALTER TABLE |
| `035_project_extensions.sql` | Project modules, milestones + project ALTER TABLE |
| `036_task_extensions.sql` | Multi-assignee, labels (catalog + bridge), checklists, watchers, dependencies + task ALTER TABLE |
| `037_work_logs.sql` | Work logs table |
| `038_add_permissions.sql` | 25 new Phase 1 permission codes |
| `039_fix_phase1_tables.sql` | Fix: add missing columns + task_attachments table |

## New Tables (16)

### departments
`id`, `company_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`

### designations
`id`, `company_id`, `name`, `description`, `created_at`

### teams
`id`, `company_id`, `name`, `description`, `lead_id`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`

### team_members
`id`, `team_id`, `employee_id`, `role`, `created_at`
UNIQUE(team_id, employee_id)

### employee_skills
`id`, `employee_id`, `company_id`*, `skill`, `proficiency`, `created_by`*, `updated_by`*, `created_at`
*Added by migration 039

### employee_notes
`id`, `employee_id`, `content`, `created_by`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`

### project_modules
`id`, `company_id`, `project_id`, `name`, `description`, `status` (planned/in_progress/completed/cancelled), `start_date`, `end_date`, `sort_order`, `created_by`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`

### milestones
`id`, `company_id`, `project_id`, `name`, `description`, `due_date`, `status` (pending/in_progress/completed/cancelled), `created_by`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`

### task_assignees
`id`, `task_id`, `employee_id`, `company_id`*, `assigned_by`*, `created_at`
*Added by migration 039

### task_labels
`id`, `company_id`, `name`, `color`, `created_at`
UNIQUE(company_id, name)

### task_label_mappings
`id`, `task_id`, `label_id`, `created_at`
UNIQUE(task_id, label_id)

### task_checklist_items
`id`, `task_id`, `content`, `is_completed`, `completed_at`, `completed_by`, `sort_order`, `company_id`*, `created_by`*, `updated_by`*, `created_at`
*Added by migration 039

### task_watchers
`id`, `task_id`, `employee_id`, `company_id`*, `created_at`
*Added by migration 039

### task_dependencies
`id`, `task_id`, `depends_on_task_id`, `dependency_type` (blocks/depends_on/related), `company_id`*, `created_by`*, `created_at`
*Added by migration 039

### work_logs
`id`, `company_id`, `employee_id`, `task_id`, `log_date`, `start_time`, `end_time`, `hours`, `description`, `progress_percentage`, `blockers`, `next_step`, `status` (draft/submitted/approved/rejected), `manager_notes`, `approved_by`, `approved_at`, `created_by`*, `updated_by`*, `created_at`, `updated_at`, `deleted_at`, `deleted_by`
*Added by migration 039

### task_attachments
`id`, `task_id`, `company_id`, `file_name`, `file_size`, `file_type`, `file_url`, `uploaded_by`, `created_at`

## Modified Existing Tables

### employees
| Column | Type | Default | Source |
|--------|------|---------|--------|
| `department_id` | UUID → departments | NULL | 034 |
| `designation_id` | UUID → designations | NULL | 034 |
| `employment_status` | TEXT | 'active' | 034 |
| `bio` | TEXT | NULL | 034 |
| `emergency_contact` | JSONB | NULL | 034 |
| `total_hours` | DECIMAL(10,2) | 0 | 037 |

### projects
| Column | Type | Default | Source |
|--------|------|---------|--------|
| `color` | TEXT | '#6366f1' | 035 |
| `is_archived` | BOOLEAN | false | 035 |
| `client_name` | TEXT | NULL | 035 |
| `progress_percentage` | INTEGER | 0 | 035 |

### tasks
| Column | Type | Default | Source |
|--------|------|---------|--------|
| `module_id` | UUID → project_modules | NULL | 036 |
| `is_archived` | BOOLEAN | false | 036 |
| Status constraint | TEXT | 'todo' | 036 (expanded to 7 values) |

## ERD Key Relationships

```
departments 1─N employees
designations 1─N employees
teams 1─N team_members N─1 employees
employees 1─N employee_skills
employees 1─N employee_notes
employees 1─N project_members N─1 projects
employees 1─N task_assignees N─1 tasks
employees 1─N task_watchers N─1 tasks
employees 1─N work_logs
projects 1─N project_modules
projects 1─N milestones
projects 1─N tasks
project_modules 1─N tasks
task_labels N─M task_label_mappings M─N tasks
tasks 1─N task_checklist_items
tasks 1─N task_attachments
tasks N─M task_dependencies (self-referencing)
```
