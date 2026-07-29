import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import type { PaginatedResult } from '@/core/types/common'

export const fileService = {
  async list(companyId: string, query: { page?: number; limit?: number; folder?: string; entity_type?: string }) {
    const supabase = await createClient()
    const page = query.page || 1
    const limit = query.limit || 20
    const offset = (page - 1) * limit

    let dbQuery = supabase
      .from('file_attachments')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)

    if (query.folder) {
      dbQuery = dbQuery.eq('folder', query.folder)
    }
    if (query.entity_type) {
      dbQuery = dbQuery.eq('entity_type', query.entity_type)
    }

    const { data, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new DatabaseError(error)

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  },

  async create(companyId: string, userId: string, input: {
    file_name: string; file_size: number; mime_type: string; storage_path: string;
    url?: string; entity_type?: string; entity_id?: string; folder?: string
  }) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('file_attachments')
      .insert({
        company_id: companyId,
        uploaded_by: userId,
        file_name: input.file_name,
        file_size: input.file_size,
        mime_type: input.mime_type,
        storage_path: input.storage_path,
        url: input.url || null,
        entity_type: input.entity_type || null,
        entity_id: input.entity_id || null,
        folder: input.folder || '/',
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async delete(companyId: string, fileId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('file_attachments')
      .delete()
      .eq('id', fileId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },

  async getById(companyId: string, fileId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('file_attachments')
      .select('*')
      .eq('id', fileId)
      .eq('company_id', companyId)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },
}
