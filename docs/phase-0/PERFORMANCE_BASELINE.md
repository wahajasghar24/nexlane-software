# Performance Baseline

**Project:** Nexlane
**Date:** 2026-07-25
**Build Tool:** Webpack (Turbopack unavailable on Windows)

---

## Build Metrics

| Metric | Value |
|--------|-------|
| Compilation time | ~17 seconds |
| TypeScript check time | ~10 seconds |
| Static page generation | ~1.1 seconds (18 pages) |
| **Total build time** | **~28 seconds** |
| Build output size | ~191MB (`.next/` directory, includes cache) |
| JS bundle size | ~1.2 MB (41 JS files) |
| Largest chunk | ~278 KB |
| Framework chunk | ~185 KB |
| Cache strategy | Webpack filesystem cache |

*Note: First build after npm install is slower due to cache population. Subsequent builds are ~15s.*

---

## Bundle Observations

| Route | Type | Notes |
|-------|------|-------|
| `/` (dashboard) | Static | Prerendered at build time |
| `/login` | Static | Prerendered at build time |
| `/signup` | Static | Prerendered at build time |
| `/api/auth/*` (6 routes) | Dynamic | Server-rendered on demand |
| `/api/rbac/*` (7 routes) | Dynamic | Server-rendered on demand |
| `/api/webhooks/n8n/*` (4 routes) | Dynamic | Server-rendered on demand |
| `/_not-found` | Static | Next.js built-in |
| **Total routes** | **18** | |

---

## Route Count by Category

| Category | Count | Type |
|----------|-------|------|
| Static pages | 3 | `/`, `/login`, `/signup` |
| API routes (auth) | 6 | Login, signup, logout, session, me, switch-company |
| API routes (RBAC) | 7 | Permissions, roles CRUD, role permissions |
| API routes (webhooks) | 4 | Tasks, leads, customers, invoices |
| Other | 1 | `/_not-found` |
| **Total** | **18** | |

---

## Database Tables by Module

| Module | Tables | RLS Policies | Indexes |
|--------|--------|-------------|---------|
| Core/Tenancy | 2 | 5 | 0 |
| Profiles/Auth | 1 | 2 | 0 |
| RBAC | 4 | 10 | 1 |
| Feature Flags | 2 | 5 | 0 |
| Settings | 3 | 5 | 0 |
| HR/Employees | 1 | 4 | 1 |
| Projects | 2 | 6 | 1 |
| Tasks | 1 | 4 | 2 |
| Comments | 1 | 4 | 2 |
| Tags | 2 | 4 | 1 |
| Custom Fields | 2 | 5 | 1 |
| Activity Logs | 1 | 1 | 3 |
| CRM | 2 | 8 | 2 |
| Spreadsheets | 4 | 16 | 1 |
| Accounting | 3 | 6 | 4 |
| Invoicing | 2 | 6 | 2 |
| Payments/Expenses | 2 | 4 | 0 |
| Notifications | 3 | 6 | 2 |
| Jobs | 2 | 3 | 4 |
| Files | 1 | 4 | 2 |
| Domain Events | 1 | 1 | 2 |
| Search | 1 | 1 | 2 |
| AI | 4 | 3 | 1 |
| Observability | 4 | 3 | 3 |
| **Total** | **42** | **102** | **35** |

---

## API Endpoint Count by Method

| Method | Count | Endpoints |
|--------|-------|-----------|
| GET | 5 | `/api/auth/session`, `/api/auth/me`, `/api/rbac/permissions`, `/api/rbac/roles`, `/api/rbac/roles/[id]` |
| POST | 9 | `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`, `/api/auth/switch-company`, `/api/rbac/roles`, `/api/rbac/roles/[id]/permissions`, `/api/webhooks/n8n/*` (4) |
| PATCH | 1 | `/api/rbac/roles/[id]` |
| DELETE | 1 | `/api/rbac/roles/[id]` |
| **Total** | **17** | |

---

## Code Size Estimate

| Directory | Approximate Files | Estimated LOC |
|-----------|------------------|---------------|
| `src/core/` | ~18 | ~900 |
| `src/features/` (auth + rbac) | ~10 | ~700 |
| `src/infrastructure/` | ~12 | ~500 |
| `src/shared/` | ~10 | ~400 |
| `src/app/` | ~25 | ~800 |
| `src/middleware.ts` | 1 | ~50 |
| `supabase/` (migrations) | 32 | ~1,200 |
| `supabase/seed.sql` | 1 | ~270 |
| **Total** | **~109** | **~4,820** |

---

## Optimization Opportunities

### Build-Time
| Opportunity | Impact | Effort | Notes |
|-------------|--------|--------|-------|
| Switch to Turbopack | High | Low | Not available on Windows; will improve on Linux/macOS |
| Analyze bundle with `@next/bundle-analyzer` | Medium | Low | Identify large dependencies |
| Remove unused barrel exports | Low | Low | Done in QG-1 (`formatDate`, `timeAgo`, `toISO`) |

### Runtime
| Opportunity | Impact | Effort | Notes |
|-------------|--------|-------|-------|
| Add database connection pooling (PgBouncer) | High | Medium | For production Supabase |
| Implement Redis caching for frequent queries | High | Medium | Feature flags, settings, permissions |
| Add pagination to all list endpoints | High | Low | Currently unbounded on list endpoints |
| Add database query logging | Medium | Low | Already has `api_metrics` table |
| Create composite indexes for common query patterns | Medium | Medium | Add after analyzing real query patterns |
| Implement response compression | Low | Low | Handled by reverse proxy |

### Database
| Opportunity | Impact | Effort | Notes |
|-------------|--------|-------|-------|
| Partition large tables by company_id | Medium | High | For companies with 100k+ records |
| Add materialized views for reports | Medium | Medium | Financial aggregations, project summaries |
| Implement table partitioning for `activity_logs` | Medium | High | Can grow very large |

### Frontend
| Opportunity | Impact | Effort | Notes |
|-------------|--------|-------|-------|
| Implement route-based code splitting | Already done | — | Next.js App Router handles this |
| Add React.lazy for heavy components | Medium | Low | For modal dialogs, editors |
| Optimize bundle with tree-shaking | Already done | — | Webpack handles this |
| Add image optimization | Low | Low | No images yet; use `next/image` when added |

---

## Production Deployment Considerations

| Factor | Recommendation |
|--------|---------------|
| Node.js memory | Minimum 512MB, recommended 1GB |
| Database connections | Use PgBouncer transaction pooling |
| CDN | Vercel Edge Network or Cloudflare |
| Serverless functions | 10s timeout minimum (webhooks may need more) |
| File storage | Supabase Storage with CDN enabled |
| Environment size | ~200MB (node_modules + .next) |
