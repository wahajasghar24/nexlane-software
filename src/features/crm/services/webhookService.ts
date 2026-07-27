import { createAdminClient } from '@/core/supabase/admin'
import { DatabaseError } from '@/core/errors/database-error'

export const n8nWebhookService = {
  async receive(companyId: string, headers: Record<string, string>, body: Record<string, unknown>) {
    const supabase = createAdminClient()
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('value')
      .eq('company_id', companyId)
      .eq('key', 'n8n_api_key')
      .single()
    if (error) throw new DatabaseError(error)
    const apiKey = settings?.value as string | null
    const incomingKey = headers['x-n8n-api-key']
    if (!apiKey || incomingKey !== apiKey) {
      throw new Error('Invalid n8n API key')
    }
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        company_id: companyId,
        actor_id: null,
        entity_type: 'system',
        entity_id: companyId,
        action: 'n8n_webhook_received',
        new_data: { headers: { 'content-type': headers['content-type'] }, body: { type: body.type, action: body.action } },
      })
    if (logError) throw new DatabaseError(logError)
    return { received: true }
  },

  async getApiKey(companyId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('company_settings')
      .select('value')
      .eq('company_id', companyId)
      .eq('key', 'n8n_api_key')
      .single()
    if (error) return null
    return data?.value as string | null
  },

  async setWebhookUrl(companyId: string, url: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('company_settings')
      .upsert({
        company_id: companyId,
        key: 'n8n_webhook_url',
        value: url,
      }, { onConflict: 'company_id,key' })
    if (error) throw new DatabaseError(error)
  },
}
