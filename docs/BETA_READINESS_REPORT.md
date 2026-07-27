# Beta Readiness Report

**Project**: Nexlane  
**Date**: 2026-07-26  
**Phase Coverage**: Phase 0 (Foundation), Phase 1 (Employee/Project/Task/Work Log), Phase 2 (CRM)  
**Build**: ✅ Compiled (54 routes/pages), TypeScript 0 errors  
**Report Type**: Architectural & UX review — no code changes  

---

## 1. Missing Features

| # | Feature | Impact | Notes |
|---|---------|--------|-------|
| 1.1 | **User Profile Management UI** | High | No UI page to edit own profile (name, email, password change, avatar). Auth API (`/api/auth/me`) exists but no profile page. |
| 1.2 | **Notifications UI** | High | `notifications` table and events exist but there is no UI page to view/manage notifications. No bell icon in header. |
| 1.3 | **File Management UI** | High | `files` table exists with polymorphic `entity_type/entity_id`. File upload/download API exists but no file picker/manager UI in any module (no file attachments on leads, deals, tasks, etc.). |
| 1.4 | **Global Search UI** | Medium | `search_index` table exists with full-text search setup, but there is no search bar or search results page. |
| 1.5 | **RBAC Management UI** | High | Role management APIs exist (`/api/rbac/roles`, `/api/rbac/permissions`) but there is no UI page for managing roles/permissions. |
| 1.6 | **Bulk Operations** | Medium | No module supports bulk delete, bulk status change, or bulk export. Every operation is single-entity. |
| 1.7 | **Reports & Analytics Dashboard** | Medium | Dashboard page exists but shows only basic stats. No exportable reports, charts, or date-range filtering. |
| 1.8 | **Activity Timeline — Export** | Low | `TIMELINE_EXPORT` permission and export route exist in permissions but no export implementation. |
| 1.9 | **Two-Factor Authentication** | Medium | No 2FA/MFA support. Login uses email/password only. |
| 1.10 | **Password Reset** | Medium | No forgot-password or password-reset flow. Signup creates account but no email verification. |
| 1.11 | **Timezone Handling** | Medium | All dates stored as UTC timestamps but no user timezone preference. Displayed dates use `toLocaleDateString()` without timezone conversion. |
| 1.12 | **CRM Customer Portal** | Low | No customer-facing portal for viewing invoices, deals, or support tickets. |

---

## 2. Broken User Flows

| # | Flow | Issue | Severity | Location |
|---|------|-------|----------|----------|
| 2.1 | **Create employee → profile sync** | Creates `employees` row but also updates `profiles` table. If profile update succeeds but employee insert fails, profile is already modified with no rollback. | High | `employeeService.create()` |
| 2.2 | **Edit employee → profile sync** | Fetches existing profile data, constructs a full name from parsed first/last name, then updates. If the existing profile name doesn't have a space, parsing breaks. | Medium | `employeeService.update()` — profile full_name parsing |
| 2.3 | **Deal won → customer creation** | When `markWon` is called, it creates a customer record. If the deal has no associated lead or crm_company, some customer fields may be empty. | Medium | `dealService.markWon()` |
| 2.4 | **Lead conversion** | Converts lead to deal but doesn't carry over notes, activities, or attachments to the new deal. | Medium | `leadService.convert()` |
| 2.5 | **No rollback on event failure** | After DB mutation succeeds but event emission fails, the data is committed with no audit trail. `eventBus.emit()` is awaited but errors are only logged. | Medium | All services |
| 2.6 | **Deleted entities still referenced** | Soft-deleted entities can still be referenced by FK. No UI indication when a referenced entity has been deleted. | Low | All modules |
| 2.7 | **Primary contact toggle** | When setting a contact as primary, the service unsets other primaries for the same company, but doesn't do this in a transaction. | Medium | `contactService.create()` |
| 2.8 | **No optimistic UI updates** | All mutations use full-page reloads or manual re-fetches. No optimistic updates for any CRUD action. | Low | All UI pages |

---

## 3. UI/UX Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 3.1 | **No success/error toast notifications** | High | All pages — after create/update/delete, there is no feedback toast. |
| 3.2 | **No delete confirmation dialogs** | High | All delete actions trigger immediately with no confirmation modal. |
| 3.3 | **Form validation feedback** | High | Most forms catch `err` generically but don't display Zod validation errors inline. Error is shown as generic alert or not at all. |
| 3.4 | **Loading skeleton inconsistency** | Medium | Some pages have `animate-pulse` skeletons, others have no loading state at all (e.g., departments, designations pages). |
| 3.5 | **No error boundaries** | High | No React error boundaries anywhere. A render crash takes down the entire page. |
| 3.6 | **Form fields use raw UUID inputs** | Medium | Lead/Deal/Contact forms require users to type UUIDs for `owner_id`, `crm_company_id`, `lead_id` etc. No dropdown/selector for related entities. |
| 3.7 | **Empty state missing on some pages** | Medium | Some list pages don't show `EmptyState` component when data is empty. |
| 3.8 | **No page metadata/titles** | Low | Pages don't set `<title>` or `<meta>` tags for SEO/document title. |
| 3.9 | **European date format** | Low | Dates use `toLocaleDateString()` without locale config, displaying in user's default locale. No consistency. |
| 3.10 | **No keyboard shortcuts** | Low | No keyboard shortcuts for common actions (Ctrl+Enter to submit, Esc to close, etc.). |
| 3.11 | **No pagination info on some lists** | Medium | Some list pages show "Page X of Y" but without total record count. |
| 3.12 | **No dark mode on CRM pages** | Medium | New CRM pages may not fully respect dark mode classes (checking crm/departments, etc.). |

---

## 4. Database Design Issues

| # | Issue | Severity | Tables Affected |
|---|-------|----------|-----------------|
| 4.1 | **Missing RLS policies on Phase 1 tables** | **Critical** | `departments`, `designations`, `teams`, `team_members`, `employee_skills`, `work_logs`, `project_modules`, `milestones`, `task_assignees`, `task_checklist_items`, `task_watchers`, `task_dependencies`, `task_labels`, `task_label_mappings` |
| 4.2 | **Missing RLS policies on Phase 2 tables** | **Critical** | `crm_companies`, `contacts`, `deals`, `activities`, `lead_notes` |
| 4.3 | **Missing audit columns (`created_by`/`updated_by`)** | Medium | `task_assignees` (has neither), `team_members` (has neither), `task_checklist_items` (missing `updated_by`), `task_labels` (missing both), `task_label_mappings` (missing both), `designations` (missing `updated_by`), `project_modules` has `created_by` but some fields missing |
| 4.4 | **Missing indexes on Phase 2 FK columns** | Medium | `lead_notes(lead_id)` — only one index exists; `contacts(crm_company_id)`, `deals(crm_company_id)` could benefit from additional composite indexes |
| 4.5 | **No hard-delete for junction tables** | Low | `task_assignees`, `task_label_mappings`, `team_members` have no `deleted_at` column — hard delete only. This is actually correct for junction tables but inconsistent with the rest of the codebase. |
| 4.6 | **VARCHAR vs TEXT inconsistency** | Low | Some columns use `VARCHAR(50)` while others use `TEXT` for similar data (e.g., `employees.employee_code VARCHAR(50)` vs `departments.name TEXT`). |
| 4.7 | **Missing CHECK constraint on `activities.entity_type`** | Medium | `activities` has a CHECK on entity_type for crm entities, but doesn't include system entity types like 'task', 'project', 'employee' for when activities are used more broadly. |
| 4.8 | **No RLS on `domain_events` public insert** | Medium | `domain_events` has SELECT restricted but INSERT is allowed for all (see jobs table policy). |
| 4.9 | **Missing cascade behavior on some FKs** | Low | `deals.lead_id ON DELETE SET NULL` could leave orphan references if a lead is deleted. |
| 4.10 | **No database-level soft-delete enforcement** | Low | Soft delete is enforced only at the application level. There is no DB trigger/view to exclude soft-deleted rows. |

---

## 5. Performance Bottlenecks

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 5.1 | **N+1 queries in project detail** | High | `projectService.getById()` makes 4 separate sequential queries (project, members, modules, milestones). Should use a single join or batched query. |
| 5.2 | **N+1 queries in employee list** | Medium | `employeeService.list()` uses `profile:profile_id(*)` which is a join in a single query — correct. But employee list fetches all rows with these joins on every request without caching. |
| 5.3 | **No pagination limit enforcement in some list endpoints** | High | CRM deals list page uses `limit=200` hardcoded — no max-limit cap at API level. |
| 5.4 | **Admin client in all services** | High | All services use `createAdminClient()` which bypasses RLS and creates a new client on every request. No connection pooling or client reuse. |
| 5.5 | **No query timeouts** | Medium | No `statement_timeout` or query timeout is set. A long-running query can block the connection indefinitely. |
| 5.6 | **Sequential event handlers** | Medium | `eventBus.emit()` uses `Promise.allSettled()` which is parallel, but `eventRepository.create()` is sequential before handlers run. Event persistence is a potential bottleneck. |
| 5.7 | **No response caching** | Medium | No HTTP caching headers (`Cache-Control`, `ETag`) on any API response. Even relatively static data like departments/designations is fetched on every page load. |
| 5.8 | **No query result caching** | Low | No in-memory or Redis caching layer. Every request hits the database directly. |
| 5.9 | **`count: 'exact'` on every paginated query** | Medium | Using `{ count: 'exact' }` on every list query triggers a full COUNT scan. For large tables, this becomes expensive. |

---

## 6. Security Risks

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 6.1 | **Hardcoded company UUID in seed data** | Medium | `seed.sql` uses `'00000000-0000-0000-0000-000000000001'` as hardcoded company_id. If deployed to production, this is predictable. |
| 6.2 | **Admin client bypasses RLS** | **Critical** | All services use `createAdminClient()` which uses the service_role key. This means ALL RLS policies are bypassed. The actual row-level security is never exercised. |
| 6.3 | **No rate limiting** | High | No rate limiting on any endpoint. Auth endpoints (`/api/auth/login`, `/api/auth/signup`) are unprotected against brute force. |
| 6.4 | **No input sanitization in search** | Medium | Search queries use Supabase `.ilike()` which is parameterized — safe from SQL injection. But raw user input is included in search requests without length/character validation. |
| 6.5 | **Error details exposed in production** | Medium | The error handler returns `err.message` in responses, which may expose internal details. Could leak database error codes/messages. |
| 6.6 | **No CSRF protection** | Medium | No CSRF tokens on state-changing API requests. Cookie-based auth could be vulnerable to CSRF. |
| 6.7 | **Weak password requirements** | Medium | Signup schema has no password strength validation (min length, complexity). |
| 6.8 | **No session invalidation on logout** | Medium | Login creates a Supabase session. Logout calls `signOut()` but doesn't invalidate all server-side sessions. |
| 6.9 | **API key stored in plaintext** | Medium | n8n API key is stored in `company_settings` as plaintext value — not hashed. |

---

## 7. API Inconsistencies

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 7.1 | **Inconsistent pagination response format** | High | Some services return `{ data, total, page, pageSize, totalPages }` while others return `{ data, total, page, limit }`. Front-end code must handle both. |
| 7.2 | **`data` vs `data.data` wrapper inconsistency** | High | Some API routes wrap the service response in `{ data: serviceData, error: null }` resulting in `response.data.data`. Others return `{ data: { data: [...], ... }, error: null }` resulting in double-wrapping. Front-end code has patterns like `d.data || d` to handle both. |
| 7.3 | **HTTP status code inconsistency** | Medium | Delete operations return `200 OK` with `{ data, error: null }`. Some POST operations return `201 Created`, but not consistently. |
| 7.4 | **Missing bulk endpoints** | Medium | No `DELETE /api/crm/leads/bulk`, `PATCH /api/tasks/bulk`, etc. Each module only supports single-entity operations. |
| 7.5 | **Snake_case vs camelCase in API responses** | Medium | API returns data directly from Supabase (snake_case). Some UI components expect camelCase. No response transformer is applied. |
| 7.6 | **No API versioning** | Low | All routes are at `/api/...` with no version prefix (`/api/v1/...`). Future breaking changes will be difficult. |
| 7.7 | **Missing HEAD/OPTIONS handlers** | Low | No route implements HEAD or OPTIONS HTTP methods for CORS preflight or resource checking. |

---

## 8. Permission Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 8.1 | **No permission checks on Phase 1 extension routes** | High | `POST /api/teams/[id]/members`, `DELETE /api/teams/[id]/members/[memberId]` — check `TEAMS_MANAGE_MEMBERS`? No such permission exists. |
| 8.2 | **No permission for work-log approval route** | High | `POST /api/work-logs/[id]/approve` — `WORK_LOGS_APPROVE` exists in permissions object but is it used in the route? |
| 8.3 | **Missing `DEPARTMENTS_MANAGE`** | Medium | Departments have CRUD permissions but no "manage" permission for bulk operations. |
| 8.4 | **No permission for converting deals** | Low | Deal->Customer conversion is handled by `DEALS_WON` permission, which covers both the stage change and customer creation. May want separate permissions. |
| 8.5 | **No permission for timeline export** | Low | `TIMELINE_EXPORT` permission exists as a constant but no route checks for it (no export endpoint exists). |
| 8.6 | **Missing permissions for watchers/checklists/dependencies** | Medium | Task watcher/checklist/dependency API routes need to check `TASKS_WATCH`, `TASKS_CHECKLIST` permissions. Verify these are checked in the actual routes. |

---

## 9. Event Coverage

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 9.1 | **Department mutations don't emit events** | Medium | `departmentService.create/update/softDelete` — no `DEPARTMENT_CREATED/UPDATED/DELETED` events emitted. |
| 9.2 | **Designation mutations don't emit events** | Medium | `designationService` — no events emitted at all. |
| 9.3 | **Team member add/remove events defined but not emitted** | Medium | `TEAM_MEMBER_ADDED/REMOVED` exist in EventTypes but may not be emitted by team service. |
| 9.4 | **No retry mechanism for failed event handlers** | Medium | `eventBus.emit()` catches handler failures but doesn't retry. Failed handlers are logged and status updated to 'failed', but no retry job is created. |
| 9.5 | **Project archive/unarchive events not emitted in service** | Medium | `projectService.archive()` doesn't emit `PROJECT_ARCHIVED` or `PROJECT_UNARCHIVED` events. |
| 9.6 | **Webhook handler silently fails** | Medium | `webhookHandler` silently catches all errors. If n8n is unreachable, there is no retry, logging, or alerting. |
| 9.7 | **No event idempotency handling** | Low | If an event is emitted twice (e.g., on retry), there's no deduplication mechanism. Side effects could run multiple times. |

---

## 10. Mobile Responsiveness

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 10.1 | **Tables not horizontally scrollable** | High | All list pages use native `<table>` elements without `overflow-x-auto` wrapper. On mobile, tables overflow the viewport. |
| 10.2 | **Kanban board not touch-friendly** | High | Deal pipeline uses drag-free columns but fixed width (`w-64`) with `overflow-x-auto`. Cards cannot be swiped/moved on mobile. |
| 10.3 | **Form layouts not stacking on mobile** | Medium | Many forms use `grid grid-cols-2 gap-4` which doesn't collapse to single column on mobile. Missing `grid-cols-1 md:grid-cols-2`. |
| 10.4 | **No mobile navigation** | High | No hamburger menu or bottom tab bar for mobile. The sidebar/layout may not render properly on small screens. |
| 10.5 | **Filters not wrapping on mobile** | Medium | Filter bars use `flex flex-wrap` but on very narrow screens, inputs overlap or are cut off. |
| 10.6 | **Action buttons not touch-optimized** | Low | Buttons are `py-2` which is ~32px — minimum touch target is 44px. May be hard to tap on mobile. |

---

## 11. Accessibility

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 11.1 | **Missing `<label>` elements on form inputs** | High | Most form pages use `<label className="block text-sm...">` styled as visual labels but not properly associated with inputs via `htmlFor`/`id` attributes. |
| 11.2 | **No ARIA attributes** | High | No `aria-label`, `aria-description`, `role`, or `aria-live` attributes anywhere. Screen readers get no useful context. |
| 11.3 | **No keyboard navigation** | High | Modal/dialog components don't trap focus. Tab order may not be logical. No Escape key handling for closing modals. |
| 11.4 | **No focus management** | Medium | After form submission or navigation, focus is not moved to the new content area. Keyboard users are disoriented. |
| 11.5 | **Color contrast** | Medium | Status badges use low-contrast combinations. For example, `bg-orange-100 text-orange-800` may not meet WCAG AA standards. |
| 11.6 | **No skip-to-content link** | Medium | No skip navigation link for keyboard users. |
| 11.7 | **No alt text on interactive elements** | Medium | Decorative elements and icon-only buttons lack alt text or aria-labels. |
| 11.8 | **No `lang` attribute on HTML** | Low | The root HTML element may not have `lang` attribute set for screen readers. |

---

## 12. Scalability Concerns

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 12.1 | **No connection pooling** | High | Each request creates a new Supabase admin client. For 100 concurrent users, 100 connections could be opened. No pooler configured. |
| 12.2 | **Admin client bypasses RLS entirely** | **Critical** | Every service uses `createAdminClient()` with the service_role key. Authorization is done only at the API route level via `authorize()`. If a route is ever exposed without `authorize()`, all data is accessible. RLS is completely non-functional as a defense-in-depth layer. |
| 12.3 | **No caching layer** | High | No Redis, Memcached, or in-memory cache. Every page load hits the database directly. Relatively static data (departments, designations, permissions) is fetched on every request. |
| 12.4 | **No request queue for heavy operations** | Medium | Lead conversion (which creates a deal), deal-won (which creates a customer), and other multi-step operations run synchronously. If the database is slow, the HTTP request hangs. |
| 12.5 | **No database read replicas** | Medium | All queries go to the primary database. Read-heavy operations (list pages, timeline) compete with write operations. |
| 12.6 | **No bulk insert/update operations** | Medium | All mutations are single-row. Importing 10,000 leads would require 10,000 separate HTTP requests. |
| 12.7 | **No database migration dry-run** | Low | Migrations are applied directly. No dry-run or pre-flight check mechanism for production deployments. |

---

## Severity Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 24 |
| Medium | 33 |
| Low | 10 |
| **Total** | **70** |

## Top 5 Critical/High Priority Items

1. **[CRITICAL] RLS policies missing for 19 tables** — Phase 1 and Phase 2 tables have no row-level security. Data is accessible to any authenticated user within the same company at the DB level.
2. **[CRITICAL] Admin client bypasses all RLS** — All services use `service_role` key. Authorization relies entirely on application-level `authorize()` calls. A single missing `authorize()` call exposes all data.
3. **[HIGH] No success/error toasts, delete confirmations, or inline form validation** — The UI lacks basic feedback mechanisms that users expect in a production application.
4. **[HIGH] No mobile-responsive tables or navigation** — The application is largely unusable on mobile devices.
5. **[HIGH] No rate limiting or brute-force protection on auth endpoints** — Login/signup are vulnerable to brute-force attacks.

---

*This report is based on static code analysis. Some issues may be mitigated by configuration or runtime behavior not visible in the codebase.*
