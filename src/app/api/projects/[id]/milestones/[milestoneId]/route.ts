import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { milestoneService } from '@/features/milestones/services/milestoneService'
import { updateMilestoneSchema } from '@/features/milestones/schemas'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.PROJECTS_MILESTONES)

    const { id, milestoneId } = await params
    const body = updateMilestoneSchema.parse(await request.json())
    const data = await milestoneService.update(context.companyId, milestoneId, body)

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.PROJECTS_MILESTONES)

    const { id, milestoneId } = await params
    await milestoneService.remove(context.companyId, milestoneId)

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
