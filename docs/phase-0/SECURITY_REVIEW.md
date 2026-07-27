# Security Review

**Project:** Nexlane
**Review Date:** 2026-07-25
**Reviewed By:** Automated (Phase 0)
**Scope:** All framework code, API routes, database schema, and configuration

---

## 1. Authentication

### Status: ✓ Satisfactory

| Aspect | Implementation | Notes |
|--------|---------------|-------|
| **Password-based auth** | Supabase Auth with `signInWithPassword()` | Industry-standard bcrypt hashing handled by Supabase |
| **Session management** | HTTP-only cookies via `@supabase/ssr` | Server-side cookie handling prevents XSS token theft |
| **Password minimum length** | 8 characters (signup), 6 characters (login) | Enforced via Zod schemas |
| **Email validation** | Zod `.email()` validator | Standard email format check |
| **Auto-profile creation** | Database trigger on `auth.users` INSERT | SECURITY DEFINER function ensures profile creation |
| **Session refresh** | Middleware refreshes session on every request | Ensures stale sessions are invalidated |

### Issues Found
- **Low:** Password requirements are minimal (min 8, no complexity rules). Consider adding uppercase, number, and special character requirements in Phase 1.

---

## 2. Authorization

### Status: ✓ Satisfactory

| Aspect | Implementation | Notes |
|--------|---------------|-------|
| **Role-based access** | Dynamic RBAC via `roles` → `role_permissions` → `permissions` | Fully dynamic, no hardcoded role checks |
| **Permission checking** | `authorize(context, ...permissions)` function | Centralized, reusable, typed |
| **System role protection** | `is_system` flag prevents deletion of Owner/Admin roles | Checked in `rbacService.deleteRole()` |
| **Admin-only operations** | Seed data grants Owner/Admin roles all permissions | |

### Issues Found
- **Medium:** RBAC checks are only implemented for the 7 RBAC API routes. Auth endpoints and webhooks do not use `authorize()`. Feature API routes (Phase 1+) must implement permission checks.

---

## 3. Row Level Security (RLS)

### Status: ⚠ Needs Attention

| Aspect | Implementation | Notes |
|--------|---------------|-------|
| **RLS enabled** | Yes, on all 42 tables | Migration 031 enables RLS |
| **Company isolation** | `auth_company_id()` function returns company ID from JWT | Core multi-tenant isolation mechanism |
| **Admin checks** | `is_admin()` function checks for Owner/Admin roles | Used for destructive operations |
| **Policy coverage** | 102 policies across 37 tables | Good coverage |

### Issues Found
- **High:** `performance_metrics` table has RLS enabled but NO policies defined. This means ALL operations are denied for all users (including admins). This is a functional gap, not a security vulnerability.
- **Medium:** The `auth_company_id()` function falls back to `app.current_company_id` setting if JWT claim is missing — this could potentially be manipulated.
- **Low:** Migration 031 has no explicit `DROP POLICY` statements in its down migration (only placeholder comment).

---

## 4. Middleware

### Status: ✓ Satisfactory

| Aspect | Implementation | Notes |
|--------|---------------|-------|
| **Session refresh** | Refreshes Supabase auth session on every request | Prevents expired session usage |
| **Public path detection** | Skips auth for `/login`, `/signup`, `/api/auth/*` | Correctly allows unauthenticated access |
| **Auth redirect** | Redirects unauthenticated users to `/login` | Standard pattern |
| **Response headers** | None added | Could add security headers (CSP, HSTS) |

### Issues Found
- **Low:** No security headers are set (CSP, X-Frame-Options, HSTS, etc.). Should be added for production.
- **Low:** Middleware doesn't check for company membership scope on protected routes.

---

## 5. Secrets Management

### Status: ✓ Satisfactory

| Aspect | Implementation | Notes |
|--------|---------------|-------|
| **Environment variables** | Used for Supabase URL, anon key, service role key, webhook secret | Via `.env.local` |
| **Service role key** | Used only in `core/supabase/admin.ts` | Bypasses RLS — used only for server-to-server operations |
| **Webhook secret** | `NEXLANE_WEBHOOK_SECRET` env var | Shared secret, not per-company |

### Issues Found
- **Medium:** Single webhook secret for all companies. If compromised, all companies are affected. Consider per-company webhook secrets in Phase 1.
- **Low:** No `.env.local.example` checked in (manual creation needed).

---

## 6. Input Validation

### Status: ✓ Satisfactory

| Aspect | Implementation | Notes |
|--------|---------------|-------|
| **Zod schemas** | Used for all API request bodies | Auth endpoints, RBAC, webhooks |
| **Type inference** | `z.infer<typeof schema>` for TypeScript types | Compile-time type safety |
| **Webhook validation** | Separate schemas for each webhook type | Prevents malformed data from n8n |

### Issues Found
- **Medium:** `PATCH /api/rbac/roles/[id]` and `POST /api/rbac/roles/[id]/permissions` do NOT parse/validate their request bodies with Zod in the route handler. Validation is delegated to the service layer, which does not validate either.
- **Low:** `POST /api/auth/switch-company` reads raw JSON without Zod validation — `companyId` is only checked for existence.

---

## 7. Audit Logs

### Status: ✓ Satisfactory

| Aspect | Implementation | Notes |
|--------|---------------|-------|
| **Activity tracking** | `activity_logs` table with before/after data | Immutable, append-only |
| **Event-driven** | All events flow through activity handler | Centralized audit point |
| **Rich context** | IP address, user agent, entity type/ID, action | Full audit trail |

### Issues Found
- **Medium:** RBAC events are emitted but auth events (`user.login`, `user.logout`) pass empty string for `companyId`. Activity logs for auth events will have null company context.
- **Low:** No retention policy defined for audit logs.

---

## 8. Rate Limiting

### Status: ✗ Not Implemented

| Aspect | Implementation | Notes |
|--------|---------------|-------|
| **API rate limiting** | Not implemented | All endpoints are unprotected from brute force |
| **Login throttling** | Relies on Supabase Auth's built-in rate limiting | Supabase has basic rate limiting |
| **Webhook rate limiting** | Not implemented | n8n could flood the webhook endpoints |

### Recommendation
Implement rate limiting in middleware (e.g., `express-rate-limit` equivalent or a token bucket algorithm) before Phase 1 deployment. Prioritize: login/signup → webhook endpoints → all API routes.

---

## 9. Webhook Security

### Status: ⚠ Needs Attention

| Aspect | Implementation | Notes |
|--------|---------------|-------|
| **Authentication** | Bearer token via `Authorization` header | Matched against `NEXLANE_WEBHOOK_SECRET` env var |
| **Validation** | Zod schemas for all webhook payloads | Prevents injection attacks |
| **HTTPS** | Relies on hosting infrastructure | Should be enforced at reverse proxy level |
| **IP allowlisting** | Not implemented | Any caller with the secret can invoke webhooks |

### Issues Found
- **Medium:** Single shared webhook secret across all companies and all webhook types. Consider:
  - Per-company webhook secrets
  - Per-webhook-type secrets (different for leads vs invoices)
  - IP allowlisting for known n8n IPs
- **Low:** No signature verification (e.g., HMAC) for webhook payloads.

---

## 10. Additional Security Considerations

| Concern | Status | Notes |
|---------|--------|-------|
| **SQL Injection** | ✓ Mitigated | Supabase queries use parameterized queries |
| **XSS** | ✓ Mitigated | React's JSX escapes values by default |
| **CSRF** | ✓ Mitigated | Supabase handles CSRF via cookies |
| **CORS** | ✓ Not needed | Same-origin only (no separate API server) |
| **HTTPS** | ⚠ Infrastructure | Must be configured at hosting level |
| **Dependency vulnerabilities** | ⚠ 12 high severity | `npm audit` reports 12 high severity vulnerabilities |
| **Container security** | ⚠ Not configured | Docker setup deferred to Phase 1+ |

---

## Risk Summary

| Severity | Count | Key Items |
|----------|-------|-----------|
| **High** | 1 | `performance_metrics` table has no RLS policies (blocked, not vulnerable) |
| **Medium** | 6 | Shared webhook secret, missing Zod validation on some routes, auth events lack company context, `auth_company_id()` fallback, no rate limiting, missing Zod on PATCH roles |
| **Low** | 6 | Password complexity, missing security headers, no CSP, no `.env.local.example`, audit retention, down migration completeness |

---

## QG-1 Updates (Resolved)

The following items from the initial review have been resolved in QG-1:

| # | Finding | Resolution |
|---|---------|------------|
| 1 | `performance_metrics` RLS policies missing | Added `pm_select` and `pm_insert` policies in migration 031 |
| 2 | Missing Zod validation on PATCH roles, POST permissions, POST switch-company | Added `updateRoleSchema`, `assignPermissionsSchema`, `switchCompanySchema` parsing |
| 3 | Auth events pass empty companyId | `authService` now queries default company membership before emitting |
| 4 | 22 unused npm packages (12 high severity vulns) | Removed all unused packages; 457 remaining packages with 12 medium/high vulns inherited from Next.js peer deps (informational only, no fix available) |
| 5 | `updated_at` not auto-managed | Migration 033 adds trigger to 26 tables |

## Remaining Immediate Actions (Phase 1)

1. Add rate limiting middleware for login/signup
2. Add security headers in middleware
3. Implement per-company webhook secrets
