import { NextResponse } from 'next/server'
import { createAdminClient } from '@/core/supabase/admin'

export async function GET(request: Request) {
  const out: Record<string, unknown> = {}
  try {
    const supabase = createAdminClient()
    const entry = {
      companyId: '00000000-0000-0000-0000-000000000001',
      userId: 'ab2e12a5-f8b4-4bfd-8a3f-a283c2a6a66f',
      action: 'DEBUG helper body copy',
      entityType: 'debug',
      request,
    }

    // Step 1: member lookup (helper jaisa)
    const { data: member, error: mErr } = await supabase
      .from('company_members')
      .select('id')
      .eq('profile_id', entry.userId)
      .eq('company_id', entry.companyId)
      .maybeSingle()
    out.memberErr = mErr?.message ?? null
    out.actorId = member?.id ?? null

    // Step 2: headers
    const xff = entry.request?.headers.get('x-forwarded-for') ?? null
    out.ip = xff ? xff.split(',')[0]?.trim() ?? null : null

    // Step 3: exact helper insert
    const { error: insErr } = await supabase.from('audit_logs').insert({
      company_id: entry.companyId,
      actor_id: member?.id ?? null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: null,
      changes: null,
      ip_address: out.ip as string | null,
      user_agent: entry.request?.headers.get('user-agent') ?? null,
    })
    out.insertErr = insErr?.message ?? null

    // Step 4: verify
    const { data: rows } = await supabase
      .from('audit_logs')
      .select('action')
      .eq('action', 'DEBUG helper body copy')
    out.found = (rows ?? []).length
  } catch (err) {
    out.thrown = err instanceof Error ? err.message : String(err)
  }
  return NextResponse.json({ data: out, error: null })
}
