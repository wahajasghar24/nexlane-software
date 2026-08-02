import { NextResponse } from 'next/server'
import { createAdminClient } from '@/core/supabase/admin'
import { logAudit } from '@/core/auth/audit'

export async function GET(request: Request) {
  const out: Record<string, unknown> = {}
  try {
    // 1. helper se insert (companyId + userId ke saath — asli flow jaisa)
    await logAudit({
      companyId: '00000000-0000-0000-0000-000000000001',
      userId: 'ab2e12a5-f8b4-4bfd-8a3f-a283c2a6a66f',
      email: 'alex@nexlane.com',
      action: 'DEBUG helper call',
      entityType: 'debug',
      request,
    })

    // 2. check karo ke row aayi
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('audit_logs')
      .select('action, actor_id, company_id')
      .eq('action', 'DEBUG helper call')
      .order('created_at', { ascending: false })
      .limit(3)
    out.rowsAfterHelper = data ?? null
    out.queryError = error?.message ?? null
  } catch (err) {
    out.thrown = err instanceof Error ? err.message : String(err)
  }
  return NextResponse.json({ data: out, error: null })
}
