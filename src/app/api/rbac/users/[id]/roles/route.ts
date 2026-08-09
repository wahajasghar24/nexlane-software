import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { rbacService } from '@/features/rbac/services/rbacService'
import { assignUserRoleSchema } from '@/features/rbac/schemas/rbac.schema'
import { createAdminClient } from '@/core/supabase/admin'
import { ZodError } from 'zod'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.RBAC_MANAGE)
    const { id: userId } = await params
    const body = assignUserRoleSchema.parse(await request.json())
    await rbacService.assignUserRole(context.companyId, userId, body.roleId, context.userId)
    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string; code: string }
      return NextResponse.json({ data: null, error: { code: e.code, message: e.message } }, { status: e.status })
    }
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' } },
      { status: err instanceof ZodError ? 400 : 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.RBAC_MANAGE)
    const { id: userId } = await params
    const data = await rbacService.getUserRoles(context.companyId, userId)
    return NextResponse.json({ data, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string; code: string }
      return NextResponse.json({ data: null, error: { code: e.code, message: e.message } }, { status: e.status })
    }
    return NextResponse.json({ data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.RBAC_MANAGE)
    const { id: userId } = await params
    const url = new URL(request.url)
    const roleId = url.searchParams.get('roleId')
    if (!roleId) {
      return NextResponse.json({ data: null, error: { code: 'MISSING_ROLE', message: 'roleId is required' } }, { status: 400 })
    }
    const admin = createAdminClient()
    const { error } = await admin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .eq('company_id', context.companyId)
    if (error) throw error
    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string; code: string }
      return NextResponse.json({ data: null, error: { code: e.code, message: e.message } }, { status: e.status })
    }
    return NextResponse.json({ data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}