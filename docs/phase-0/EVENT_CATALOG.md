# Event Catalog

**Project:** Nexlane
**Total Event Types Defined:** 37
**Currently Emitted:** 11
**Last Updated:** Phase 0

---

## Legend

| Column | Description |
|--------|-------------|
| **Event** | Event type literal (matches `EventTypes` constant) |
| **Defined** | Whether the event is defined in `src/core/events/types.ts` |
| **Emitted** | Whether `eventBus.emit()` is called for this event in Phase 0 |
| **Trigger** | What code path produces this event |
| **Payload** | Data included in the event payload |
| **Consumers** | Handlers registered for this event |
| **Future n8n** | Recommended webhook integration |

---

## Authentication Events

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `user.login` | ✓ Yes | ✓ Yes | `authService.login()` | `{ actorId, email }` | activityHandler | Login alerts |
| `user.logout` | ✓ Yes | ✓ Yes | `authService.logout()` | `{ actorId }` | activityHandler | Session tracking |
| `user.created` | ✓ Yes | ✗ No | — | — | activityHandler | Welcome automation |

---

## Employee Events

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `employee.created` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | HR onboarding |
| `employee.updated` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Profile changes |
| `employee.deleted` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Offboarding |

---

## Project Events

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `project.created` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Project notifications |
| `project.updated` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Change tracking |
| `project.deleted` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Cleanup |

---

## Task Events

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `task.created` | ✓ Yes | ✓ Yes | n8n webhook `POST /api/webhooks/n8n/tasks` | `{ ...task, source: 'n8n' }` | activityHandler, webhookHandler | Task sync |
| `task.updated` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Change tracking |
| `task.deleted` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Cleanup |
| `task.assigned` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler, notificationHandler | Assignment alerts |
| `task.status_changed` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler, notificationHandler | Status updates |

---

## Lead Events (CRM)

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `lead.created` | ✓ Yes | ✓ Yes | n8n webhook `POST /api/webhooks/n8n/leads` | `{ ...lead, source: 'n8n' }` | activityHandler, webhookHandler | Lead sync |
| `lead.updated` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Change tracking |
| `lead.deleted` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Cleanup |
| `lead.assigned` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler, notificationHandler | Assignment alerts |
| `lead.converted` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler, notificationHandler | Customer creation |

---

## Customer Events (CRM)

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `customer.created` | ✓ Yes | ✓ Yes | n8n webhook `POST /api/webhooks/n8n/customers` | `{ ...customer, source: 'n8n' }` | activityHandler, webhookHandler | Customer sync |
| `customer.updated` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Change tracking |
| `customer.deleted` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Cleanup |

---

## Invoice Events (Accounting)

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `invoice.created` | ✓ Yes | ✓ Yes | n8n webhook `POST /api/webhooks/n8n/invoices` | `{ ...invoice, items, source: 'n8n' }` | activityHandler, notificationHandler, webhookHandler | Invoice sync |
| `invoice.sent` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Delivery tracking |
| `invoice.paid` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler, notificationHandler | Payment processing |
| `invoice.overdue` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Dunning automation |

---

## Payment & Expense Events

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `payment.received` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler, webhookHandler | Payment confirmation |
| `expense.created` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Expense tracking |

---

## File Events

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `file.uploaded` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Document processing |
| `file.deleted` | ✓ Yes | ✗ No | Phase 1+ | — | activityHandler | Cleanup |

---

## RBAC Events

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `role.created` | ✓ Yes | ✓ Yes | `rbacService.createRole()` | `{ role, actorId }` | activityHandler | Audit logging |
| `role.updated` | ✓ Yes | ✓ Yes | `rbacService.updateRole()` | `{ role, actorId }` | activityHandler | Audit logging |
| `role.deleted` | ✓ Yes | ✓ Yes | `rbacService.deleteRole()` | `{ actorId }` | activityHandler | Audit logging |
| `permission.changed` | ✓ Yes | ✓ Yes | `rbacService.assignPermissions()` | `{ permissionIds, actorId }` | activityHandler | Audit logging |
| `user_role.assigned` | ✓ Yes | ✓ Yes | `rbacService.assignUserRole()` | `{ userId, roleId, assignedBy }` | activityHandler | Audit logging |

---

## System Events

| Event | Defined | Emitted | Trigger | Payload | Consumers | Future n8n |
|-------|---------|---------|---------|---------|-----------|------------|
| `job.failed` | ✓ Yes | ✗ No | Phase 1+ | — | (none registered) | Alerting |
| `event.replayed` | ✓ Yes | ✗ No | Phase 1+ | — | (none registered) | Audit logging |

---

## Consumer Details

### Activity Handler (`src/core/events/handlers/activity-handler.ts`)
- **Consumes:** All 37 event types (subscribed via loop)
- **Action:** Inserts row into `activity_logs` table with actor, entity, action, and data diff
- **Requires:** `payload.actorId` or `payload.createdBy`
- **Error handling:** Silently skips if actor ID not found

### Notification Handler (`src/core/events/handlers/notification-handler.ts`)
- **Consumes:** `task.assigned`, `task.status_changed`, `lead.assigned`, `invoice.created`, `invoice.paid`, `lead.converted`
- **Action:** Creates notification record for the assigned user with templated title and deep link
- **Targets:** `payload.assignedTo` or `payload.userId`
- **Notification types:** `task_assigned`, `task_updated`, `lead_assigned`, `invoice_created`, `invoice_paid`, `lead_converted`

### Webhook Handler (`src/core/events/handlers/webhook-handler.ts`)
- **Consumes:** `lead.created`, `task.created`, `customer.created`, `invoice.created`, `payment.received`
- **Action:** Forwards event payload to company's n8n webhook URL via HTTP POST
- **Configuration:** Reads `n8n_webhook_url` from `company_settings`
- **Error handling:** Silent failure on network errors

---

## Event Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│                    EVENT EMISSION                            │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Auth Service ──→ user.login/user.logout                    │
│                        │                                    │
│  RBAC Service ──→ role.created/updated/deleted              │
│                   permission.changed                        │
│                   user_role.assigned                        │
│                        │                                    │
│  n8n Webhooks ──→ task.created                             │
│                   lead.created                              │
│                   customer.created                          │
│                   invoice.created                           │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────┐                           │
│  │     eventBus.emit()          │                           │
│  │─────────────────────────────│                           │
│  │  1. Persist to domain_events │                           │
│  │  2. Update status→pending   │                           │
│  │  3. Run handlers in parallel │                           │
│  │  4. Update status→processed │                           │
│  │     or →failed              │                           │
│  └─────────────┬───────────────┘                           │
│                │                                            │
│                ▼                                            │
│  ┌─────────────────────────────┐                           │
│  │     EVENT HANDLERS           │                           │
│  │─────────────────────────────│                           │
│  │                             │                            │
│  │  activityHandler ──→ activity_logs table                │
│  │      (ALL events)                                        │
│  │                             │                            │
│  │  notificationHandler ──→ notifications table             │
│  │      (6 task/lead/invoice events)                       │
│  │                             │                            │
│  │  webhookHandler ──→ n8n webhook URL                     │
│  │      (5 events)                                         │
│  └─────────────────────────────┘                           │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Events vs Emission Status

| Status | Count | Events |
|--------|-------|--------|
| Emitted (Phase 0) | 11 | user.login, user.logout, task.created, lead.created, customer.created, invoice.created, role.created, role.updated, role.deleted, permission.changed, user_role.assigned |
| Defined, Not Yet Emitted | 26 | user.created, employee.* (3), project.* (3), task.updated, task.deleted, task.assigned, task.status_changed, lead.* (4), customer.* (2), invoice.* (3), payment.received, expense.created, file.* (2), job.failed, event.replayed |
| **Total Defined** | **37** | |
