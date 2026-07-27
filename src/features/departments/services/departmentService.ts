import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import { createDepartmentSchema, updateDepartmentSchema } from '@/features/departments/schemas/department.schema'
import type { CreateDepartmentInput, UpdateDepartmentInput } from '@/features/departments/schemas/department.schema'

export const departmentService = {
  async list(companyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('name')
    if (error) throw new DatabaseError(error)
    return data
  },

  async getById(companyId: string, departmentId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, input: CreateDepartmentInput, actorId: string) {
    const parsed = createDepartmentSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('departments')
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
      eventType: 'department.created',
      entityType: 'department',
      entityId: data.id,
      payload: { department: data, actorId },
    })

    return data
  },

  async update(companyId: string, departmentId: string, input: UpdateDepartmentInput, actorId: string) {
    const parsed = updateDepartmentSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('departments')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', departmentId)
      .eq('company_id', companyId)
      .select()
      .single()
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'department.updated',
      entityType: 'department',
      entityId: departmentId,
      payload: { department: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, departmentId: string, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('departments')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', departmentId)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'department.deleted',
      entityType: 'department',
      entityId: departmentId,
      payload: { actorId },
    })
  },
}
