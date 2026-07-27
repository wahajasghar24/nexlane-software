# Migration Report

**Project:** Nexlane
**Total Migrations:** 33 (+ 1 seed file)
**Execution Order:** Sequential (001 to 033)
**Last Updated:** QG-1

---

*Note: Migrations 001-032 are fully documented in the original version of this file. The entries below cover the QG-1 additions only.*

---

## Migration 033: `033_updated_at_trigger.sql`

| Detail | Value |
|--------|-------|
| **Purpose** | Add auto-updating `updated_at` trigger to all tables with `updated_at` column |
| **Tables Triggered** | companies, profiles, roles, feature_flags, company_feature_flags, system_settings, company_settings, user_settings, employees, projects, tasks, comments, custom_fields, custom_field_values, sheet_tables, chart_of_accounts, journal_entries, invoices, notifications, notification_templates, notification_preferences, jobs, search_index, ai_conversations, company_members, expenses |
| **Function Created** | `update_updated_at_column()` — generic BEFORE UPDATE trigger function |
| **Triggers Created** | 26 triggers applied to individual tables |
| **Indexes** | None |
| **Policies** | None |
| **Down** | `DROP TRIGGER` for all 26 triggers; `DROP FUNCTION update_updated_at_column` |

---

## Changes Applied in QG-1

| File | Change |
|------|--------|
| `031_rls_policies.sql` | Added `pm_select` and `pm_insert` RLS policies for `performance_metrics` table (was missing) |
| `033_updated_at_trigger.sql` | New migration — auto-update `updated_at` on 26 tables |
| `seed.sql` | Added `invoices.list` and `invoices.read` permission codes |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Migrations | 33 |
| Tables created | 42 |
| Inline indexes | 40 |
| Additional indexes (migration 032) | 13 |
| **Total indexes** | **53** |
| RLS policies | 95 (93 original + 2 for performance_metrics) |
| Functions | 5 (create_profile_for_user, is_admin, auth_company_id, increment_job_retry, update_updated_at_column) |
| Triggers | 27 (1 auth users trigger + 26 updated_at triggers) |
| Extensions enabled | 1 (pgcrypto) |
| Seed tables populated | 5 |
| All migrations reversible | Yes (each has `-- DOWN` section) |
