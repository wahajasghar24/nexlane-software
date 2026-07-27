import type { DomainEvent, UserContext } from '@/core/types/common'
import { eventRepository } from './event-repository'
import type { EventHandler, EventType } from './types'

type HandlerMap = Map<string, EventHandler[]>

const handlers: HandlerMap = new Map()

export const eventBus = {
  on(eventType: string, handler: EventHandler): void {
    const existing = handlers.get(eventType) || []
    existing.push(handler)
    handlers.set(eventType, existing)
  },

  off(eventType: string, handler: EventHandler): void {
    const existing = handlers.get(eventType) || []
    handlers.set(
      eventType,
      existing.filter(h => h !== handler)
    )
  },

  async emit(eventPayload: {
    companyId: string
    eventType: string
    entityType: string
    entityId: string
    payload: Record<string, unknown>
  }): Promise<void> {
    const persisted = await eventRepository.create(eventPayload)

    const eventHandlers = handlers.get(eventPayload.eventType) || []
    const results = await Promise.allSettled(
      eventHandlers.map(handler => handler(persisted))
    )

    const failed = results.filter(r => r.status === 'rejected')
    if (failed.length > 0) {
      const errorMessages = failed
        .map(r => (r as PromiseRejectedResult).reason?.message)
        .join(', ')

      await eventRepository.updateStatus(persisted.id!, 'failed', errorMessages)

      if (failed.length === eventHandlers.length) {
        throw new Error(`All handlers failed for event ${eventPayload.eventType}: ${errorMessages}`)
      }
    } else {
      await eventRepository.updateStatus(persisted.id!, 'processed')
    }
  },

  async replay(eventId: string): Promise<void> {
    const supabase = (await import('@/core/supabase/admin')).createAdminClient()
    const { data, error } = await supabase
      .from('domain_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error || !data) throw new Error('Event not found')

    const event: DomainEvent = {
      id: data.id,
      companyId: data.company_id,
      eventType: data.event_type,
      entityType: data.entity_type,
      entityId: data.entity_id,
      payload: data.payload,
      status: data.status,
      createdAt: data.created_at,
      processedAt: data.processed_at,
    }

    const eventHandlers = handlers.get(event.eventType) || []
    await Promise.allSettled(eventHandlers.map(handler => handler(event)))
  },
}
