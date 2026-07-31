import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { projectService } from '@/features/projects/services/projectService'
import { ZodError } from 'zod'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.PROJECTS_MANAGE_MEMBERS)

    const { id, memberId } = await params
    const data = await projectService.removeMember(context.companyId, id, memberId)

    return NextResponse.json({ data, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(
        { data: null, error: (err as any).message },
        { status: (err as any).status }
      )
    }
    return NextResponse.json(
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 }
    )
  }
}
