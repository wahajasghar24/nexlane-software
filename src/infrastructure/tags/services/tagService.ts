import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'

export const tagService = {
  async create(companyId: string, name: string, color?: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tags')
      .insert({ company_id: companyId, name, color: color || '#6366f1' })
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async findByCompany(companyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('company_id', companyId)
      .order('name')
    if (error) throw new DatabaseError(error)
    return data
  },

  async attach(tagId: string, entityType: string, entityId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('taggables')
      .insert({ tag_id: tagId, taggable_type: entityType, taggable_id: entityId })
    if (error && !error.message.includes('duplicate')) throw new DatabaseError(error)
  },

  async detach(tagId: string, entityType: string, entityId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('taggables')
      .delete()
      .eq('tag_id', tagId)
      .eq('taggable_type', entityType)
      .eq('taggable_id', entityId)
    if (error) throw new DatabaseError(error)
  },

  async findByEntity(entityType: string, entityId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('taggables')
      .select('tag:tag_id(id, name, color)')
      .eq('taggable_type', entityType)
      .eq('taggable_id', entityId)
    if (error) throw new DatabaseError(error)
    return data?.map((t: { tag: unknown }) => t.tag)
  },

  async delete(id: string, companyId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },
}
