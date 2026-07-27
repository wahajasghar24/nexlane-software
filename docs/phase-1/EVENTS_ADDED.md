# Phase 1 Events Added

## Event Catalog

All events are defined in `src/core/events/types.ts` as `EventTypes` constants and emitted via `eventBus.emit()`.

### Employee-Related (3)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `employee.created` | Employee record created | `{ employee, actorId }` |
| `employee.updated` | Employee record updated | `{ employee, actorId }` |
| `employee.deleted` | Employee soft-deleted | `{ actorId }` |

### Department-Related (3)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `department.created` | Department created | — |
| `department.updated` | Department updated | — |
| `department.deleted` | Department deleted | — |

### Designation-Related (3)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `designation.created` | Designation created | — |
| `designation.updated` | Designation updated | — |
| `designation.deleted` | Designation deleted | — |

### Team-Related (5)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `team.created` | Team created | — |
| `team.updated` | Team updated | — |
| `team.deleted` | Team deleted | — |
| `team.member_added` | Team member added | — |
| `team.member_removed` | Team member removed | — |

### Project-Related (7)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `project.created` | Project created | `{ project, actorId }` |
| `project.updated` | Project updated | `{ project, actorId }` |
| `project.deleted` | Project soft-deleted | `{ actorId }` |
| `project.archived` | Project archived | — |
| `project.unarchived` | Project unarchived | — |
| `project.member_added` | Project member added | — |
| `project.member_removed` | Project member removed | — |

### Module-Related (3)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `module.created` | Module created | — |
| `module.updated` | Module updated | — |
| `module.deleted` | Module deleted | — |

### Milestone-Related (4)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `milestone.created` | Milestone created | — |
| `milestone.updated` | Milestone updated | — |
| `milestone.deleted` | Milestone deleted | — |
| `milestone.completed` | Milestone marked completed | — |

### Task-Related (13)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `task.created` | Task created | `{ task, actorId }` |
| `task.updated` | Task updated | `{ task, actorId }` |
| `task.deleted` | Task soft-deleted | `{ actorId }` |
| `task.assigned` | User assigned to task | `{ taskId, employeeId, actorId }` |
| `task.unassigned` | User unassigned from task | — |
| `task.status_changed` | Task status changed | `{ from, to, actorId }` |
| `task.started` | Task moved to in_progress | — |
| `task.completed` | Task moved to completed | — |
| `task.blocked` | Task moved to blocked | — |
| `task.checklist_item_added` | Checklist item added | — |
| `task.checklist_item_toggled` | Checklist item toggled | — |
| `task.watcher_added` | Watcher added to task | — |
| `task.dependency_added` | Dependency added | — |
| `task.dependency_removed` | Dependency removed | — |

### Work Log-Related (5)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `work_log.created` | Work log created | — |
| `work_log.updated` | Work log updated | — |
| `work_log.submitted` | Work log submitted for approval | — |
| `work_log.approved` | Work log approved | — |
| `work_log.rejected` | Work log rejected | — |

### Comment-Related (3)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `comment.created` | Comment created | — |
| `comment.updated` | Comment updated | — |
| `comment.deleted` | Comment deleted | — |

### Tag-Related (3)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `tag.created` | Tag created | — |
| `tag.updated` | Tag updated | — |
| `tag.deleted` | Tag deleted | — |

### Skill-Related (3)
| Event | When Emitted | Payload |
|-------|-------------|---------|
| `skill.added` | Skill added to employee | `{ skill, actorId }` |
| `skill.updated` | Skill proficiency updated | `{ skill, actorId }` |
| `skill.removed` | Skill removed | `{ actorId }` |

## Event Handler Registration

All events → `activityHandler` (logs to activity_logs table)
Notification-worthy events → `notificationHandler`
Webhook-worthy events → `webhookHandler`

### Notification Events
`task.assigned`, `task.status_changed`, `task.completed`, `task.blocked`, `work_log.submitted`, `work_log.approved`, `work_log.rejected`, `comment.created`, `lead.assigned`, `invoice.created`, `invoice.paid`, `lead.converted`

### Webhook Events
`employee.created`, `project.created`, `task.created`, `task.completed`, `task.status_changed`, `work_log.submitted`, `lead.created`, `lead.converted`, `customer.created`, `invoice.created`, `invoice.paid`, `payment.received`

## Total Events: 52 (Phase 1 added ~40 new events)
