# Technical Debt

**Project:** Nexlane
**Review Date:** 2026-07-25
**Phase:** 0 (after QG-1)

---

## Resolved Items (Fixed in QG-1)

| # | Item | Severity | Resolution |
|---|------|----------|------------|
| 1 | `performance_metrics` table has no RLS policies | HIGH | Added `pm_select` and `pm_insert` policies in migration 031 |
| 2 | Missing `invoices.list` and `invoices.read` permissions | MEDIUM | Added to `seed.sql` and `permissions.ts` constants |
| 3 | Missing Zod validation on `PATCH /api/rbac/roles/[id]` | MEDIUM | Added `updateRoleSchema.parse()` in route handler |
| 4 | Missing Zod validation on `POST /api/rbac/roles/[id]/permissions` | MEDIUM | Added `assignPermissionsSchema.parse()` in route handler |
| 5 | Missing Zod validation on `POST /api/auth/switch-company` | MEDIUM | Added `switchCompanySchema` with UUID validation |
| 6 | Auth events lack company context | MEDIUM | `authService` now fetches default company before emitting events |
| 7 | `updated_at` not auto-maintained by triggers | LOW | Migration 033 adds auto-update trigger to 26 tables |
| 8 | Event handlers not registered at startup | LOW | Added `import '@/core/events/register'` in root layout |
| 9 | Unused barrel exports (`formatDate`, `timeAgo`, `toISO`) | LOW | Removed from `core/utils/index.ts` barrel |
| 10 | 22 unused npm packages | LOW | Removed in QG-1 cleanup |

---

## Remaining Debt (Accepted)

### Phase 1

| # | Item | Severity | Notes |
|---|------|----------|-------|
| 1 | Empty repository directories in infrastructure modules | Low | Pattern established; will populate during feature work |
| 2 | Empty feature directories (15 of 17 feature modules) | Low | Will populate during Phases 1-4 |
| 3 | No unit or integration tests | High | Add at start of Phase 1 before feature code |
| 4 | No pagination on list endpoints | Low | Fine for small datasets; add at scale |
| 5 | Guards not wired into dashboard layout | Low | AuthGuard redundant with middleware; PermissionGuard/CompanyGuard for Phase 1 |
| 6 | No rate limiting on API endpoints | Medium | Add rate limiting middleware in Phase 1 deployment |
| 7 | Single shared webhook secret | Medium | Per-company secrets when webhook management UI is built |

### Future (Phase 2+)

| # | Item | Severity | Notes |
|---|------|----------|-------|
| 1 | No CI/CD pipeline | Medium | Manual deployment only |
| 2 | Observability not instrumented | Low | `observability/index.ts` exists but no active instrumentation |
| 3 | Job queue not wired | Low | `core/jobs/` exists but no consumers — Phase 1 when background tasks needed |
| 4 | Password complexity rules | Low | Min 8 chars enforced; full complexity deferred |
| 5 | Missing security headers (CSP, HSTS) | Low | Add at deployment time |
| 6 | No request ID / correlation ID | Low | Add when distributed tracing needed |
| 7 | No request timeout handling | Low | Fine for current serverless usage |
| 8 | Middleware uses deprecated `middleware` convention | Low | Migrate to `proxy` when stable in Next.js |

---

## Debt-Free Areas

| Area | Status | Evidence |
|------|--------|----------|
| TypeScript strict mode | ✓ Clean | `strict: true`, no `any` types in source |
| Build output | ✓ Clean | Zero errors, zero warnings |
| ESLint | ✓ Clean | No lint errors |
| Migration reversibility | ✓ Clean | All 33 migrations have `-- DOWN` sections |
| Soft delete patterns | ✓ Consistent | Applied uniformly across all 15 business tables |
| API response format | ✓ Consistent | `{ data, error }` everywhere |
| Error handling | ✓ Consistent | `AppError` / `DatabaseError` classes used |
| Event handler registration | ✓ Now wired | `register.ts` imported in root layout |
| RLS policy coverage | ✓ Comprehensive | 95 policies across 38 tables (perf_metrics now included) |
| Multi-tenant isolation | ✓ Implemented | `company_id` on all business tables + RLS |
| Zod validation on API routes | ✓ Complete | All 17 endpoints now validate input |
| `updated_at` auto-maintenance | ✓ Implemented | Migration 033 covers 26 tables |
| Permission/seed data consistency | ✓ Verified | 64 permissions in DB match TypeScript constants |
