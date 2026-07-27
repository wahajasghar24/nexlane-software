import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { teamService } from '@/features/teams/services/teamService'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    const { userId, companyId, email, ip, userAgent } = await authenticate(request)

    const { id, memberId } = await params
    const data = await teamService.removeMember(companyId, id, memberId)

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
