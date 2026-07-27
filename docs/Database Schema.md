# Nexlane — Database Schema

## 1. Conventions

- All tables use **UUID v7** primary keys (`id`).
- All business tables include `company_id` (UUID, NOT NULL, FK → companies(id)) for multi-tenant readiness.
- All business tables include `created_by` (UUID, FK → profiles(id)).
- All business tables include `updated_by` (UUID, FK → profiles(id), nullable).
- All tables include `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()).
- All business tables include `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()).
- Soft-delete tables include `deleted_at` AND `deleted_by` (TIMESTAMPTZ + UUID).
- Foreign keys are indexed.
- Row Level Security (RLS) is enabled on all tables — enforced by `company_id`.
- All RLS policies check `company_id` first for scope isolation.
- Column naming: `snake_case`.
- Every migration is reversible (has `up` and `down`).
- No hardcoded values — everything configurable via database.

## 2. Conventions per Table Category

| Column | Business Tables | Child/Join Tables | System Tables |
|--------|----------------|-------------------|---------------|
| `id` | UUID PK | UUID PK | UUID PK |
| `company_id` | ✅ Required | ✅ Required (or inherited) | ❌ |
| `created_by` | ✅ Required | Optional | ❌ |
| `updated_by` | ✅ Required | Optional | ❌ |
| `created_at` | ✅ Required | ✅ Required | ✅ Required |
| `updated_at` | ✅ Required | Optional | ✅ Required |
| `deleted_at` | ✅ Required | Optional | ❌ |
| `deleted_by` | ✅ Required | Optional | ❌ |

## 3. Companies (Multi-Tenant Root)

### `companies`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| logo_url | TEXT | |
| domain | VARCHAR(255) | UNIQUE, nullable |
| settings | JSONB | DEFAULT '{}' |
| is_active | BOOLEAN | DEFAULT true |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

### `company_members`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| profile_id | UUID | FK → profiles(id) ON DELETE CASCADE |
| is_default | BOOLEAN | DEFAULT false |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() |
| created_at | TIMESTAMPTZ | |

UNIQUE(company_id, profile_id)

## 4. Dynamic RBAC

### `permissions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| code | VARCHAR(100) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| module | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

### `roles`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| name | VARCHAR(100) | NOT NULL |
| description | TEXT | |
| is_system | BOOLEAN | DEFAULT false |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

UNIQUE(company_id, name)

### `role_permissions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| role_id | UUID | FK → roles(id) ON DELETE CASCADE |
| permission_id | UUID | FK → permissions(id) ON DELETE CASCADE |
| created_at | TIMESTAMPTZ | NOT NULL |

UNIQUE(role_id, permission_id)

### `user_roles`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → profiles(id) ON DELETE CASCADE |
| role_id | UUID | FK → roles(id) ON DELETE RESTRICT |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| assigned_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | NOT NULL |

UNIQUE(user_id, role_id, company_id)

## 5. Authentication & Profiles

### `profiles`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, REFERENCES auth.users(id) ON DELETE CASCADE |
| email | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| avatar_url | TEXT | |
| phone | VARCHAR(50) | |
| timezone | VARCHAR(50) | DEFAULT 'UTC' |
| locale | VARCHAR(10) | DEFAULT 'en' |
| is_active | BOOLEAN | DEFAULT true |
| last_sign_in_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

## 6. Feature Flags

### `feature_flags`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| code | VARCHAR(100) | UNIQUE, NOT NULL — e.g. 'module.accounting', 'beta.ai' |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| module | VARCHAR(100) | |
| is_enabled | BOOLEAN | DEFAULT true — global default |
| is_premium | BOOLEAN | DEFAULT false — requires paid plan |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `company_feature_flags`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| feature_flag_id | UUID | FK → feature_flags(id) ON DELETE CASCADE |
| is_enabled | BOOLEAN | NOT NULL — overrides global default |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(company_id, feature_flag_id)

## 7. Settings (3-Tier)

### `system_settings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| key | VARCHAR(255) | NOT NULL |
| value | JSONB | NOT NULL |
| category | VARCHAR(100) | — 'general', 'auth', 'billing', 'email' |
| environment | VARCHAR(50) | nullable — 'development', 'staging', 'production' |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(key, environment)

### `company_settings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| key | VARCHAR(255) | NOT NULL |
| value | JSONB | NOT NULL |
| category | VARCHAR(100) | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(company_id, key)

### `user_settings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → profiles(id) ON DELETE CASCADE |
| key | VARCHAR(255) | NOT NULL |
| value | JSONB | NOT NULL |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(user_id, key)

## 8. Employee Management

### `employees`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| profile_id | UUID | UNIQUE, FK → profiles(id) ON DELETE CASCADE |
| employee_code | VARCHAR(50) | NOT NULL |
| department | VARCHAR(100) | |
| position | VARCHAR(100) | |
| hire_date | DATE | |
| salary | DECIMAL(12,2) | |
| employment_type | VARCHAR(50) | |
| manager_id | UUID | FK → employees(id), nullable |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

UNIQUE(company_id, employee_code)

## 9. Project Management

### `projects`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| customer_id | UUID | FK → customers(id) |
| lead_id | UUID | FK → employees(id) |
| status | VARCHAR(50) | DEFAULT 'planning' |
| priority | VARCHAR(20) | DEFAULT 'medium' |
| start_date | DATE | |
| end_date | DATE | |
| budget | DECIMAL(14,2) | |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

### `project_members`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| project_id | UUID | FK → projects(id) ON DELETE CASCADE |
| employee_id | UUID | FK → employees(id) ON DELETE CASCADE |
| role | VARCHAR(50) | |
| created_at | TIMESTAMPTZ | |

UNIQUE(project_id, employee_id)

## 10. Task Management

### `tasks`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| project_id | UUID | FK → projects(id) ON DELETE SET NULL |
| parent_task_id | UUID | FK → tasks(id) |
| assigned_to | UUID | FK → employees(id) |
| status | VARCHAR(50) | DEFAULT 'todo' |
| priority | VARCHAR(20) | DEFAULT 'medium' |
| due_date | TIMESTAMPTZ | |
| estimated_hours | DECIMAL(6,2) | |
| actual_hours | DECIMAL(6,2) | |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

## 11. Universal Comments System

### `comments`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | UUID | NOT NULL |
| author_id | UUID | FK → profiles(id) |
| content | TEXT | NOT NULL |
| parent_id | UUID | FK → comments(id) — threaded replies |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

Indexes: (company_id, entity_type, entity_id), (company_id, parent_id)

## 12. Universal Tag System

### `tags`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| name | VARCHAR(100) | NOT NULL |
| color | VARCHAR(7) | DEFAULT '#6366f1' |
| created_at | TIMESTAMPTZ | |

UNIQUE(company_id, name)

### `taggables`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| tag_id | UUID | FK → tags(id) ON DELETE CASCADE |
| taggable_type | VARCHAR(100) | NOT NULL |
| taggable_id | UUID | NOT NULL |
| created_at | TIMESTAMPTZ | |

UNIQUE(tag_id, taggable_type, taggable_id)
Index: (taggable_type, taggable_id)

## 13. Custom Fields System

### `custom_fields`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| entity_type | VARCHAR(100) | NOT NULL — 'lead', 'project', 'task', 'customer' |
| code | VARCHAR(100) | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| type | VARCHAR(50) | NOT NULL — 'text', 'number', 'date', 'boolean', 'select', 'multiselect' |
| options | JSONB | — for select types: [{label, value}] |
| required | BOOLEAN | DEFAULT false |
| default_value | TEXT | |
| position | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(company_id, entity_type, code)

### `custom_field_values`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| custom_field_id | UUID | FK → custom_fields(id) ON DELETE CASCADE |
| entity_id | UUID | NOT NULL |
| value | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(custom_field_id, entity_id)

## 14. Universal Audit Trail

### `activity_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| actor_id | UUID | FK → profiles(id) |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | UUID | NOT NULL |
| action | VARCHAR(50) | NOT NULL |
| previous_data | JSONB | |
| new_data | JSONB | |
| ip_address | INET | |
| user_agent | TEXT | |
| created_at | TIMESTAMPTZ | NOT NULL |

Indexes: (company_id, entity_type, entity_id), (company_id, actor_id), (company_id, created_at DESC)

## 15. CRM

### `customers`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| company_name | VARCHAR(255) | |
| contact_name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | |
| phone | VARCHAR(50) | |
| website | VARCHAR(255) | |
| address | JSONB | |
| industry | VARCHAR(100) | |
| notes | TEXT | |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

### `leads`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| customer_id | UUID | FK → customers(id) |
| source | VARCHAR(100) | |
| status | VARCHAR(50) | DEFAULT 'new' |
| priority | VARCHAR(20) | DEFAULT 'medium' |
| assigned_to | UUID | FK → employees(id) |
| estimated_value | DECIMAL(12,2) | |
| notes | TEXT | |
| converted_at | TIMESTAMPTZ | |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

## 16. Internal Spreadsheet Engine

### `sheet_tables`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

UNIQUE(company_id, name)

### `sheet_columns`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| sheet_table_id | UUID | FK → sheet_tables(id) ON DELETE CASCADE |
| name | VARCHAR(255) | NOT NULL |
| key | VARCHAR(100) | NOT NULL |
| type | VARCHAR(50) | NOT NULL |
| options | JSONB | |
| position | INTEGER | NOT NULL |
| width | INTEGER | DEFAULT 200 |
| required | BOOLEAN | DEFAULT false |
| default_value | TEXT | |
| created_at | TIMESTAMPTZ | |

UNIQUE(sheet_table_id, key)

### `sheet_rows`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| sheet_table_id | UUID | FK → sheet_tables(id) ON DELETE CASCADE |
| position | INTEGER | |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

### `sheet_cells`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| sheet_row_id | UUID | FK → sheet_rows(id) ON DELETE CASCADE |
| sheet_column_id | UUID | FK → sheet_columns(id) ON DELETE CASCADE |
| value | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(sheet_row_id, sheet_column_id)

## 17. Accounting (Double-Entry Bookkeeping)

### `chart_of_accounts`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| code | VARCHAR(20) | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| type | VARCHAR(50) | NOT NULL |
| parent_id | UUID | FK → chart_of_accounts(id), nullable |
| is_active | BOOLEAN | DEFAULT true |
| description | TEXT | |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

UNIQUE(company_id, code)

### `journal_entries`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| entry_number | VARCHAR(50) | NOT NULL |
| entry_date | DATE | NOT NULL |
| description | TEXT | |
| reference_type | VARCHAR(50) | |
| reference_id | UUID | |
| status | VARCHAR(20) | DEFAULT 'posted' |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(company_id, entry_number)

### `journal_entry_lines`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| journal_entry_id | UUID | FK → journal_entries(id) ON DELETE CASCADE |
| account_id | UUID | FK → chart_of_accounts(id) |
| debit | DECIMAL(14,2) | DEFAULT 0 |
| credit | DECIMAL(14,2) | DEFAULT 0 |
| description | TEXT | |
| created_at | TIMESTAMPTZ | |

Check: (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)

### `invoices`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| invoice_number | VARCHAR(50) | NOT NULL |
| customer_id | UUID | FK → customers(id) |
| project_id | UUID | FK → projects(id) |
| status | VARCHAR(50) | DEFAULT 'draft' |
| issue_date | DATE | NOT NULL |
| due_date | DATE | NOT NULL |
| paid_date | DATE | |
| subtotal | DECIMAL(14,2) | NOT NULL |
| tax_rate | DECIMAL(5,2) | DEFAULT 0 |
| tax_amount | DECIMAL(14,2) | DEFAULT 0 |
| total | DECIMAL(14,2) | NOT NULL |
| notes | TEXT | |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

UNIQUE(company_id, invoice_number)

### `invoice_items`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| invoice_id | UUID | FK → invoices(id) ON DELETE CASCADE |
| account_id | UUID | FK → chart_of_accounts(id) |
| description | TEXT | NOT NULL |
| quantity | DECIMAL(10,2) | DEFAULT 1 |
| unit_price | DECIMAL(14,2) | NOT NULL |
| total | DECIMAL(14,2) | NOT NULL |
| created_at | TIMESTAMPTZ | |

### `payments`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| invoice_id | UUID | FK → invoices(id) |
| amount | DECIMAL(14,2) | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'USD' |
| payment_method | VARCHAR(50) | |
| reference | VARCHAR(255) | |
| payment_date | DATE | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'completed' |
| created_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |

### `expenses`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| account_id | UUID | FK → chart_of_accounts(id) |
| project_id | UUID | FK → projects(id) |
| amount | DECIMAL(14,2) | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'USD' |
| description | TEXT | |
| vendor | VARCHAR(255) | |
| receipt_url | TEXT | |
| incurred_date | DATE | NOT NULL |
| approved_by | UUID | FK → profiles(id) |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

## 18. Notification Framework

### `notifications`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| user_id | UUID | FK → profiles(id) ON DELETE CASCADE |
| type | VARCHAR(50) | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | |
| link | TEXT | |
| channel | VARCHAR(50) | DEFAULT 'in_app' — 'in_app', 'email', 'sms', 'whatsapp', 'push' |
| is_read | BOOLEAN | DEFAULT false |
| read_at | TIMESTAMPTZ | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |

### `notification_templates`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| code | VARCHAR(100) | NOT NULL — 'task.assigned', 'invoice.overdue' |
| name | VARCHAR(255) | NOT NULL |
| channels | JSONB | NOT NULL — which channels are supported for this template |
| subject | VARCHAR(255) | — for email/push |
| body | TEXT | NOT NULL — template with {{variables}} |
| variables | JSONB | — list of available variables with descriptions |
| is_active | BOOLEAN | DEFAULT true |
| created_by | UUID | FK → profiles(id) |
| updated_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(company_id, code)

### `notification_preferences`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → profiles(id) ON DELETE CASCADE |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| type | VARCHAR(100) | NOT NULL — event type code |
| channels | JSONB | NOT NULL — {"in_app": true, "email": false, "sms": false} |
| is_enabled | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

UNIQUE(user_id, company_id, type)

## 19. Background Jobs

### `jobs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| type | VARCHAR(100) | NOT NULL — 'send_email', 'generate_report', 'n8n_webhook' |
| queue | VARCHAR(50) | DEFAULT 'default' |
| payload | JSONB | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'pending' — 'pending', 'processing', 'completed', 'failed', 'cancelled' |
| priority | INTEGER | DEFAULT 0 |
| scheduled_at | TIMESTAMPTZ | |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| retry_count | INTEGER | DEFAULT 0 |
| max_retries | INTEGER | DEFAULT 3 |
| error | TEXT | |
| created_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

Indexes: (company_id, status), (company_id, queue, status), (scheduled_at)

### `job_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| job_id | UUID | FK → jobs(id) ON DELETE CASCADE |
| level | VARCHAR(20) | DEFAULT 'info' — 'debug', 'info', 'warn', 'error' |
| message | TEXT | NOT NULL |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |

Index: (job_id), (created_at)

## 20. Event-Driven Foundation

### `domain_events`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| event_type | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | UUID | NOT NULL |
| payload | JSONB | NOT NULL |
| status | VARCHAR(20) | DEFAULT 'pending' |
| created_at | TIMESTAMPTZ | NOT NULL |
| processed_at | TIMESTAMPTZ | |

Indexes: (company_id, status), (company_id, event_type, created_at DESC)

## 21. File Management (Generic)

### `files`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| name | VARCHAR(255) | NOT NULL |
| original_name | VARCHAR(255) | NOT NULL |
| mime_type | VARCHAR(127) | |
| size_bytes | BIGINT | |
| storage_path | TEXT | NOT NULL |
| bucket | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(100) | — polymorphic attachment |
| entity_id | UUID | |
| uploaded_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| deleted_by | UUID | FK → profiles(id) |

## 22. AI Ready Foundation

### `ai_conversations`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| user_id | UUID | FK → profiles(id) |
| title | VARCHAR(255) | |
| messages | JSONB | DEFAULT '[]' |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `ai_prompts`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| user_id | UUID | FK → profiles(id) |
| conversation_id | UUID | FK → ai_conversations(id) ON DELETE SET NULL |
| prompt | TEXT | NOT NULL |
| response | TEXT | |
| tokens_used | INTEGER | |
| model | VARCHAR(100) | |
| duration_ms | INTEGER | |
| created_at | TIMESTAMPTZ | |

### `ai_actions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| action_type | VARCHAR(100) | |
| status | VARCHAR(20) | DEFAULT 'pending' |
| input | JSONB | |
| output | JSONB | |
| executed_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

### `ai_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| user_id | UUID | FK → profiles(id) |
| action | VARCHAR(100) | |
| model | VARCHAR(100) | |
| tokens | INTEGER | |
| duration_ms | INTEGER | |
| success | BOOLEAN | |
| error | TEXT | |
| created_at | TIMESTAMPTZ | |

## 23. Search Foundation

### `search_index`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) ON DELETE CASCADE |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | UUID | NOT NULL |
| title | VARCHAR(255) | |
| content | TSVECTOR | — PostgreSQL full-text search vector |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

Indexes: (company_id, entity_type), GIN(content)
UNIQUE(company_id, entity_type, entity_id)

## 24. Observability

### `app_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) |
| level | VARCHAR(20) | NOT NULL — 'debug', 'info', 'warn', 'error' |
| message | TEXT | NOT NULL |
| metadata | JSONB | |
| source | VARCHAR(100) | — module or service name |
| created_at | TIMESTAMPTZ | |

### `error_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) |
| error_code | VARCHAR(100) | |
| message | TEXT | NOT NULL |
| stack_trace | TEXT | |
| context | JSONB | — request data, user info |
| severity | VARCHAR(20) | DEFAULT 'error' |
| resolved_at | TIMESTAMPTZ | |
| resolved_by | UUID | FK → profiles(id) |
| created_at | TIMESTAMPTZ | |

### `performance_metrics`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) |
| metric_name | VARCHAR(255) | NOT NULL |
| value | DOUBLE PRECISION | NOT NULL |
| unit | VARCHAR(50) | — 'ms', 'count', 'bytes' |
| tags | JSONB | |
| recorded_at | TIMESTAMPTZ | |

### `api_metrics`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| company_id | UUID | FK → companies(id) |
| method | VARCHAR(10) | NOT NULL |
| path | VARCHAR(500) | NOT NULL |
| status_code | INTEGER | |
| duration_ms | INTEGER | |
| user_id | UUID | FK → profiles(id) |
| ip_address | INET | |
| created_at | TIMESTAMPTZ | |

## 25. Soft Delete Strategy

All business tables implement soft deletes:

```
deleted_at TIMESTAMPTZ  — null = active, non-null = deleted
deleted_by UUID         — FK → profiles(id), who deleted it
```

- Queries always include `WHERE deleted_at IS NULL` by default.
- A `with_deleted()` scope allows admin queries to see deleted records.
- Restore sets `deleted_at = NULL, deleted_by = NULL`.
- Hard deletes are never used for business data.

## 26. Row Level Security (RLS) Summary

Every business table enforces: `company_id = auth.jwt() ->> 'company_id'`

| Pattern | Implementation |
|---------|---------------|
| All queries scoped | `USING (company_id = auth.jwt() ->> 'company_id')` |
| Admin bypass | `WITH CHECK (is_admin(auth.uid()))` |
| Own records | `user_id = auth.uid()` for user-specific tables |
| System tables | Admin-only access for system_settings, feature_flags |

## 27. Complete Index List

- All `company_id` columns (clustered where possible)
- All foreign key columns
- All `(entity_type, entity_id)` polymorphic indexes
- `activity_logs(company_id, created_at DESC)`
- `notifications(company_id, user_id, is_read)`
- `domain_events(company_id, status)`
- `jobs(company_id, status)`
- `jobs(company_id, queue, status)`
- `taggables(taggable_type, taggable_id)`
- `comments(company_id, entity_type, entity_id)`
- `custom_fields(company_id, entity_type)`
- `search_index` GIN(content) for full-text search
- `api_metrics(company_id, created_at)`
- `files(company_id, entity_type, entity_id)`

## 28. Complete Table Count

| Category | Tables |
|----------|--------|
| Multi-tenant | `companies`, `company_members` |
| RBAC | `permissions`, `roles`, `role_permissions`, `user_roles` |
| Auth | `profiles` |
| Feature Flags | `feature_flags`, `company_feature_flags` |
| Settings | `system_settings`, `company_settings`, `user_settings` |
| Business | `employees`, `projects`, `project_members`, `tasks` |
| Comments | `comments` |
| Tags | `tags`, `taggables` |
| Custom Fields | `custom_fields`, `custom_field_values` |
| Activity | `activity_logs` |
| CRM | `customers`, `leads` |
| Spreadsheets | `sheet_tables`, `sheet_columns`, `sheet_rows`, `sheet_cells` |
| Accounting | `chart_of_accounts`, `journal_entries`, `journal_entry_lines`, `invoices`, `invoice_items`, `payments`, `expenses` |
| Notifications | `notifications`, `notification_templates`, `notification_preferences` |
| Jobs | `jobs`, `job_logs` |
| Events | `domain_events` |
| Files | `files` |
| AI | `ai_conversations`, `ai_prompts`, `ai_actions`, `ai_logs` |
| Search | `search_index` |
| Observability | `app_logs`, `error_logs`, `performance_metrics`, `api_metrics` |
| **Total** | **47 tables** |
