import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { taxService } from '@/features/accounting/services/taxService'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_READ)

    const { id } = await params
    const data = await taxService.getTaxReturn(context.companyId, id)

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_MANAGE)

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['draft', 'filed', 'paid'].includes(status)) {
      return NextResponse.json(
        { data: null, error: 'Invalid status. Must be draft, filed, or paid' },
        { status: 400 }
      )
    }

    const data = await taxService.updateTaxReturnStatus(
      context.companyId,
      id,
      status
    )

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
