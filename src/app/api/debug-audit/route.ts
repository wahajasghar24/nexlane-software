import { NextResponse } from 'next/server'
import { createAdminClient } from '@/core/supabase/admin'

export async function GET() {
  const out: Record<string, unknown> = {}
  try {
    const admin = createAdminClient()
    out.srKeySet = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    out.url = process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30)

    const { data: member, error: mErr } = await admin
      .from('company_members')
      .select('id')
      .eq('profile_id', 'ab2e12a5-f8b4-4bfd-8a3f-a283c2a6a66f')
      .limit(1)
      .maybeSingle()
    out.memberErr = mErr?.message ?? null
    out.memberId = member?.id ?? null

    const { error: insErr } = await admin.from('audit_logs').insert({
      company_id: null,
      actor_id: null,
      action: 'DEBUG test insert',
      entity_type: 'debug',
      entity_id: null,
      changes: null,
      ip_address: null,
      user_agent: null,
    })
    out.insertErr = insErr?.message ?? null
  } catch (err) {
    out.thrown = err instanceof Error ? err.message : String(err)
  }
  return NextResponse.json({ data: out, error: null })
}
