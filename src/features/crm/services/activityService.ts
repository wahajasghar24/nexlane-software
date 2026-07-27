import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { PaginatedResult } from '@/core/types/common'
import {
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
} from '@/features/crm/schemas'
import type { CreateActivityInput, UpdateActivityInput, ActivityQuery } from '@/features/crm/schemas'

export const activityService = {
  async list(companyId: string, query: ActivityQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = activityQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('activities')
      .select('*, assigned:assigned_to(id, full_name, email)', { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.entity_type) {
      dbQuery = dbQuery.eq('entity_type', parsed.entity_type)
    }
    if (parsed.entity_id) {
      dbQuery = dbQuery.eq('entity_id', parsed.entity_id)
    }
    if (parsed.type) {
      dbQuery = dbQuery.eq('type', parsed.type)
    }
    if (parsed.assigned_to) {
      dbQuery = dbQuery.eq('assigned_to', parsed.assigned_to)
    }

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + parsed.limit - 1)

    if (error) throw new DatabaseError(error)

    return {
      data: data || [],
      total: count || 0,
      page: parsed.page,
      pageSize: parsed.limit,
      totalPages: Math.ceil((count || 0) / parsed.limit),
    }
  },

  async getById(companyId: string, activityId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('activities')
      .select('*, assigned:assigned_to(id, full_name, email)')
      .eq('id', activityId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, input: CreateActivityInput, actorId: string) {
    const parsed = createActivitySchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('activities')
      .insert({
        company_id: companyId,
        entity_type: parsed.entity_type,
        entity_id: parsed.entity_id,
        type: parsed.type,
        subject: parsed.subject,
        description: parsed.description,
        scheduled_at: parsed.scheduled_at,
        completed_at: parsed.completed_at,
        assigned_to: parsed.assigned_to,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.ACTIVITY_CREATED,
      entityType: 'activity',
      entityId: data.id,
      payload: { activity: data, actorId },
    })

    return data
  },

  async update(companyId: string, activityId: string, input: UpdateActivityInput, actorId: string) {
    const parsed = updateActivitySchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('activities')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', activityId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.ACTIVITY_UPDATED,
      entityType: 'activity',
      entityId: activityId,
      payload: { activity: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, activityId: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('activities')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', activityId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.ACTIVITY_DELETED,
      entityType: 'activity',
      entityId: activityId,
      payload: { actorId },
    })
  },
}
