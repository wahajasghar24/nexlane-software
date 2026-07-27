import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { designationService } from '@/features/designations/services/designationService'
import { createDesignationSchema } from '@/features/designations/schemas'

export async function GET(request: Request) {
  try {
    const { userId, companyId, email, ip, userAgent } = await authenticate(request)

    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams.entries())

    const data = await designationService.list(companyId)

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

export async function POST(request: Request) {
  try {
    const { userId, companyId, email, ip, userAgent } = await authenticate(request)

    const body = createDesignationSchema.parse(await request.json())
    const data = await designationService.create(companyId, body, userId)

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
