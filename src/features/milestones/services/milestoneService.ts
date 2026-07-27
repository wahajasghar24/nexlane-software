import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from '@/features/milestones/schemas/milestone.schema'
import type { CreateMilestoneInput, UpdateMilestoneInput } from '@/features/milestones/schemas/milestone.schema'

export const milestoneService = {
  async list(companyId: string, projectId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
    return data
  },

  async getById(companyId: string, milestoneId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', milestoneId)
      .eq('company_id', companyId)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, projectId: string, input: CreateMilestoneInput) {
    const parsed = createMilestoneSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('milestones')
      .insert({
        company_id: companyId,
        project_id: projectId,
        name: parsed.name,
        description: parsed.description,
        due_date: parsed.due_date,
        status: parsed.status,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async update(companyId: string, milestoneId: string, input: UpdateMilestoneInput) {
    const parsed = updateMilestoneSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('milestones')
      .update(parsed)
      .eq('id', milestoneId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async remove(companyId: string, milestoneId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },
}
