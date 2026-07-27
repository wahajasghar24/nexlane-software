# Phase 1 Permissions Added

## New Permission Codes (25)

All registered in migration `038_add_permissions.sql`.

### Departments (4)
| Code | Name | Module |
|------|------|--------|
| `departments.list` | List Departments | departments |
| `departments.create` | Create Departments | departments |
| `departments.update` | Update Departments | departments |
| `departments.delete` | Delete Departments | departments |

### Designations (4)
| Code | Name | Module |
|------|------|--------|
| `designations.list` | List Designations | designations |
| `designations.create` | Create Designations | designations |
| `designations.update` | Update Designations | designations |
| `designations.delete` | Delete Designations | designations |

### Teams (4)
| Code | Name | Module |
|------|------|--------|
| `teams.list` | List Teams | teams |
| `teams.create` | Create Teams | teams |
| `teams.update` | Update Teams | teams |
| `teams.delete` | Delete Teams | teams |

### Tasks (Extended, 4)
| Code | Name | Module |
|------|------|--------|
| `tasks.assign` | Assign Tasks | tasks |
| `tasks.watch` | Watch Tasks | tasks |
| `tasks.checklist` | Manage Task Checklists | tasks |
| `tasks.labels` | Manage Task Labels | tasks |

### Work Logs (4)
| Code | Name | Module |
|------|------|--------|
| `work_logs.list` | List Work Logs | work_logs |
| `work_logs.create` | Create Work Log | work_logs |
| `work_logs.update` | Update Work Log | work_logs |
| `work_logs.approve` | Approve Work Logs | work_logs |

### Timeline (2)
| Code | Name | Module |
|------|------|--------|
| `timeline.view` | View Activity Timeline | timeline |
| `timeline.export` | Export Timeline | timeline |

### Projects (Extended, 3)
| Code | Name | Module |
|------|------|--------|
| `projects.modules` | Manage Project Modules | projects |
| `projects.milestones` | Manage Milestones | projects |
| `projects.archive` | Archive Projects | projects |

## TypeScript Constants

Defined in `src/core/auth/permissions.ts`:

```typescript
export const Permissions = {
  // ... existing permissions ...
  DEPARTMENTS_LIST: 'departments.list',
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_DELETE: 'departments.delete',
  DESIGNATIONS_LIST: 'designations.list',
  DESIGNATIONS_CREATE: 'designations.create',
  DESIGNATIONS_UPDATE: 'designations.update',
  DESIGNATIONS_DELETE: 'designations.delete',
  TEAMS_LIST: 'teams.list',
  TEAMS_CREATE: 'teams.create',
  TEAMS_UPDATE: 'teams.update',
  TEAMS_DELETE: 'teams.delete',
  TASKS_ASSIGN: 'tasks.assign',
  TASKS_WATCH: 'tasks.watch',
  TASKS_CHECKLIST: 'tasks.checklist',
  TASKS_LABELS: 'tasks.labels',
  WORK_LOGS_LIST: 'work_logs.list',
  WORK_LOGS_CREATE: 'work_logs.create',
  WORK_LOGS_UPDATE: 'work_logs.update',
  WORK_LOGS_APPROVE: 'work_logs.approve',
  TIMELINE_VIEW: 'timeline.view',
  TIMELINE_EXPORT: 'timeline.export',
  PROJECTS_MODULES: 'projects.modules',
  PROJECTS_MILESTONES: 'projects.milestones',
  PROJECTS_ARCHIVE: 'projects.archive',
} as const
```

## Role-Permission Assignments (Seed Data)

| Role | Has Phase 1 Permissions? |
|------|--------------------------|
| Owner | All (full system access) |
| Admin | All except `admin.access` |
| Manager | Departments(3), Designations(3), Teams(3), Projects extended, Tasks extended, Work Logs(all), Timeline |
| Employee | Tasks(watch), Work Logs(list/create/update), Timeline(view) |
| Accountant | None (financial role only) |
