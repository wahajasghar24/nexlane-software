import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { taskService } from '@/features/tasks/services/taskService'
import { ZodError } from 'zod'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; assigneeId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.TASKS_ASSIGN)

    const { id, assigneeId } = await params
    const data = await taskService.removeAssignee(context.companyId, id, assigneeId)

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
