import { createAdminClient } from '@/core/supabase/admin'
import type { DomainEvent } from '@/core/types/common'
import { DatabaseError } from '@/core/errors/database-error'

export async function activityHandler(event: DomainEvent): Promise<void> {
  const supabase = createAdminClient()

  const actionMap: Record<string, string> = {
    'user.login': 'login',
    'user.logout': 'logout',
    'employee.created': 'created',
    'employee.updated': 'updated',
    'employee.deleted': 'deleted',
    'project.created': 'created',
    'project.updated': 'updated',
    'project.deleted': 'deleted',
    'task.created': 'created',
    'task.updated': 'updated',
    'task.deleted': 'deleted',
    'task.assigned': 'assigned',
    'task.status_changed': 'status_changed',
    'lead.created': 'created',
    'lead.updated': 'updated',
    'lead.deleted': 'deleted',
    'lead.assigned': 'assigned',
    'lead.converted': 'converted',
    'customer.created': 'created',
    'customer.updated': 'updated',
    'customer.deleted': 'deleted',
    'invoice.created': 'invoice_created',
    'invoice.sent': 'sent',
    'invoice.paid': 'payment_received',
    'invoice.overdue': 'status_changed',
    'expense.created': 'created',
    'payment.received': 'payment_received',
    'file.uploaded': 'file_uploaded',
    'file.deleted': 'deleted',
    'permission.changed': 'permission_changed',
    'role.created': 'created',
    'role.updated': 'updated',
    'role.deleted': 'deleted',
    'user_role.assigned': 'assigned',
  }

  const action = actionMap[event.eventType] || event.eventType.split('.').pop() || 'updated'
  const actorId = (event.payload.actorId as string) || (event.payload.createdBy as string)

  if (!actorId) return

  const { error } = await supabase.from('activity_logs').insert({
    company_id: event.companyId,
    actor_id: actorId,
    entity_type: event.entityType,
    entity_id: event.entityId,
    action,
    previous_data: event.payload.previousData || null,
    new_data: event.payload.newData || event.payload,
  })

  if (error) throw new DatabaseError(error)
}
