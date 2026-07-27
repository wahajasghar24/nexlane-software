# Nexlane — API Documentation

## 1. Overview

Nexlane uses **Next.js Route Handlers** (App Router). All endpoints follow RESTful conventions under `/api/`.

**Base URL:** `https://nexlane.com/api` (production) | `http://localhost:3000/api` (development)

### Multi-Tenant Context
- Every request resolves the company from the user's session.
- All data is scoped by `company_id` automatically.
- Super-admins can impersonate via `X-Company-ID` header + service role key.

## 2. Authentication

Cookie-based session via Supabase SSR. External access uses `Authorization: Bearer <webhook_secret>`.

## 3. Common Response Format

```json
{ "data": { ... }, "error": null, "meta": { "page": 1, "pageSize": 20, "total": 150, "totalPages": 8 } }
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

## 4. Endpoints by Module

### 4.1 Authentication
| Method | Path | Auth |
|--------|------|------|
| POST | /api/auth/signup | No |
| POST | /api/auth/login | No |
| POST | /api/auth/logout | Yes |
| POST | /api/auth/forgot-password | No |
| POST | /api/auth/reset-password | No |
| GET | /api/auth/session | Yes |
| GET | /api/auth/me | Yes |
| POST | /api/auth/switch-company | Yes |

### 4.2 RBAC
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/rbac/permissions | rbac.manage |
| GET | /api/rbac/roles | rbac.manage |
| POST | /api/rbac/roles | rbac.manage |
| PATCH | /api/rbac/roles/:id | rbac.manage |
| DELETE | /api/rbac/roles/:id | rbac.manage |
| GET | /api/rbac/roles/:id | rbac.manage |
| POST | /api/rbac/roles/:id/permissions | rbac.manage |
| DELETE | /api/rbac/roles/:id/permissions/:permId | rbac.manage |
| GET | /api/rbac/users/:id/roles | rbac.manage |
| POST | /api/rbac/users/:id/roles | rbac.manage |

### 4.3 Feature Flags
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/feature-flags | settings.manage |
| PATCH | /api/feature-flags/company/:flagId | settings.manage |
| GET | /api/feature-flags/company | settings.read |

### 4.4 Settings (3-Tier)
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/settings/system | admin |
| PATCH | /api/settings/system | admin |
| GET | /api/settings/company | settings.read |
| PATCH | /api/settings/company | settings.manage |
| GET | /api/settings/user | auth (own) |
| PATCH | /api/settings/user | auth (own) |

### 4.5 Employees | Projects | Tasks | CRM | Spreadsheets
*(Same as previous version, all permissions now use dynamic RBAC codes)*

### 4.6 Comments (Universal)
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/comments?type=:entityType&id=:entityId | comments.read |
| POST | /api/comments | comments.create |
| PATCH | /api/comments/:id | comments.update |
| DELETE | /api/comments/:id | comments.delete |

### 4.7 Tags
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/tags | tags.read |
| POST | /api/tags | tags.manage |
| DELETE | /api/tags/:id | tags.manage |
| POST | /api/tags/:id/attach | tags.manage |
| DELETE | /api/tags/:id/detach/:entityType/:entityId | tags.manage |

### 4.8 Custom Fields
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/custom-fields?entityType=:type | settings.manage |
| POST | /api/custom-fields | settings.manage |
| PATCH | /api/custom-fields/:id | settings.manage |
| DELETE | /api/custom-fields/:id | settings.manage |

### 4.9 Accounting
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/accounting/chart-of-accounts | accounting.read |
| POST | /api/accounting/chart-of-accounts | accounting.manage |
| GET | /api/accounting/journal-entries | accounting.read |
| POST | /api/accounting/journal-entries | accounting.create |
| GET | /api/accounting/invoices | accounting.read |
| POST | /api/accounting/invoices | accounting.create |
| GET | /api/accounting/expenses | accounting.read |
| POST | /api/accounting/expenses | accounting.create |
| GET | /api/accounting/payments | accounting.read |
| POST | /api/accounting/payments | accounting.create |
| GET | /api/accounting/reports/profit-loss | accounting.reports |
| GET | /api/accounting/reports/balance-sheet | accounting.reports |
| GET | /api/accounting/reports/trial-balance | accounting.reports |

### 4.10 Notifications
| Method | Path | Auth |
|--------|------|------|
| GET | /api/notifications | Yes |
| PATCH | /api/notifications/:id/read | Yes |
| POST | /api/notifications/read-all | Yes |
| GET | /api/notifications/preferences | Yes |
| PATCH | /api/notifications/preferences | Yes |
| GET | /api/notifications/templates | Admin |

### 4.11 Background Jobs
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/jobs | admin |
| POST | /api/jobs | admin |
| GET | /api/jobs/:id | admin |
| POST | /api/jobs/:id/retry | admin |
| POST | /api/jobs/:id/cancel | admin |

### 4.12 Files (Generic)
| Method | Path | Permission |
|--------|------|------------|
| POST | /api/files/upload | files.upload |
| GET | /api/files/:id | files.read |
| GET | /api/files/:id/download | files.read |
| DELETE | /api/files/:id | files.delete |
| GET | /api/files?type=:entityType&id=:entityId | files.read |

### 4.13 Global Search
| Method | Path | Auth |
|--------|------|------|
| GET | /api/search?q=:query | Yes |

### 4.14 Observability
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/observability/logs | admin |
| GET | /api/observability/errors | admin |
| GET | /api/observability/performance | admin |
| GET | /api/observability/api-metrics | admin |

### 4.15 Domain Events
| Method | Path | Permission |
|--------|------|------------|
| GET | /api/events | admin |
| POST | /api/events/:id/replay | admin |

### 4.16 n8n Webhooks
| Method | Path | Auth |
|--------|------|------|
| POST | /api/webhooks/n8n/leads | Webhook Secret |
| POST | /api/webhooks/n8n/tasks | Webhook Secret |
| POST | /api/webhooks/n8n/customers | Webhook Secret |
| POST | /api/webhooks/n8n/invoices | Webhook Secret |
| POST | /api/webhooks/n8n/spreadsheets/rows | Webhook Secret |
| POST | /api/webhooks/n8n/spreadsheets/query | Webhook Secret |

### 4.17 AI (Future)
| Method | Path | Auth |
|--------|------|------|
| POST | /api/ai/chat | Yes |
| GET | /api/ai/conversations | Yes |
| POST | /api/ai/actions | Yes |
