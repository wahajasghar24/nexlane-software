import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import { createDesignationSchema, updateDesignationSchema } from '@/features/designations/schemas/designation.schema'
import type { CreateDesignationInput, UpdateDesignationInput } from '@/features/designations/schemas/designation.schema'

export const designationService = {
  async list(companyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('designations')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('name')
    if (error) throw new DatabaseError(error)
    return data
  },

  async getById(companyId: string, designationId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('designations')
      .select('*')
      .eq('id', designationId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, input: CreateDesignationInput, actorId: string) {
    const parsed = createDesignationSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('designations')
      .insert({
        company_id: companyId,
        name: parsed.name,
        description: parsed.description,
        created_by: actorId,
      })
      .select()
      .single()
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'designation.created',
      entityType: 'designation',
      entityId: data.id,
      payload: { designation: data, actorId },
    })

    return data
  },

  async update(companyId: string, designationId: string, input: UpdateDesignationInput, actorId: string) {
    const parsed = updateDesignationSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('designations')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', designationId)
      .eq('company_id', companyId)
      .select()
      .single()
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'designation.updated',
      entityType: 'designation',
      entityId: designationId,
      payload: { designation: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, designationId: string, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('designations')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', designationId)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'designation.deleted',
      entityType: 'designation',
      entityId: designationId,
      payload: { actorId },
    })
  },
}
