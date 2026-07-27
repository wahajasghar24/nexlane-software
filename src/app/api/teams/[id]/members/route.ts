import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { teamService } from '@/features/teams/services/teamService'
import { addTeamMemberSchema } from '@/features/teams/schemas'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.TEAMS_UPDATE)

    const { id } = await params
    const body = addTeamMemberSchema.parse(await request.json())
    await teamService.addMember(context.companyId, id, body.member_id)

    return NextResponse.json({ data: { success: true }, error: null }, { status: 201 })
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
