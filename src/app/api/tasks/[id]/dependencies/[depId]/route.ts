import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { taskService } from '@/features/tasks/services/taskService'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; depId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.TASKS_UPDATE)

    const { id, depId } = await params
    const data = await taskService.removeDependency(context.companyId, id, depId)

    return NextResponse.json({ data, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(
        { data: null, error: (err as any).message },
        { status: (err as any).status }
      )
    }
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
