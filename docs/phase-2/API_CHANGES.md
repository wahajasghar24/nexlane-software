# Phase 2 — API Changes

## New CRM API Routes (16)

### Leads
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/crm/leads` | `leads.list` | List leads (search, filter, paginate) |
| POST | `/api/crm/leads` | `leads.create` | Create lead |
| GET | `/api/crm/leads/[id]` | `leads.read` | Get lead detail |
| PATCH | `/api/crm/leads/[id]` | `leads.update` | Update lead |
| DELETE | `/api/crm/leads/[id]` | `leads.delete` | Soft delete lead |
| POST | `/api/crm/leads/[id]/assign` | `leads.assign` | Assign lead to employee |
| POST | `/api/crm/leads/[id]/convert` | `leads.convert` | Convert lead to deal |
| GET | `/api/crm/leads/[id]/notes` | `leads.read` | Get lead notes |
| POST | `/api/crm/leads/[id]/notes` | `crm_notes.create` | Add lead note |

### CRM Companies
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/crm/companies` | `crm_companies.list` | List CRM companies |
| POST | `/api/crm/companies` | `crm_companies.create` | Create CRM company |
| GET | `/api/crm/companies/[id]` | `crm_companies.read` | Get company detail |
| PATCH | `/api/crm/companies/[id]` | `crm_companies.update` | Update company |
| DELETE | `/api/crm/companies/[id]` | `crm_companies.delete` | Soft delete company |

### Contacts
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/crm/contacts` | `contacts.list` | List contacts |
| POST | `/api/crm/contacts` | `contacts.create` | Create contact |
| GET | `/api/crm/contacts/[id]` | `contacts.read` | Get contact detail |
| PATCH | `/api/crm/contacts/[id]` | `contacts.update` | Update contact |
| DELETE | `/api/crm/contacts/[id]` | `contacts.delete` | Soft delete contact |

### Deals
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/crm/deals` | `deals.list` | List deals (filter by stage, owner) |
| POST | `/api/crm/deals` | `deals.create` | Create deal |
| GET | `/api/crm/deals/[id]` | `deals.read` | Get deal detail |
| PATCH | `/api/crm/deals/[id]` | `deals.update` | Update deal |
| DELETE | `/api/crm/deals/[id]` | `deals.delete` | Soft delete deal |
| POST | `/api/crm/deals/[id]/won` | `deals.won` | Mark deal won (auto-creates customer) |
| POST | `/api/crm/deals/[id]/lost` | `deals.lost` | Mark deal lost |

### Activities
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/crm/activities` | `activities.list` | List activities |
| POST | `/api/crm/activities` | `activities.create` | Create activity |
| GET | `/api/crm/activities/[id]` | `activities.list` | Get activity detail |
| PATCH | `/api/crm/activities/[id]` | `activities.update` | Update activity |
| DELETE | `/api/crm/activities/[id]` | `activities.delete` | Soft delete activity |

### n8n Webhook
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/webhooks/n8n` | API key (via `x-n8n-api-key` header) | Receive n8n webhook |
