# Nexlane — Folder Structure

```
D:\NEXLANE COMPANY SOFTWARE\
│
├── docs/
├── public/
├── scripts/                         # DB migration runner, seed scripts
│
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Login, Signup, Forgot Password
│   │   ├── (dashboard)/             # Main app pages
│   │   │   ├── layout.tsx          # Sidebar + Header
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   ├── employees/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── activity/
│   │   │   ├── crm/
│   │   │   ├── spreadsheets/
│   │   │   ├── accounting/
│   │   │   ├── reports/
│   │   │   ├── notifications/
│   │   │   ├── files/
│   │   │   ├── settings/
│   │   │   └── admin/              # Flags, Jobs, Observability
│   │   │       ├── feature-flags/
│   │   │       ├── jobs/
│   │   │       ├── logs/
│   │   │       └── events/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── rbac/
│   │   │   ├── feature-flags/
│   │   │   ├── settings/
│   │   │   │   ├── system/
│   │   │   │   ├── company/
│   │   │   │   └── user/
│   │   │   ├── employees/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── comments/
│   │   │   ├── tags/
│   │   │   ├── custom-fields/
│   │   │   ├── activity/
│   │   │   ├── crm/
│   │   │   ├── spreadsheets/
│   │   │   ├── accounting/
│   │   │   ├── notifications/
│   │   │   ├── jobs/
│   │   │   ├── files/
│   │   │   ├── search/
│   │   │   ├── observability/
│   │   │   ├── events/
│   │   │   ├── ai/
│   │   │   └── webhooks/n8n/
│   │   │
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── core/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── admin.ts
│   │   ├── auth/
│   │   │   ├── authenticate.ts
│   │   │   ├── authorize.ts
│   │   │   └── permissions.ts
│   │   ├── events/
│   │   │   ├── event-bus.ts
│   │   │   ├── event-repository.ts
│   │   │   ├── types.ts
│   │   │   └── handlers/
│   │   │       ├── activity-handler.ts
│   │   │       ├── notification-handler.ts
│   │   │       └── webhook-handler.ts
│   │   ├── jobs/
│   │   │   ├── job-queue.ts
│   │   │   ├── job-repository.ts
│   │   │   └── types.ts
│   │   ├── errors/
│   │   ├── api/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── shared/
│   │   ├── components/ui/          # shadcn/ui
│   │   ├── components/
│   │   ├── guards/
│   │   └── layouts/
│   │
│   ├── infrastructure/             # Cross-cutting (no feature deps)
│   │   ├── feature-flags/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── schemas/
│   │   ├── settings/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── schemas/
│   │   ├── activity/
│   │   │   ├── services/
│   │   │   └── repositories/
│   │   ├── notifications/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── schemas/
│   │   ├── comments/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── schemas/
│   │   ├── tags/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── schemas/
│   │   ├── custom-fields/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── schemas/
│   │   ├── files/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── schemas/
│   │   └── search/
│   │       ├── services/
│   │       ├── repositories/
│   │       └── schemas/
│   │
│   ├── features/                   # Business modules
│   │   ├── auth/
│   │   ├── rbac/
│   │   ├── employees/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── crm/
│   │   ├── spreadsheets/
│   │   ├── accounting/
│   │   ├── reports/
│   │   ├── ai/
│   │   └── settings-ui/
│   │
│   └── middleware.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_companies.sql
│   │   ├── 002_profiles.sql
│   │   ├── 003_permissions.sql
│   │   ├── 004_roles.sql
│   │   ├── 005_role_permissions.sql
│   │   ├── 006_user_roles.sql
│   │   ├── 007_feature_flags.sql           # New
│   │   ├── 008_company_feature_flags.sql   # New
│   │   ├── 009_system_settings.sql         # New (was generic settings)
│   │   ├── 010_company_settings.sql        # New
│   │   ├── 011_user_settings.sql           # New
│   │   ├── 012_employees.sql
│   │   ├── 013_projects.sql
│   │   ├── 014_tasks.sql
│   │   ├── 015_comments.sql                # New (universal, replaces task_comments)
│   │   ├── 016_tags.sql                    # New
│   │   ├── 017_taggables.sql              # New
│   │   ├── 018_custom_fields.sql          # New
│   │   ├── 019_custom_field_values.sql    # New
│   │   ├── 020_activity_logs.sql
│   │   ├── 021_customers.sql
│   │   ├── 022_leads.sql
│   │   ├── 023_sheet_tables.sql
│   │   ├── 024_sheet_columns.sql
│   │   ├── 025_sheet_rows.sql
│   │   ├── 026_sheet_cells.sql
│   │   ├── 027_chart_of_accounts.sql
│   │   ├── 028_journal_entries.sql
│   │   ├── 029_journal_entry_lines.sql
│   │   ├── 030_invoices.sql
│   │   ├── 031_invoice_items.sql
│   │   ├── 032_payments.sql
│   │   ├── 033_expenses.sql
│   │   ├── 034_notifications.sql
│   │   ├── 035_notification_templates.sql  # New
│   │   ├── 036_notification_preferences.sql# New
│   │   ├── 037_jobs.sql                   # New
│   │   ├── 038_job_logs.sql               # New
│   │   ├── 039_files.sql
│   │   ├── 040_domain_events.sql
│   │   ├── 041_search_index.sql           # New
│   │   ├── 042_ai_tables.sql
│   │   ├── 043_app_logs.sql               # New
│   │   ├── 044_error_logs.sql             # New
│   │   ├── 045_performance_metrics.sql    # New
│   │   ├── 046_api_metrics.sql            # New
│   │   ├── 047_rls_policies.sql
│   │   └── 048_indexes.sql
│   ├── seed.sql
│   └── config.toml
│
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

## Module Count

| Layer | Modules |
|-------|---------|
| **Infrastructure** (10) | feature-flags, settings, activity, notifications, comments, tags, custom-fields, files, search, observability |
| **Core** (6) | supabase, auth, events, jobs, errors, api |
| **Features** (11) | auth-ui, rbac, employees, projects, tasks, crm, spreadsheets, accounting, reports, ai, settings-ui |
| **Total** | **27 modules** |
