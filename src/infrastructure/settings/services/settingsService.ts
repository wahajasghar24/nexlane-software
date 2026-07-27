import { createAdminClient } from '@/core/supabase/admin'
import { DatabaseError } from '@/core/errors/database-error'

export const settingsService = {
  async getSystem(key: string): Promise<unknown> {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    return data?.value ?? null
  },

  async setSystem(key: string, value: unknown, category?: string, environment?: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('system_settings')
      .upsert({ key, value, category, environment }, { onConflict: 'key,environment' })
    if (error) throw new DatabaseError(error)
  },

  async getCompany(companyId: string, key: string): Promise<unknown> {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('company_settings')
      .select('value')
      .eq('company_id', companyId)
      .eq('key', key)
      .maybeSingle()
    return data?.value ?? null
  },

  async setCompany(companyId: string, key: string, value: unknown, category?: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('company_settings')
      .upsert({ company_id: companyId, key, value, category }, { onConflict: 'company_id,key' })
    if (error) throw new DatabaseError(error)
  },

  async getUser(userId: string, key: string): Promise<unknown> {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('user_settings')
      .select('value')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()
    return data?.value ?? null
  },

  async setUser(userId: string, key: string, value: unknown): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, key, value }, { onConflict: 'user_id,key' })
    if (error) throw new DatabaseError(error)
  },
}
