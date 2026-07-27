import { createAdminClient } from '@/core/supabase/admin'
import { DatabaseError } from '@/core/errors/database-error'

interface CreateCommentInput {
  companyId: string
  entityType: string
  entityId: string
  authorId: string
  content: string
  parentId?: string | null
}

export const commentService = {
  async create(input: CreateCommentInput) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('comments')
      .insert({
        company_id: input.companyId,
        entity_type: input.entityType,
        entity_id: input.entityId,
        author_id: input.authorId,
        content: input.content,
        parent_id: input.parentId || null,
      })
      .select('*, author:author_id(id, full_name, avatar_url)')
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async findByEntity(companyId: string, entityType: string, entityId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:author_id(id, full_name, avatar_url)')
      .eq('company_id', companyId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    if (error) throw new DatabaseError(error)
    return data
  },

  async softDelete(id: string, companyId: string, userId: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString(), deleted_by: userId })
      .eq('id', id)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },
}
