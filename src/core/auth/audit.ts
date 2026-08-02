import { createAdminClient } from '@/core/supabase/admin'

export interface AuditEntry {
  companyId?: string | null
  userId?: string | null
  email?: string | null
  action: string
  entityType: string
  entityId?: string | null
  changes?: Record<string, unknown> | null
  request?: Request | null
}

/**
 * Write an audit log entry (service role — bypasses RLS).
 * actor_id references profiles(id) — profiles.id == auth user id.
 * Audit failures never break the request: log and move on.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = createAdminClient()

    const ip =
      entry.request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      entry.request?.headers.get('x-real-ip') ||
      null
    const userAgent = entry.request?.headers.get('user-agent') || null

    const { error: insertError } = await supabase.from('audit_logs').insert({
      company_id: entry.companyId ?? null,
      actor_id: entry.userId ?? null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      changes: entry.changes ?? null,
      ip_address: ip,
      user_agent: userAgent,
    })
    if (insertError) {
      console.warn('[audit] insert failed:', insertError.message)
    }
  } catch (err) {
    console.warn('[audit] failed to write log:', err)
  }
}
