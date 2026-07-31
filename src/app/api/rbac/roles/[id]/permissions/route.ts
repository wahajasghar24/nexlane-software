import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { rbacService } from '@/features/rbac/services/rbacService'
import { assignPermissionsSchema } from '@/features/rbac/schemas/rbac.schema'
import { ZodError } from 'zod'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate()
    await authorize(context, Permissions.RBAC_MANAGE)
    const { id } = await params
    const body = assignPermissionsSchema.parse(await request.json())
    await rbacService.assignPermissions(context.companyId, id, body.permissionIds, context.userId)
    return NextResponse.json({ data: { success: true }, error: null })
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
