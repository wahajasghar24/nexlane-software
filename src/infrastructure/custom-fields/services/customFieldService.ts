import { createAdminClient } from '@/core/supabase/admin'
import { DatabaseError } from '@/core/errors/database-error'

interface CreateCustomFieldInput {
  companyId: string
  entityType: string
  code: string
  name: string
  type: string
  options?: unknown
  required?: boolean
  defaultValue?: string
}

export const customFieldService = {
  async create(input: CreateCustomFieldInput) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('custom_fields')
      .insert({
        company_id: input.companyId,
        entity_type: input.entityType,
        code: input.code,
        name: input.name,
        type: input.type,
        options: input.options,
        required: input.required || false,
        default_value: input.defaultValue,
      })
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async findByEntityType(companyId: string, entityType: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('company_id', companyId)
      .eq('entity_type', entityType)
      .eq('is_active', true)
      .order('position')
    if (error) throw new DatabaseError(error)
    return data
  },

  async setValue(companyId: string, customFieldId: string, entityId: string, value: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('custom_field_values')
      .upsert(
        { company_id: companyId, custom_field_id: customFieldId, entity_id: entityId, value },
        { onConflict: 'custom_field_id,entity_id' }
      )
    if (error) throw new DatabaseError(error)
  },

  async getValues(companyId: string, entityType: string, entityId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('custom_field_values')
      .select('*, field:custom_field_id(code, name, type)')
      .eq('company_id', companyId)
      .eq('entity_id', entityId)
    if (error) throw new DatabaseError(error)
    return data
  },

  async delete(id: string, companyId: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('custom_fields')
      .update({ is_active: false })
      .eq('id', id)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },
}
