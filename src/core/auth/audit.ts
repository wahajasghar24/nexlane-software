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
 * Uses the Phase-8 audit_logs schema: actor_id = company_members.id.
 * Audit failures never break the request: log and move on.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = createAdminClient()

    // Resolve actor_id (company_members.id) from user + company when available
    let actorId: string | null = null
    if (entry.userId && entry.companyId) {
      const { data: member } = await supabase
        .from('company_members')
        .select('id')
        .eq('profile_id', entry.userId)
        .eq('company_id', entry.companyId)
        .maybeSingle()
      actorId = member?.id || null
    }

    const ip =
      entry.request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      entry.request?.headers.get('x-real-ip') ||
      null
    const userAgent = entry.request?.headers.get('user-agent') || null

    await supabase.from('audit_logs').insert({
      company_id: entry.companyId ?? null,
      actor_id: actorId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      changes: entry.changes ?? null,
      ip_address: ip,
      user_agent: userAgent,
    })
  } catch (err) {
    console.warn('[audit] failed to write log:', err)
  }
}
