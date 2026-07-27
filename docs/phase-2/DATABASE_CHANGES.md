# Phase 2 — Database Changes

## New Migrations (040-044)

### 040: CRM Companies + Lead Extensions
- **`crm_companies`** — CRM company records (distinct from SaaS `companies` table)
  - `id`, `company_id`, `name`, `industry`, `website`, `phone`, `email`, `address` (JSONB), `notes`, audit columns
- **`leads`** extensions:
  - Added: `title`, `crm_company_id` (FK → crm_companies), `email`, `phone`, `website`, `industry`, `deal_value`, `converted_to_deal_id`
  - Updated status check constraint: `new, contacted, qualified, unqualified, converted`
- **`lead_notes`** — Dedicated notes per lead
  - `id`, `company_id`, `lead_id` (FK → leads), `content`, audit columns

### 041: Contacts
- **`contacts`** — Multiple contacts per CRM company
  - `id`, `company_id`, `crm_company_id` (FK → crm_companies), `name`, `designation`, `email`, `phone`, `whatsapp`, `is_primary`, `notes`, audit columns

### 042: Deals (Pipeline)
- **`deals`** — Deal pipeline
  - `id`, `company_id`, `lead_id` (FK → leads), `crm_company_id` (FK → crm_companies)
  - `name`, `value` (DECIMAL 14,2), `probability` (0-100), `stage` (check: new, contacted, demo_scheduled, proposal_sent, negotiation, won, lost)
  - `expected_close_date`, `actual_close_date`, `owner_id` (FK → employees), `notes`, audit columns

### 043: Activities
- **`activities`** — Polymorphic activity tracking
  - `id`, `company_id`, `entity_type` (check: lead, deal, contact, crm_company), `entity_id` (UUID)
  - `type` (check: call, meeting, email, follow_up, task), `subject`, `description`
  - `scheduled_at`, `completed_at`, `assigned_to` (FK → employees), audit columns

### 044: Permissions
- 28 new permission codes in the `crm` module (leads, crm_companies, contacts, deals, activities, crm_notes)

## Entity Types Added
```typescript
type EntityType =
  // ... existing types ...
  | 'crm_company'
  | 'contact'
  | 'deal'
  | 'activity'
  | 'lead_note'
```

## Event Types Added (18)
`lead.status_changed`, `lead.note_added`, `crm_company.created/updated/deleted`, `contact.created/updated/deleted`, `deal.created/updated/deleted`, `deal.won/lost`, `deal.stage_changed`, `activity.created/updated/deleted`
