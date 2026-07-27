import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'

interface CreateNotificationInput {
  companyId: string
  userId: string
  type: string
  title: string
  body?: string
  link?: string
  channel?: string
  metadata?: Record<string, unknown>
}

export const notificationService = {
  async create(input: CreateNotificationInput): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('notifications').insert({
      company_id: input.companyId,
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      channel: input.channel || 'in_app',
      metadata: input.metadata,
    })
    if (error) throw new DatabaseError(error)
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
    if (error) throw new DatabaseError(error)
  },

  async markAllAsRead(userId: string, companyId: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .eq('is_read', false)
    if (error) throw new DatabaseError(error)
  },

  async getUnreadCount(userId: string, companyId: string): Promise<number> {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .eq('is_read', false)
    if (error) throw new DatabaseError(error)
    return count ?? 0
  },

  async getPreferences(userId: string, companyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
    return data
  },

  async upsertPreference(userId: string, companyId: string, type: string, channels: Record<string, boolean>): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        { user_id: userId, company_id: companyId, type, channels },
        { onConflict: 'user_id,company_id,type' }
      )
    if (error) throw new DatabaseError(error)
  },
}
