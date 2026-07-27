# Database ERD

**Project:** Nexlane
**Version:** Phase 0 (42 tables)

---

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      CORE / TENANCY                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐     ┌──────────────────────┐               │
│  │    companies      │     │    company_members    │               │
│  │──────────────────│     │──────────────────────│               │
│  │ id (PK)          │──────│ company_id (FK)      │               │
│  │ name             │     │ profile_id (FK)       │               │
│  │ slug (UQ)        │     │ is_default            │               │
│  │ logo_url         │     │ joined_at             │               │
│  │ domain (UQ)      │     │ created_at            │               │
│  │ settings (JSONB)  │     └───────────┬──────────┘               │
│  │ is_active        │                  │                          │
│  │ created_by       │                  │                          │
│  │ updated_by       │                  │                          │
│  │ created_at       │                  │                          │
│  │ updated_at       │    ┌─────────────┴─────────────┐             │
│  │ deleted_at       │    │        profiles           │             │
│  │ deleted_by       │    │───────────────────────────│             │
│  └──────────────────┘    │ id (PK, FK→auth.users)    │             │
│                          │ email                     │             │
│                          │ full_name                 │             │
│                          │ avatar_url                │             │
│                          │ phone                     │             │
│                          │ timezone                  │             │
│                          │ locale                    │             │
│                          │ is_active                 │             │
│                          │ last_sign_in_at           │             │
│                          │ created_at                │             │
│                          │ updated_at                │             │
│                          │ deleted_at                │             │
│                          │ deleted_by (FK→self)     │             │
│                          └──────────────────────────┘             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      RBAC / AUTHORIZATION                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐    │
│  │  permissions  │    │  role_permissions │    │    roles     │    │
│  │──────────────│    │──────────────────│    │──────────────│    │
│  │ id (PK)      │────│ permission_id (FK)│───│ id (PK)      │    │
│  │ code (UQ)    │    │ role_id (FK)     │    │ company_id FK│───┐
│  │ name         │    │ created_at       │    │ name         │   │
│  │ description  │    └──────────────────┘    │ description  │   │
│  │ module       │                            │ is_system    │   │
│  │ created_at   │                            │ created_by   │   │
│  └──────────────┘                            │ updated_by   │   │
│                                              │ created_at   │   │
│  ┌──────────────────┐                        │ updated_at   │   │
│  │   user_roles     │                        │ deleted_at   │   │
│  │──────────────────│                        │ deleted_by   │   │
│  │ user_id (FK)     │                        └──────────────┘   │
│  │ role_id (FK)     │──────────────────────┘                    │
│  │ company_id (FK)──┼────────────────────────────────────────────┘
│  │ assigned_by (FK) │
│  │ created_at       │
│  └────────┬─────────┘
│           │
└───────────┼──────────────────────────────────────────────────────┘
            │
            │  All business tables reference companies and profiles
            ▼

┌──────────────────────────────────────────────────────────────────┐
│                    BUSINESS MODULES                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐    │
│  │  employees    │    │    projects      │    │    tasks     │    │
│  │──────────────│    │──────────────────│    │──────────────│    │
│  │ id (PK)      │    │ id (PK)          │    │ id (PK)      │    │
│  │ company_id FK│    │ company_id FK    │    │ company_id FK│    │
│  │ profile_id FK│    │ name             │    │ title        │    │
│  │ employee_code│    │ description      │    │ description  │    │
│  │ department   │    │ customer_id      │    │ project_id FK│    │
│  │ position     │    │ lead_id          │    │ parent_task  │    │
│  │ hire_date    │    │ status           │    │ assigned_to  │    │
│  │ salary       │    │ priority         │    │ status       │    │
│  │ employment_ty│    │ start_date       │    │ priority     │    │
│  │ manager_id   │    │ end_date         │    │ due_date     │    │
│  │ created_by   │    │ budget           │    │ estimated_hrs│    │
│  │ updated_by   │    │ created_by       │    │ actual_hrs   │    │
│  │ deleted_by   │    │ updated_by       │    │ created_by   │    │
│  │ timestamps*  │    │ deleted_by       │    │ updated_by   │    │
│  └──────┬───────┘    │ timestamps*      │    │ deleted_by   │    │
│         │            └──────┬───────┬────┘    │ timestamps*  │    │
│         │                   │       │         └──────────────┘    │
│  ┌──────┴──────────┐  ┌─────┴───┐ ┌─┴──────────┐               │
│  │ project_members │  │invoices│ │customers  │               │
│  │────────────────│  │─────────│ │───────────│               │
│  │ company_id FK  │  │(see     │ │company_id │               │
│  │ project_id FK  │  │accounting│ │...         │               │
│  │ employee_id FK │  │section) │ │created_by  │               │
│  │ role           │  └─────────┘ │updated_by  │               │
│  │ created_at     │              │deleted_by  │               │
│  └────────────────┘              │timestamps* │               │
│                                  └──────┬─────┘               │
│                                 ┌──────┴───────┐              │
│                                 │    leads     │              │
│                                 │──────────────│              │
│                                 │ company_id   │              │
│                                 │ customer_id  │              │
│                                 │ source       │              │
│                                 │ status       │              │
│                                 │ priority     │              │
│                                 │ assigned_to  │              │
│                                 │ estimated_val│              │
│                                 │ converted_at │              │
│                                 │ created_by   │              │
│                                 │ updated_by   │              │
│                                 │ deleted_by   │              │
│                                 │ timestamps*  │              │
│                                 └──────────────┘              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    SPREADSHEET ENGINE                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐    │
│  │ sheet_tables  │    │  sheet_rows      │    │ sheet_cells  │    │
│  │──────────────│    │──────────────────│    │──────────────│    │
│  │ id (PK)      │────│ sheet_table_id   │    │ row_id       │    │
│  │ company_id   │    │ position         │────│ column_id    │    │
│  │ name (UQ)    │    │ created_by       │    │ value        │    │
│  │ description  │    │ updated_by       │    │ created_at   │    │
│  │ created_by   │    │ deleted_by       │    │ updated_at   │    │
│  │ updated_by   │    │ timestamps*       │    └──────────────┘    │
│  │ deleted_by   │    └──────────────────┘                        │
│  │ timestamps*  │                                                │
│  └──────┬───────┘    ┌──────────────────┐                        │
│         └────────────│  sheet_columns   │                        │
│                      │──────────────────│                        │
│                      │ sheet_table_id   │                        │
│                      │ name             │                        │
│                      │ key              │                        │
│                      │ type             │                        │
│                      │ options (JSONB)  │                        │
│                      │ position         │                        │
│                      │ width            │                        │
│                      │ required         │                        │
│                      │ default_value    │                        │
│                      │ created_at       │                        │
│                      └──────────────────┘                        │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    ACCOUNTING / FINANCE                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐    │
│  │chart_of_accnts│    │ journal_entries   │    │ invoices     │    │
│  │──────────────│    │──────────────────│    │──────────────│    │
│  │ id (PK)      │    │ id (PK)           │    │ id (PK)      │    │
│  │ company_id   │    │ company_id        │    │ company_id   │    │
│  │ code (UQ)    │    │ entry_number (UQ) │    │ invoice_num  │    │
│  │ name         │    │ entry_date        │    │ customer_id  │    │
│  │ type         │    │ description       │    │ project_id   │    │
│  │ parent_id    │    │ reference_type    │    │ status       │    │
│  │ is_active    │    │ reference_id      │    │ issue_date   │    │
│  │ description  │    │ status            │    │ due_date     │    │
│  │ created_by   │    │ created_by        │    │ paid_date    │    │
│  │ updated_by   │    │ updated_by        │    │ subtotal     │    │
│  │ deleted_by   │    │ created_at        │    │ tax_rate     │    │
│  │ timestamps*  │    │ updated_at        │    │ tax_amount   │    │
│  └──────┬───────┘    └────────┬─────────┘    │ total        │    │
│         │                     │              │ notes        │    │
│  ┌──────┴──────────┐  ┌──────┴──────────┐   │ created_by   │    │
│  │journal_entry_lns│  │ invoice_items   │   │ updated_by   │    │
│  │────────────────│  │────────────────-│   │ deleted_by   │    │
│  │ journal_entry  │  │ invoice_id      │   │ timestamps*  │    │
│  │ account_id     │  │ account_id      │   └──────┬───────┘    │
│  │ debit          │  │ description     │          │             │
│  │ credit         │  │ quantity        │  ┌───────┴────────┐   │
│  │ description    │  │ unit_price      │  │ payments       │   │
│  │ created_at     │  │ total           │  │───────────────│   │
│  └────────────────┘  └─────────────────┘  │ invoice_id    │   │
│                                           │ amount        │   │
│  ┌──────────────────────────────────┐      │ currency      │   │
│  │ expenses                         │      │ payment_method│   │
│  │─────────────────────────────────│      │ reference     │   │
│  │ id / company_id / account_id    │      │ payment_date  │   │
│  │ project_id / amount / currency  │      │ status        │   │
│  │ description / vendor / receipt   │      │ created_by    │   │
│  │ incurred_date / approved_by     │      │ created_at    │   │
│  │ created_by / updated_by / del_by│      └───────────────┘   │
│  │ timestamps*                     │                           │
│  └─────────────────────────────────┘                           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    POLYMORPHIC / CROSS-CUTTING                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Polymorphic via (entity_type, entity_id) pairs:                 │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐    │
│  │   comments    │   │  taggables   │   │  custom_field_   │    │
│  │──────────────│   │──────────────│   │      values       │    │
│  │ id (PK)      │   │ id (PK)      │   │──────────────────│    │
│  │ company_id   │   │ tag_id       │   │ id (PK)          │    │
│  │ entity_type  │   │ taggable_type│   │ company_id       │    │
│  │ entity_id    │   │ taggable_id  │   │ custom_field_id  │    │
│  │ author_id    │   │ created_at   │   │ entity_id        │    │
│  │ content      │   └──────────────┘   │ value            │    │
│  │ parent_id    │   ┌──────────────┐   │ created_at       │    │
│  │ created_at   │   │  files       │   │ updated_at       │    │
│  │ updated_at   │   │──────────────│   └──────────────────┘    │
│  │ deleted_at   │   │ id (PK)      │                          │
│  │ deleted_by   │   │ company_id   │  ┌──────────────────┐    │
│  └──────────────┘   │ entity_type  │  │ activity_logs    │    │
│                     │ entity_id    │  │──────────────────│    │
│  ┌──────────────┐   │ name         │  │ id (PK)          │    │
│  │  tags        │   │ original_name│  │ company_id       │    │
│  │──────────────│   │ mime_type    │  │ actor_id         │    │
│  │ id (PK)      │   │ size_bytes   │  │ entity_type      │    │
│  │ company_id   │   │ storage_path │  │ entity_id        │    │
│  │ name         │   │ bucket       │  │ action           │    │
│  │ color        │───│ uploaded_by  │  │ previous_data    │    │
│  │ created_at   │   │ created_at   │  │ new_data         │    │
│  └──────────────┘   │ deleted_at   │  │ ip_address       │    │
│                     │ deleted_by   │  │ user_agent       │    │
│                     └──────────────┘  │ created_at       │    │
│                                       └──────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ custom_fields                                           │   │
│  │──────────────────────────-────────────────────────────-│   │
│  │ id (PK) / company_id / entity_type / code (UQ) / name  │   │
│  │ type / options (JSONB) / required / default_value      │   │
│  │ position / is_active / created_by / updated_by         │   │
│  │ created_at / updated_at                                │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE / SYSTEM                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐ │
│  │feature_flags  │   │  settings (×3)   │   │ notifications    │ │
│  │──────────────│   │──────────────────│   │──────────────────│ │
│  │ id / code /  │   │ system/company/  │   │ id / company_id  │ │
│  │ name / desc  │   │ user settings    │   │ user_id / type   │ │
│  │ module       │   │ each: key/value  │   │ title / body     │ │
│  │ is_enabled   │   │ (JSONB)/category │   │ link / channel   │ │
│  │ is_premium   │   │ timestamps       │   │ is_read / read_at│ │
│  │ timestamps   │   └──────────────────┘   │ metadata (JSONB)│ │
│  └──────────────┘                          │ created_at       │ │
│  ┌──────────────┐                          └──────────────────┘ │
│  │company_ff    │                          ┌──────────────────┐ │
│  │──────────────│                          │notification_tmpls│ │
│  │ company_id   │                          │──────────────────│ │
│  │ flag_id      │                          │ id / company_id  │ │
│  │ is_enabled   │                          │ code / name      │ │
│  │ timestamps   │                          │ channels (JSONB) │ │
│  └──────────────┘                          │ subject / body   │ │
│                                             │ variables (JSONB)│ │
│  ┌──────────────┐   ┌──────────────────┐   │ is_active        │ │
│  │ domain_events │   │   search_index   │   │ timestamps       │ │
│  │──────────────│   │──────────────────│   └──────────────────┘ │
│  │ id           │   │ id               │   ┌──────────────────┐ │
│  │ company_id   │   │ company_id       │   │notif_preferences │ │
│  │ event_type   │   │ entity_type      │   │──────────────────│ │
│  │ entity_type  │   │ entity_id        │   │ user_id          │ │
│  │ entity_id    │   │ title            │   │ company_id       │ │
│  │ payload(JSONB)│  │ content (TSVEC)  │   │ type             │ │
│  │ status       │   │ metadata (JSONB) │   │ channels (JSONB) │ │
│  │ created_at   │   │ timestamps       │   │ is_enabled       │ │
│  │ processed_at │   └──────────────────┘   │ timestamps       │ │
│  └──────────────┘                          └──────────────────┘ │
│                                                                   │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐ │
│  │    jobs      │   │    job_logs      │   │  observability   │ │
│  │──────────────│   │──────────────────│   │  (4 tables)      │ │
│  │ id           │───│ job_id           │   │ app_logs         │ │
│  │ company_id   │   │ level / message  │   │ error_logs       │ │
│  │ type         │   │ metadata (JSONB) │   │ perf_metrics     │ │
│  │ queue        │   │ created_at       │   │ api_metrics      │ │
│  │ payload(JSONB)│  └──────────────────┘   └──────────────────┘ │
│  │ status       │                                               │
│  │ priority     │   ┌──────────────────┐                        │
│  │ scheduled_at │   │  AI tables (×4)  │                        │
│  │ started_at   │   │──────────────────│                        │
│  │ completed_at │   │ ai_conversations │                        │
│  │ retry_count  │   │ ai_prompts       │                        │
│  │ max_retries  │   │ ai_actions       │                        │
│  │ error        │   │ ai_logs          │                        │
│  │ created_by   │   └──────────────────┘                        │
│  │ timestamps   │                                               │
│  └──────────────┘                                               │
└──────────────────────────────────────────────────────────────────┘

  *timestamps = created_at, updated_at, deleted_at, deleted_by
   (applied to every business table)
```

---

## Relationship Explanations

### Core Tenancy
| Relationship | Type | Description |
|---|---|---|
| companies → company_members | 1:N | A company can have many members |
| profiles → company_members | 1:N | A user can belong to many companies |
| profiles → auth.users | 1:1 | Each auth user has exactly one profile (auto-created via trigger) |

### RBAC
| Relationship | Type | Description |
|---|---|---|
| companies → roles | 1:N | Roles are scoped to a company |
| roles → role_permissions | 1:N | A role can have many permission assignments |
| permissions → role_permissions | 1:N | A permission can be assigned to many roles |
| profiles → user_roles | 1:N | A user can have many role assignments |
| roles → user_roles | 1:N | A role can be assigned to many users |
| companies → user_roles | 1:N | User-role assignments are scoped to a company |

### Business Modules
| Relationship | Type | Description |
|---|---|---|
| employees → profiles | 1:1 | Each employee maps to exactly one user profile |
| employees → employees (self) | 1:N | Manager reporting hierarchy |
| projects → employees | 1:N | Project lead (lead_id) |
| projects → project_members | 1:N | Projects can have many member assignments |
| employees → project_members | 1:N | Employees can be members of many projects |
| tasks → projects | N:1 | Tasks optionally belong to a project |
| tasks → employees | N:1 | Tasks optionally assigned to an employee |
| tasks → tasks (self) | 1:N | Parent-child subtask hierarchy |
| customers → invoices | 1:N | Customers can have many invoices |
| customers → leads | 1:N | Customers can have many leads |
| employees → leads | N:1 | Leads assigned to employees |

### Accounting
| Relationship | Type | Description |
|---|---|---|
| chart_of_accounts → chart_of_accounts (self) | 1:N | Account hierarchy (parent-child) |
| chart_of_accounts → journal_entry_lines | 1:N | Accounts referenced in journal lines |
| journal_entries → journal_entry_lines | 1:N | Each journal entry has 2+ lines (debit/credit) |
| chart_of_accounts → invoice_items | 1:N | Invoice items reference revenue accounts |
| chart_of_accounts → expenses | 1:N | Expenses reference expense accounts |
| invoices → invoice_items | 1:N | Invoices have many line items |
| invoices → payments | 1:N | Invoices can have many payments |

### Spreadsheet Engine
| Relationship | Type | Description |
|---|---|---|
| sheet_tables → sheet_columns | 1:N | Tables define their column schema |
| sheet_tables → sheet_rows | 1:N | Tables contain many rows |
| sheet_rows → sheet_cells | 1:N | Rows contain cell values |
| sheet_columns → sheet_cells | 1:N | Columns contain cell values |

### Polymorphic Systems
| Relationship | Type | Description |
|---|---|---|
| tags → taggables | 1:N | Tags can be applied to many entities (polymorphic) |
| custom_fields → custom_field_values | 1:N | Custom fields store values per entity |
| Various → comments | N:1 | Comments attach to any entity type |
| Various → files | N:1 | Files attach to any entity type |
| Various → activity_logs | N:1 | Activity logs track all entity changes |

### Notifications
| Relationship | Type | Description |
|---|---|---|
| notification_templates → companies | N:1 | Templates scoped to company |
| notifications → profiles | N:1 | Notifications delivered to users |
| notification_preferences → profiles | N:1 | Preferences per user per company |

---

## Multi-Company Strategy

1. **Row-Level Isolation:** Every business table includes `company_id UUID REFERENCES companies(id) ON DELETE CASCADE` as a non-nullable column.

2. **Authentication Flow:** On login, the system identifies the user's default company via `company_members.is_default`. The `UserContext.companyId` extracted during `authenticate()` is passed to all subsequent queries and writes.

3. **Company Switching:** Users can switch companies via `POST /api/auth/switch-company`, which updates their `is_default` flag in `company_members`.

4. **Role Scoping:** Roles are created per-company (`roles.company_id`), ensuring each company has independent role definitions.

5. **Feature Flags:** `company_feature_flags` allows per-company overrides of global feature flags.

6. **Settings Hierarchy:** Settings cascade from `system_settings` → `company_settings` → `user_settings`, allowing appropriate defaults per company.

7. **Data Segregation Enforced At Three Levels:**
   - **Application layer:** `authenticate()` ensures `companyId` is set; `authorize()` checks RBAC within the company scope
   - **Database layer:** All queries filter by `company_id` via RLS policies
   - **Storage layer:** File uploads scoped to `{bucket}/{company_id}/{path}`

---

## RLS Strategy

### Helper Functions
Two helper functions power the RLS system:

1. **`auth_company_id()`** — Extracts company ID from JWT claim or fallback setting. Used in SELECT/INSERT/UPDATE policies to filter by company scope.

2. **`is_admin(user_id UUID, company_id UUID)`** — Checks if the user has a role named 'Owner' or 'Admin' in the given company. Used for administrative operations (delete, manage settings, etc.).

### Policy Patterns
All 102 policies follow four consistent patterns:

| Pattern | SQL Condition | Used For |
|---------|---------------|----------|
| **User-level access** | `user_id = auth.uid()` | Personal data: notifications, user_settings, ai prompts/conversations |
| **Company-member access** | `company_id = auth_company_id()` | Business data: most read/insert/update operations |
| **Admin-only** | `is_admin(auth.uid(), company_id)` | Destructive or sensitive operations: delete, manage settings, view system data |
| **Public** | `true` | Reference data: permissions, roles, profiles, tags |

### Policy Distribution by Table Type
| Policy Pattern | Approximate Count |
|---|---|
| Company-member SELECT | ~25 |
| Company-member INSERT/UPDATE | ~30 |
| Admin-only (delete/manage) | ~20 |
| User-level (self only) | ~15 |
| Public read | ~8 |
| Public insert | ~4 |

### Security Characteristics
- Users cannot see data from companies they don't belong to
- Only admins can delete data or modify system configurations
- Users can only see their own notifications, preferences, and AI conversations
- Activity logs and observability data are admin-only
- Permissions, roles, and profiles are publicly readable (reference data)
- The `performance_metrics` table has no RLS (omitted, flagged for Phase 1)
