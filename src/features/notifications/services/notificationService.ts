import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'

export const notificationService = {
  async list(companyId: string, userId: string, query: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const supabase = await createClient()
    const page = query.page || 1
    const limit = query.limit || 20
    const offset = (page - 1) * limit

    let dbQuery = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('user_id', userId)

    if (query.unreadOnly) {
      dbQuery = dbQuery.eq('is_read', false)
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

  async markRead(companyId: string, userId: string, notificationId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('company_id', companyId)
      .eq('user_id', userId)

    if (error) throw new DatabaseError(error)
  },

  async markAllRead(companyId: string, userId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw new DatabaseError(error)
  },

  async getUnreadCount(companyId: string, userId: string) {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw new DatabaseError(error)
    return count || 0
  },

  async create(companyId: string, userId: string, input: { type: string; title: string; body?: string; link?: string }) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('notifications')
      .insert({ company_id: companyId, user_id: userId, ...input })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },
}
