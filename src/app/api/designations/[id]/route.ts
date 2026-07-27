import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { designationService } from '@/features/designations/services/designationService'
import { updateDesignationSchema } from '@/features/designations/schemas'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, companyId, email, ip, userAgent } = await authenticate(request)

    const { id } = await params
    const data = await designationService.getById(companyId, id)

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, companyId, email, ip, userAgent } = await authenticate(request)

    const { id } = await params
    const body = updateDesignationSchema.parse(await request.json())
    const data = await designationService.update(companyId, id, body, userId)

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, companyId } = await authenticate(request)

    const { id } = await params
    const data = await designationService.softDelete(companyId, id, userId)

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
