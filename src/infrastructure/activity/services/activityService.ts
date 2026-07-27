import { createAdminClient } from '@/core/supabase/admin'
import { DatabaseError } from '@/core/errors/database-error'

interface LogActivityInput {
  companyId: string
  actorId: string
  entityType: string
  entityId: string
  action: string
  previousData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  ipAddress?: string
  userAgent?: string
}

export const activityService = {
  async log(input: LogActivityInput): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.from('activity_logs').insert({
      company_id: input.companyId,
      actor_id: input.actorId,
      entity_type: input.entityType,
      entity_id: input.entityId,
      action: input.action,
      previous_data: input.previousData,
      new_data: input.newData,
      ip_address: input.ipAddress,
      user_agent: input.userAgent,
    })
    if (error) throw new DatabaseError(error)
  },

  async findByEntity(companyId: string, entityType: string, entityId: string, limit = 50) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('company_id', companyId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw new DatabaseError(error)
    return data
  },
}
