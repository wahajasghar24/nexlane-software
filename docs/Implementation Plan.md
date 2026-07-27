# Nexlane — Implementation Plan

> **Status:** Phase 0 — In Progress (Awaiting go-ahead to begin coding)

---

## PHASE 0: Foundation — Complete Build List

### Step 0.1 — Project Scaffolding
- `npx create-next-app` with TypeScript, Tailwind, ESLint, App Router, `src/` dir
- Configure `tsconfig.json` with `strict: true` and path aliases
- Install all dependencies (shadcn/ui components, Supabase, React Query, RHF, Zod, date-fns, etc.)

### Step 0.2 — Core Framework
| Component | Files |
|-----------|-------|
| Supabase clients | `client.ts`, `server.ts`, `admin.ts`, `middleware.ts` |
| Auth | `authenticate.ts`, `authorize.ts`, `permissions.ts` |
| Events | `event-bus.ts`, `event-repository.ts`, `types.ts`, handlers |
| Jobs | `job-queue.ts`, `job-repository.ts`, `types.ts` |
| Errors | `app-error.ts`, `database-error.ts` |
| API | `response.ts`, `pagination.ts` |
| Types | `common.ts`, `supabase.ts` |
| Utils | `cn.ts`, `date.ts` |

### Step 0.3 — Database Migrations (48 migrations)

| # | Migration | Tables |
|---|-----------|--------|
| 1 | companies | `companies`, `company_members` |
| 2 | profiles | `profiles` + trigger |
| 3-6 | RBAC | `permissions`, `roles`, `role_permissions`, `user_roles` |
| 7-8 | Feature Flags | `feature_flags`, `company_feature_flags` |
| 9-11 | Settings | `system_settings`, `company_settings`, `user_settings` |
| 12 | employees | `employees` |
| 13 | projects | `projects`, `project_members` |
| 14 | tasks | `tasks` |
| 15 | comments | `comments` (universal) |
| 16-17 | Tags | `tags`, `taggables` |
| 18-19 | Custom Fields | `custom_fields`, `custom_field_values` |
| 20 | activity | `activity_logs` |
| 21-22 | CRM | `customers`, `leads` |
| 23-26 | Spreadsheets | `sheet_tables`, `sheet_columns`, `sheet_rows`, `sheet_cells` |
| 27-33 | Accounting | `chart_of_accounts`, `journal_entries`, `journal_entry_lines`, `invoices`, `invoice_items`, `payments`, `expenses` |
| 34-36 | Notifications | `notifications`, `notification_templates`, `notification_preferences` |
| 37-38 | Jobs | `jobs`, `job_logs` |
| 39 | files | `files` |
| 40 | events | `domain_events` |
| 41 | search | `search_index` |
| 42 | AI | `ai_conversations`, `ai_prompts`, `ai_actions`, `ai_logs` |
| 43-46 | Observability | `app_logs`, `error_logs`, `performance_metrics`, `api_metrics` |
| 47 | RLS | All RLS policies by company_id |
| 48 | Indexes | All performance indexes |

### Step 0.4 — Seed Data
- Default company "Nexlane"
- All permission codes (~100+ covering all modules)
- System roles with permissions (Owner, Admin, Manager, Employee, Accountant)
- Standard chart of accounts (40+ accounts)
- Default feature flags
- Default notification templates

### Step 0.5 — Shared UI (shadcn/ui)
Install: Button, Card, Dialog, DropdownMenu, Form, Input, Label, Select, Table, Toast, Badge, Avatar, Skeleton, Command, Sheet, Popover, Tabs, Progress, Alert, Checkbox, Switch, Textarea, Tooltip
Build: `data-table.tsx`, `page-header.tsx`, `empty-state.tsx`, `confirm-dialog.tsx`, `search-input.tsx`, `theme-toggle.tsx`

### Step 0.6 — Guards
- `auth-guard.tsx`, `permission-guard.tsx`, `company-guard.tsx`

### Step 0.7 — Dashboard Layout
- `sidebar.tsx`, `header.tsx`, `mobile-nav.tsx`, `auth-layout.tsx`
- Dashboard + Auth layouts

### Step 0.8 — Auth
- Backend: `authService.ts`, schemas, API routes (signup, login, logout, session, me, switch-company)
- Frontend: `login-form.tsx`, `signup-form.tsx`, `company-selector.tsx`, hooks
- Pages: login, signup, forgot-password

### Step 0.9 — RBAC API
- `rbacService.ts`, `rbacRepository.ts`, schemas
- API: permissions CRUD, roles CRUD, role-permission assignment, user-role assignment

### Step 0.10 — Infrastructure Services (API only — no UI)
Each gets: service, repository, Zod schema, API routes (GET/POST/PATCH/DELETE)

| Module | Service |
|--------|---------|
| Feature Flags | featureFlagService, featureFlagRepository |
| Settings (3 tiers) | settingService, settingRepository |
| Activity | activityService, activityRepository |
| Notifications | notificationService, notificationRepository, template/pref services |
| Comments | commentService, commentRepository |
| Tags | tagService, tagRepository |
| Custom Fields | customFieldService, customFieldRepository |
| Files | fileService, fileRepository |
| Jobs | jobService, jobRepository |
| Search | searchService, searchRepository |
| Observability | observabilityService (logging helpers) |

### Step 0.11 — Event System Wiring
- Register built-in handlers: activity, notifications, webhooks
- Event bus integration in all infrastructure services

### Step 0.12 — Accounting Foundation
- Chart of accounts seed
- Journal entry service (double-entry validation)
- Basic ledger query

### Step 0.13 — n8n Webhooks
- API key validation middleware
- Endpoints: leads, tasks, customers, invoices, spreadsheets

### Step 0.14 — Middleware
- Auth check
- Company context resolution
- Permission caching in JWT claims

### Step 0.15 — Quality Gates
1. `npm run lint` — zero errors
2. `npx tsc --noEmit` — zero type errors
3. All 48 migrations verified
4. Auth flow verified end-to-end
5. RBAC enforced (admin can, employee cannot)
6. Generate Phase 0 report with all deliverables

---

## Phase 0 Deliverables

At the end of Phase 0, provide:

1. **Folder tree** — complete `src/` structure
2. **Database ERD** — all 47 tables with relationships
3. **Migration summary** — 48 migrations, each reversible
4. **Event catalog** — all domain events and handlers
5. **Permission catalog** — all permission codes by module
6. **API catalog** — all endpoints grouped by module
7. **Dependency list** — all npm packages with versions
8. **Architecture diagram** — system layers and data flow
9. **Testing report** — schema validation results
10. **TypeScript report** — `tsc --noEmit` output
11. **Lint report** — `eslint` output
12. **Build report** — `next build` output

**Then STOP.** No Phase 1 work until explicit approval.

---

## Future Phases (After Phase 0 Approval)

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Employee Management | 2 weeks |
| 2 | Project Management | 2 weeks |
| 3 | Task Management | 2 weeks |
| 4 | CRM (Leads + Customers) | 2 weeks |
| 5 | Spreadsheet Engine UI | 1 week |
| 6 | Accounting UI | 2 weeks |
| 7 | Notifications + Files + Search | 1 week |
| 8 | Reporting + Admin UI | 1 week |
| 9 | Testing + Polish + Deploy | 1 week |
| **Total** | | **~14 weeks** |
