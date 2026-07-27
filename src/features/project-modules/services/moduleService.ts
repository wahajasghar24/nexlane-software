import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { createModuleSchema, updateModuleSchema } from '@/features/project-modules/schemas/module.schema'
import type { CreateModuleInput, UpdateModuleInput } from '@/features/project-modules/schemas/module.schema'

export const moduleService = {
  async list(companyId: string, projectId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_modules')
      .select('*')
      .eq('project_id', projectId)
      .eq('company_id', companyId)
      .order('sort_order')

    if (error) throw new DatabaseError(error)
    return data
  },

  async getById(companyId: string, moduleId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_modules')
      .select('*')
      .eq('id', moduleId)
      .eq('company_id', companyId)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, projectId: string, input: CreateModuleInput) {
    const parsed = createModuleSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_modules')
      .insert({
        company_id: companyId,
        project_id: projectId,
        name: parsed.name,
        description: parsed.description,
        status: parsed.status,
        start_date: parsed.start_date,
        end_date: parsed.end_date,
        sort_order: parsed.sort_order,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async update(companyId: string, moduleId: string, input: UpdateModuleInput) {
    const parsed = updateModuleSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_modules')
      .update(parsed)
      .eq('id', moduleId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async remove(companyId: string, moduleId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('project_modules')
      .delete()
      .eq('id', moduleId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },
}
