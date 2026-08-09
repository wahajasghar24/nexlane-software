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

    const { data: members, error } = await admin
      .from('company_members')
      .select('company_id, profile_id, profiles!inner(id, email, full_name)')
      .eq('company_id', context.companyId)

    if (error) {
      return NextResponse.json({ data: null, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
    }

    const users = (members || []).map((m: any) => ({
      id: m.profile_id,
      profile_id: m.profile_id,
      email: m.profiles?.email,
      full_name: m.profiles?.full_name,
    }))

    return NextResponse.json({ data: users, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string; code: string }
      return NextResponse.json({ data: null, error: { code: e.code, message: e.message } }, { status: e.status })
    }
    return NextResponse.json({ data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}