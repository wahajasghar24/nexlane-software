# Project Tree

**Project:** Nexlane
**Generated:** Phase 0

---

## Source Code (`src/`)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── session/route.ts
│   │   │   ├── signup/route.ts
│   │   │   └── switch-company/route.ts
│   │   ├── rbac/
│   │   │   ├── permissions/route.ts
│   │   │   └── roles/
│   │   │       ├── [id]/
│   │   │       │   ├── permissions/route.ts
│   │   │       │   └── route.ts
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── n8n/
│   │           ├── customers/route.ts
│   │           ├── invoices/route.ts
│   │           ├── leads/route.ts
│   │           └── tasks/route.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── core/
│   ├── api/
│   │   ├── pagination.ts
│   │   └── response.ts
│   ├── auth/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   └── permissions.ts
│   ├── errors/
│   │   ├── app-error.ts
│   │   └── database-error.ts
│   ├── events/
│   │   ├── event-bus.ts
│   │   ├── event-repository.ts
│   │   ├── handlers/
│   │   │   ├── activity-handler.ts
│   │   │   ├── notification-handler.ts
│   │   │   └── webhook-handler.ts
│   │   ├── register.ts
│   │   └── types.ts
│   ├── jobs/
│   │   ├── job-queue.ts
│   │   ├── job-repository.ts
│   │   └── types.ts
│   ├── supabase/
│   │   ├── admin.ts
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── types/
│   │   └── common.ts
│   └── utils/
│       ├── cn.ts
│       ├── date.ts
│       └── index.ts
├── features/
│   ├── accounting/          (empty — Phase 1+)
│   ├── ai/                  (empty — Phase 1+)
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── schemas/
│   │   │   └── auth.schema.ts
│   │   └── services/
│   │       └── authService.ts
│   ├── crm/                 (empty — Phase 1+)
│   ├── employees/           (empty — Phase 1+)
│   ├── files/               (empty — Phase 1+)
│   ├── notifications/       (empty — Phase 1+)
│   ├── projects/            (empty — Phase 1+)
│   ├── rbac/
│   │   ├── components/      (empty — Phase 1+)
│   │   ├── hooks/           (empty — Phase 1+)
│   │   ├── repositories/    (empty — Phase 1+)
│   │   ├── schemas/
│   │   │   └── rbac.schema.ts
│   │   └── services/
│   │       └── rbacService.ts
│   ├── reports/             (empty — Phase 1+)
│   ├── search/              (empty — Phase 1+)
│   ├── settings/            (empty — Phase 1+)
│   ├── spreadsheets/        (empty — Phase 1+)
│   ├── tasks/               (empty — Phase 1+)
│   └── timeline/            (empty — Phase 1+)
├── infrastructure/
│   ├── activity/
│   │   ├── repositories/    (empty)
│   │   └── services/
│   │       └── activityService.ts
│   ├── comments/
│   │   ├── repositories/    (empty)
│   │   ├── schemas/         (empty)
│   │   └── services/
│   │       └── commentService.ts
│   ├── custom-fields/
│   │   ├── repositories/    (empty)
│   │   ├── schemas/         (empty)
│   │   └── services/
│   │       └── customFieldService.ts
│   ├── feature-flags/
│   │   ├── repositories/    (empty)
│   │   ├── schemas/         (empty)
│   │   └── services/
│   │       └── featureFlagService.ts
│   ├── files/
│   │   ├── repositories/    (empty)
│   │   ├── schemas/         (empty)
│   │   └── services/
│   │       └── fileService.ts
│   ├── notifications/
│   │   ├── repositories/    (empty)
│   │   ├── schemas/         (empty)
│   │   └── services/
│   │       └── notificationService.ts
│   ├── observability/
│   │   └── index.ts
│   ├── search/
│   │   ├── repositories/    (empty)
│   │   ├── schemas/         (empty)
│   │   └── services/
│   │       └── searchService.ts
│   ├── settings/
│   │   ├── repositories/    (empty)
│   │   ├── schemas/         (empty)
│   │   └── services/
│   │       └── settingsService.ts
│   └── tags/
│       ├── repositories/    (empty)
│       ├── schemas/         (empty)
│       └── services/
│           └── tagService.ts
├── shared/
│   ├── components/
│   │   ├── empty-state.tsx
│   │   ├── page-header.tsx
│   │   ├── query-provider.tsx
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   └── ui/              (empty — Phase 1+)
│   ├── guards/
│   │   ├── auth-guard.tsx
│   │   ├── company-guard.tsx
│   │   └── permission-guard.tsx
│   └── layouts/
│       ├── header.tsx
│       ├── mobile-nav.tsx
│       └── sidebar.tsx
└── middleware.ts
```

## Database Migrations (`supabase/`)

```
supabase/
├── seed.sql
└── migrations/
    ├── 001_companies.sql
    ├── 002_profiles.sql
    ├── 003_permissions.sql
    ├── 004_roles.sql
    ├── 005_role_permissions.sql
    ├── 006_user_roles.sql
    ├── 007_feature_flags.sql
    ├── 008_settings.sql
    ├── 009_employees.sql
    ├── 010_projects.sql
    ├── 011_tasks.sql
    ├── 012_comments.sql
    ├── 013_tags.sql
    ├── 014_custom_fields.sql
    ├── 015_activity_logs.sql
    ├── 016_customers.sql
    ├── 017_leads.sql
    ├── 018_sheet_tables.sql
    ├── 019_sheet_rows_cells.sql
    ├── 020_chart_of_accounts.sql
    ├── 021_journal_entries.sql
    ├── 022_invoices.sql
    ├── 023_payments_expenses.sql
    ├── 024_notifications.sql
    ├── 025_jobs.sql
    ├── 026_files.sql
    ├── 027_domain_events.sql
    ├── 028_search_index.sql
    ├── 029_ai_tables.sql
    ├── 030_observability.sql
    ├── 031_rls_policies.sql
    └── 032_indexes.sql
```

## Project Configuration (root)

```
D:\Nexlane Company Software\
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── .env.local.example
├── .gitignore
├── docs/
│   ├── System Architecture.md
│   ├── Database Schema.md
│   ├── API Documentation.md
│   ├── Development Guidelines.md
│   ├── Folder Structure.md
│   ├── Implementation Plan.md
│   ├── Deployment Guide.md
│   ├── Future Roadmap.md
│   └── phase-0/
│       ├── PHASE_0_COMPLETION_REPORT.md
│       ├── DATABASE_ERD.md
│       ├── PERMISSION_CATALOG.md
│       ├── EVENT_CATALOG.md
│       ├── API_CATALOG.md
│       ├── MIGRATION_REPORT.md
│       ├── PROJECT_TREE.md
│       ├── DEPENDENCY_REPORT.md
│       ├── SECURITY_REVIEW.md
│       ├── PERFORMANCE_BASELINE.md
│       ├── ARCHITECTURE_DECISIONS.md
│       ├── TECHNICAL_DEBT.md
│       └── TESTING_REPORT.md
└── (node_modules/, .next/ — generated)
```

## Summary

| Area | Files | Notes |
|------|-------|-------|
| Source files (`.ts`/`.tsx`) | ~55 | All TypeScript |
| Migration files (`.sql`) | 32 | Reversible |
| Seed data (`.sql`) | 1 | |
| Config files | 7 | |
| Documentation | 21 | 8 planning + 13 phase-0 |
| **Total** | **~116** | |
