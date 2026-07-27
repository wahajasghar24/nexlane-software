# Nexlane — Future Roadmap

## Architectural Foundations (Completed in Phase 0)

- [x] Multi-company architecture (47 tables, all company-scoped)
- [x] Dynamic RBAC (permissions, roles, role_permissions, user_roles)
- [x] Feature flags (feature_flags + company_feature_flags)
- [x] 3-tier settings (system, company, user)
- [x] Universal audit trail (activity_logs with before/after snapshots)
- [x] Internal spreadsheet engine (sheet_tables, columns, rows, cells)
- [x] Double-entry accounting (chart_of_accounts, journal_entries, journal_entry_lines)
- [x] Notification framework (notifications, templates, preferences — multi-channel)
- [x] Background jobs (jobs + job_logs with retry and scheduling)
- [x] Universal tag system (tags + taggables)
- [x] Generic comments (comments with entity_type/entity_id)
- [x] Custom fields (custom_fields + custom_field_values — EAV pattern)
- [x] Generic file management (files with polymorphic attachment)
- [x] Search foundation (search_index with full-text search)
- [x] Observability (app_logs, error_logs, performance_metrics, api_metrics)
- [x] AI-ready schema (conversations, prompts, actions, logs)
- [x] Event-driven foundation (domain_events table + event bus)
- [x] n8n webhook foundation
- [x] Soft delete strategy (deleted_at + deleted_by on all business tables)

## Phase 1: Employee Management (Weeks 3-4)
Employee CRUD, profile integration, manager hierarchy, file attachments

## Phase 2: Project Management (Weeks 5-6)
Project CRUD, members, status workflow, budget tracking

## Phase 3: Task Management (Weeks 7-8)
Task CRUD, Kanban board, subtasks, comments, time tracking

## Phase 4: CRM (Weeks 9-10)
Leads pipeline, customer management, lead-to-customer conversion

## Phase 5: Spreadsheet Engine UI (Week 11)
Editable grid, column config, CSV export

## Phase 6: Accounting UI (Weeks 12-13)
Chart of accounts, invoices, expenses, payments, financial reports

## Phase 7: Notifications + Files + Search (Week 14)
Notification dropdown, file upload, global search

## Phase 8: Admin UI (Week 15)
Feature flags UI, RBAC management UI, settings UI, job monitoring

## Phase 9: Testing + Deploy (Week 16)
Unit tests, E2E, performance audit, production deploy

---

## Future Enhancements

### Q2 2027 — Intelligence & Automation
- AI Assistant (GPT chat, natural language queries)
- AI Lead Scoring
- Email notifications via Resend/SendGrid
- Advanced n8n workflow templates

### Q3 2027 — Calendar & Time
- Google/Outlook calendar sync
- Advanced time tracking with timer
- Resource planning

### Q4 2027 — Multi-Tenant SaaS
- Self-service signup
- Stripe billing integration
- Feature flag → billing plan gating
- White-label branding

### 2028+ — Enterprise
- SAML/SSO
- Public API with API keys
- Mobile app (React Native)
- i18n multi-language
