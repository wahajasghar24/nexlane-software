# n8n ↔ Nexlane ERP integration

## Import the workflow
1. n8n → **Workflows → Import from File** → `nexlane-leads-workflow.json`
2. Enable the workflow.

## Environment variables (n8n instance)
Set these in n8n's **Settings → Environment Variables** (or `.env` for self-hosted):

| Variable | Value |
|---|---|
| `NEXLANE_BOT_EMAIL` | bot user email (e.g. `alex@nexlane.com`) |
| `NEXLANE_BOT_PASSWORD` | bot user password |
| `NEXLANE_SMTP_FROM` | sender for emails (e.g. `no-reply@nexlane.com`) |

> The workflow logs in first and reuses the session cookie for every request —
> it never sends credentials to the leads API.

## SMTP
Add an **SMTP credential** in n8n (Settings → Credentials → SMTP) with your
mail provider (Hostinger SMTP: `smtp.hostinger.com`, port 587, TLS). Then open
the *4. Send intro email* node and select that credential.

## Send events INTO Nexlane (n8n → Nexlane)
When n8n wants to push leads itself (e.g. from Google Maps scrape):

```
POST https://nexlane-software.vercel.app/api/crm/leads
Cookie: <session from login step>
{
  "name": "Acme LLC",
  "email": "owner@acme.com",
  "phone": "+1...",
  "company": "Acme LLC",
  "source": "google_maps",
  "status": "new"
}
```

## Receive events FROM Nexlane (Nexlane → n8n)
1. Create an n8n **Webhook** node (POST) — e.g. path `/nexlane-events`.
2. Copy its URL: `https://your-n8n.example.com/webhook/nexlane-events`.
3. Set it in Nexlane (Owner/Admin):
   ```
   PUT https://nexlane-software.vercel.app/api/webhooks/n8n/config
   { "webhookUrl": "https://your-n8n.example.com/webhook/nexlane-events" }
   ```
4. Nexlane will POST `{event, entityType, entityId, payload, timestamp}` for:
   - `lead.created`, `lead.assigned`, `deal.created`, `deal.won`, `deal.lost`, `activity.created`
   - `invoice.created`, `payment.received`
   - `product.created`, `sales_order.created/confirmed/cancelled`, `purchase_order.created/received/cancelled`
   - `attendance.clocked_in/clocked_out`, `timeoff.requested/decided`

## Security
- The config route requires the `settings.manage` permission (Owner role).
- The inbound `/api/webhooks/n8n` route checks header `x-n8n-api-key` against
  `company_settings.n8n_api_key`. Ask your dev to set that key, then send it
  with every inbound n8n call.
