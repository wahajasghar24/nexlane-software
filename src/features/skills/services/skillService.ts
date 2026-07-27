import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import { createEmployeeSkillSchema, updateEmployeeSkillSchema } from '@/features/skills/schemas/skill.schema'
import type { CreateEmployeeSkillInput, UpdateEmployeeSkillInput } from '@/features/skills/schemas/skill.schema'

export const skillService = {
  async listByEmployee(companyId: string, employeeId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('employee_skills')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .order('skill')
    if (error) throw new DatabaseError(error)
    return data
  },

  async add(companyId: string, employeeId: string, input: CreateEmployeeSkillInput, actorId: string) {
    const parsed = createEmployeeSkillSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('employee_skills')
      .insert({
        company_id: companyId,
        employee_id: employeeId,
        skill: parsed.skill,
        proficiency: parsed.proficiency,
        created_by: actorId,
      })
      .select()
      .single()
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'skill.created',
      entityType: 'employee_skill',
      entityId: data.id,
      payload: { skill: data, actorId },
    })

    return data
  },

  async update(companyId: string, skillId: string, input: UpdateEmployeeSkillInput, actorId: string) {
    const parsed = updateEmployeeSkillSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('employee_skills')
      .update({ proficiency: parsed.proficiency, updated_by: actorId })
      .eq('id', skillId)
      .eq('company_id', companyId)
      .select()
      .single()
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'skill.updated',
      entityType: 'employee_skill',
      entityId: skillId,
      payload: { skill: data, actorId },
    })

    return data
  },

  async remove(companyId: string, skillId: string, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('employee_skills')
      .delete()
      .eq('id', skillId)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'skill.deleted',
      entityType: 'employee_skill',
      entityId: skillId,
      payload: { actorId },
    })
  },
}
