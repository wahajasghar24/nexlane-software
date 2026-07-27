import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { rbacService } from '@/features/rbac/services/rbacService'

export async function GET() {
  try {
    const context = await authenticate()
    await authorize(context, Permissions.RBAC_MANAGE)
    const permissions = await rbacService.listPermissions()
    return NextResponse.json({ data: permissions, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string; code: string }
      return NextResponse.json(
        { data: null, error: { code: e.code, message: e.message } },
        { status: e.status }
      )
    }
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
