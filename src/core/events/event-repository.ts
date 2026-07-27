import { createAdminClient } from '@/core/supabase/admin'
import type { DomainEvent } from '@/core/types/common'
import { DatabaseError } from '@/core/errors/database-error'

export const eventRepository = {
  async create(event: DomainEvent): Promise<DomainEvent> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('domain_events')
      .insert({
        company_id: event.companyId,
        event_type: event.eventType,
        entity_type: event.entityType,
        entity_id: event.entityId,
        payload: event.payload,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return mapEvent(data)
  },

  async updateStatus(id: string, status: string, error?: string): Promise<void> {
    const supabase = createAdminClient()
    const update: Record<string, unknown> = { status }
    if (status === 'processed') update.processed_at = new Date().toISOString()
    if (error) update.payload = { error }

    const { error: dbError } = await supabase
      .from('domain_events')
      .update(update)
      .eq('id', id)

    if (dbError) throw new DatabaseError(dbError)
  },

  async findPending(limit: number = 50): Promise<DomainEvent[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('domain_events')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw new DatabaseError(error)
    return (data || []).map(mapEvent)
  },
}

function mapEvent(data: Record<string, unknown>): DomainEvent {
  return {
    id: data.id as string,
    companyId: data.company_id as string,
    eventType: data.event_type as string,
    entityType: data.entity_type as string,
    entityId: data.entity_id as string,
    payload: data.payload as Record<string, unknown>,
    status: data.status as DomainEvent['status'],
    createdAt: data.created_at as string,
    processedAt: data.processed_at as string,
  }
}
