import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { createAdminClient } from '@/core/supabase/admin'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.RBAC_MANAGE)

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('audit_logs')
      .select('*, actor_id as user_id')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch (err) {
    const status = err instanceof Error && 'status' in err ? (err as { status?: number }).status : 500
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Failed to load audit logs' },
      { status: status ?? 500 }
    )
  }
}
