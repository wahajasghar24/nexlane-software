import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { moduleService } from '@/features/project-modules/services/moduleService'
import { updateModuleSchema } from '@/features/project-modules/schemas'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; moduleId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.PROJECTS_MODULES)

    const { id, moduleId } = await params
    const body = updateModuleSchema.parse(await request.json())
    const data = await moduleService.update(context.companyId, moduleId, body)

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; moduleId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.PROJECTS_MODULES)

    const { id, moduleId } = await params
    await moduleService.remove(context.companyId, moduleId)

    return NextResponse.json({ data: { success: true }, error: null })
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
