import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { skillService } from '@/features/skills/services/skillService'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; skillId: string }> }) {
  try {
    const { userId, companyId, email, ip, userAgent } = await authenticate(request)

    const { id, skillId } = await params
    const data = await skillService.remove(companyId, id, skillId)

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
