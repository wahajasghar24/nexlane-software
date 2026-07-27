# Phase 2 — Events Added (18 new)

| Event Type | Trigger | Registered For |
|------------|---------|----------------|
| `lead.status_changed` | Lead status update | Notifications, Webhooks |
| `lead.note_added` | Lead note creation | Notifications |
| `crm_company.created` | CRM company created | Webhooks |
| `crm_company.updated` | CRM company updated | — |
| `crm_company.deleted` | CRM company deleted | — |
| `contact.created` | Contact created | Webhooks |
| `contact.updated` | Contact updated | — |
| `contact.deleted` | Contact deleted | — |
| `deal.created` | Deal created | Webhooks |
| `deal.updated` | Deal updated | — |
| `deal.deleted` | Deal deleted | — |
| `deal.won` | Deal marked won | Notifications, Webhooks |
| `deal.lost` | Deal marked lost | Notifications, Webhooks |
| `deal.stage_changed` | Deal stage changed | — |
| `activity.created` | Activity created | Webhooks |
| `activity.updated` | Activity updated | — |
| `activity.deleted` | Activity deleted | — |

All events route through:
- **Activity Handler** (all events → `activity_logs`)
- **Notification Handler** (select high-priority events)
- **Webhook Handler** (select events → n8n webhook URL)
