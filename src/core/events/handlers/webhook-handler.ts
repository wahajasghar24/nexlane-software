import { createAdminClient } from '@/core/supabase/admin'
import type { DomainEvent } from '@/core/types/common'
import { DatabaseError } from '@/core/errors/database-error'

const WEBHOOK_EVENTS = new Set([
  'lead.created',
  'task.created',
  'customer.created',
  'invoice.created',
  'payment.received',
  'lead.assigned',
  'deal.created',
  'deal.won',
  'deal.lost',
  'activity.created',
])

export async function webhookHandler(event: DomainEvent): Promise<void> {
  if (!WEBHOOK_EVENTS.has(event.eventType)) return

  const { data: settings } = await createAdminClient()
    .from('company_settings')
    .select('value')
    .eq('company_id', event.companyId)
    .eq('key', 'n8n_webhook_url')
    .single()

  const webhookUrl = settings?.value as string | null
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: event.eventType,
        entityType: event.entityType,
        entityId: event.entityId,
        payload: event.payload,
        timestamp: event.createdAt,
      }),
    })
  } catch {
    // Silently fail — n8n can poll if needed
  }
}
