import { createAdminClient } from '@/core/supabase/admin'
import type { DomainEvent } from '@/core/types/common'
import { DatabaseError } from '@/core/errors/database-error'

const notificationConfig: Record<string, { type: string; titleTemplate: string; linkTemplate?: string }> = {
  'task.assigned': {
    type: 'task_assigned',
    titleTemplate: 'You have been assigned to task: {{title}}',
    linkTemplate: '/tasks/{{entityId}}',
  },
  'task.status_changed': {
    type: 'task_updated',
    titleTemplate: 'Task "{{title}}" status changed',
    linkTemplate: '/tasks/{{entityId}}',
  },
  'lead.assigned': {
    type: 'lead_assigned',
    titleTemplate: 'Lead "{{title}}" assigned to you',
    linkTemplate: '/crm/leads/{{entityId}}',
  },
  'invoice.created': {
    type: 'invoice_created',
    titleTemplate: 'Invoice #{{number}} created',
    linkTemplate: '/accounting/invoices/{{entityId}}',
  },
  'invoice.paid': {
    type: 'invoice_paid',
    titleTemplate: 'Invoice #{{number}} has been paid',
    linkTemplate: '/accounting/invoices/{{entityId}}',
  },
  'lead.converted': {
    type: 'lead_converted',
    titleTemplate: 'Lead "{{title}}" converted to customer',
    linkTemplate: '/crm/leads/{{entityId}}',
  },
}

export async function notificationHandler(event: DomainEvent): Promise<void> {
  const config = notificationConfig[event.eventType]
  if (!config) return

  const targetUserId = event.payload.assignedTo as string
    || event.payload.userId as string
  if (!targetUserId) return

  const title = config.titleTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    String(event.payload[key] ?? event.entityId)
  )

  const supabase = createAdminClient()
  const { error } = await supabase.from('notifications').insert({
    company_id: event.companyId,
    user_id: targetUserId,
    type: config.type,
    title,
    link: config.linkTemplate?.replace('{{entityId}}', event.entityId),
    metadata: event.payload,
    channel: 'in_app',
  })

  if (error) throw new DatabaseError(error)
}
