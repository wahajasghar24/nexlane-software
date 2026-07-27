# Phase 1 API Changes

## New API Endpoints

### Employees
| Method | Path | Handler | Auth | Permission |
|--------|------|---------|------|------------|
| GET | `/api/employees` | employeeService.list | ✓ | EMPLOYEES_LIST |
| POST | `/api/employees` | employeeService.create | ✓ | EMPLOYEES_CREATE |
| GET | `/api/employees/[id]` | employeeService.getById | ✓ | EMPLOYEES_READ |
| PATCH | `/api/employees/[id]` | employeeService.update | ✓ | EMPLOYEES_UPDATE |
| DELETE | `/api/employees/[id]` | employeeService.softDelete | ✓ | EMPLOYEES_DELETE |
| GET | `/api/employees/[id]/profile` | employeeService.getProfile | ✓ | EMPLOYEES_READ |
| GET | `/api/employees/[id]/skills` | skillService.listByEmployee | ✓ | (authenticated) |
| POST | `/api/employees/[id]/skills` | skillService.add | ✓ | (authenticated) |
| DELETE | `/api/employees/[id]/skills/[skillId]` | skillService.remove | ✓ | (authenticated) |

### Departments
| Method | Path | Handler | Auth | Permission |
|--------|------|---------|------|------------|
| GET | `/api/departments` | departmentService.list | ✓ | DEPARTMENTS_LIST |
| POST | `/api/departments` | departmentService.create | ✓ | DEPARTMENTS_CREATE |
| GET | `/api/departments/[id]` | departmentService.getById | ✓ | (authenticated) |
| PATCH | `/api/departments/[id]` | departmentService.update | ✓ | DEPARTMENTS_UPDATE |
| DELETE | `/api/departments/[id]` | departmentService.softDelete | ✓ | DEPARTMENTS_DELETE |

### Designations
| Method | Path | Handler | Auth | Permission |
|--------|------|---------|------|------------|
| GET | `/api/designations` | designationService.list | ✓ | DESIGNATIONS_LIST |
| POST | `/api/designations` | designationService.create | ✓ | DESIGNATIONS_CREATE |
| GET | `/api/designations/[id]` | designationService.getById | ✓ | (authenticated) |
| PATCH | `/api/designations/[id]` | designationService.update | ✓ | DESIGNATIONS_UPDATE |
| DELETE | `/api/designations/[id]` | designationService.softDelete | ✓ | DESIGNATIONS_DELETE |

### Teams
| Method | Path | Handler | Auth | Permission |
|--------|------|---------|------|------------|
| GET | `/api/teams` | teamService.list | ✓ | TEAMS_LIST |
| POST | `/api/teams` | teamService.create | ✓ | TEAMS_CREATE |
| GET | `/api/teams/[id]` | teamService.getById | ✓ | (authenticated) |
| PATCH | `/api/teams/[id]` | teamService.update | ✓ | TEAMS_UPDATE |
| DELETE | `/api/teams/[id]` | teamService.softDelete | ✓ | TEAMS_DELETE |
| POST | `/api/teams/[id]/members` | teamService.addMember | ✓ | (authenticated) |
| DELETE | `/api/teams/[id]/members/[memberId]` | teamService.removeMember | ✓ | (authenticated) |

### Projects
| Method | Path | Handler | Auth | Permission |
|--------|------|---------|------|------------|
| GET | `/api/projects` | projectService.list | ✓ | PROJECTS_LIST |
| POST | `/api/projects` | projectService.create | ✓ | PROJECTS_CREATE |
| GET | `/api/projects/[id]` | projectService.getById | ✓ | PROJECTS_READ |
| PATCH | `/api/projects/[id]` | projectService.update | ✓ | PROJECTS_UPDATE |
| DELETE | `/api/projects/[id]` | projectService.softDelete | ✓ | PROJECTS_DELETE |
| POST | `/api/projects/[id]/archive` | projectService.archive | ✓ | PROJECTS_ARCHIVE |
| POST | `/api/projects/[id]/members` | projectService.addMember | ✓ | PROJECTS_MANAGE_MEMBERS |
| DELETE | `/api/projects/[id]/members/[memberId]` | projectService.removeMember | ✓ | PROJECTS_MANAGE_MEMBERS |
| GET | `/api/projects/[id]/modules` | moduleService.list | ✓ | PROJECTS_MODULES |
| POST | `/api/projects/[id]/modules` | moduleService.create | ✓ | PROJECTS_MODULES |
| PATCH | `/api/projects/[id]/modules/[moduleId]` | moduleService.update | ✓ | PROJECTS_MODULES |
| DELETE | `/api/projects/[id]/modules/[moduleId]` | moduleService.remove | ✓ | PROJECTS_MODULES |
| GET | `/api/projects/[id]/milestones` | milestoneService.list | ✓ | PROJECTS_MILESTONES |
| POST | `/api/projects/[id]/milestones` | milestoneService.create | ✓ | PROJECTS_MILESTONES |
| PATCH | `/api/projects/[id]/milestones/[milestoneId]` | milestoneService.update | ✓ | PROJECTS_MILESTONES |
| DELETE | `/api/projects/[id]/milestones/[milestoneId]` | milestoneService.remove | ✓ | PROJECTS_MILESTONES |

### Tasks
| Method | Path | Handler | Auth | Permission |
|--------|------|---------|------|------------|
| GET | `/api/tasks` | taskService.list | ✓ | TASKS_LIST |
| POST | `/api/tasks` | taskService.create | ✓ | TASKS_CREATE |
| GET | `/api/tasks/[id]` | taskService.getById | ✓ | TASKS_READ |
| PATCH | `/api/tasks/[id]` | taskService.update | ✓ | TASKS_UPDATE |
| DELETE | `/api/tasks/[id]` | taskService.softDelete | ✓ | TASKS_DELETE |
| POST | `/api/tasks/[id]/assignees` | taskService.addAssignee | ✓ | TASKS_ASSIGN |
| DELETE | `/api/tasks/[id]/assignees/[assigneeId]` | taskService.removeAssignee | ✓ | TASKS_ASSIGN |
| GET | `/api/tasks/[id]/checklist` | taskService.listChecklist | ✓ | TASKS_CHECKLIST |
| POST | `/api/tasks/[id]/checklist` | taskService.addChecklistItem | ✓ | TASKS_CHECKLIST |
| PATCH | `/api/tasks/[id]/checklist/[itemId]` | taskService.toggleChecklistItem | ✓ | TASKS_CHECKLIST |
| POST | `/api/tasks/[id]/watchers` | taskService.addWatcher | ✓ | TASKS_WATCH |
| GET | `/api/tasks/[id]/dependencies` | taskService.listDependencies | ✓ | TASKS_UPDATE |
| POST | `/api/tasks/[id]/dependencies` | taskService.addDependency | ✓ | TASKS_UPDATE |
| DELETE | `/api/tasks/[id]/dependencies/[depId]` | taskService.removeDependency | ✓ | TASKS_UPDATE |
| GET | `/api/tasks/labels` | taskService.listLabels | ✓ | TASKS_LABELS |
| POST | `/api/tasks/labels` | taskService.createLabel | ✓ | TASKS_LABELS |
| PATCH | `/api/tasks/labels/[id]` | taskService.updateLabel | ✓ | TASKS_LABELS |
| DELETE | `/api/tasks/labels/[id]` | taskService.deleteLabel | ✓ | TASKS_LABELS |

### Work Logs
| Method | Path | Handler | Auth | Permission |
|--------|------|---------|------|------------|
| GET | `/api/work-logs` | workLogService.list | ✓ | WORK_LOGS_LIST |
| POST | `/api/work-logs` | workLogService.create | ✓ | WORK_LOGS_CREATE |
| PATCH | `/api/work-logs/[id]` | workLogService.update | ✓ | WORK_LOGS_UPDATE |
| DELETE | `/api/work-logs/[id]` | workLogService.softDelete | ✓ | WORK_LOGS_UPDATE |
| POST | `/api/work-logs/[id]/approve` | workLogService.approve | ✓ | WORK_LOGS_APPROVE |
| GET | `/api/work-logs/summary` | workLogService.getSummary | ✓ | WORK_LOGS_LIST |

### Timeline
| Method | Path | Handler | Auth | Permission |
|--------|------|---------|------|------------|
| GET | `/api/timeline` | (direct query) | ✓ | TIMELINE_VIEW |

### Dashboard
| Method | Path | Handler | Auth | Permission |
|--------|------|---------|------|------------|
| GET | `/api/dashboard/stats` | (direct query) | ✓ | REPORTS_DASHBOARD |
