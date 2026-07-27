import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { skillService } from '@/features/skills/services/skillService'
import { addSkillSchema } from '@/features/skills/schemas'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, companyId, email, ip, userAgent } = await authenticate(request)

    const { id } = await params
    const data = await skillService.listByEmployee(companyId, id)

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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, companyId, email, ip, userAgent } = await authenticate(request)

    const { id } = await params
    const body = addSkillSchema.parse(await request.json())
    const data = await skillService.add(companyId, id, body, userId)

    return NextResponse.json({ data, error: null }, { status: 201 })
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
