import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { taxService } from '@/features/accounting/services/taxService'

export async function POST(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_READ)

    const body = await request.json()
    const { period_start, period_end, tax_rate } = body

    if (!period_start || !period_end) {
      return NextResponse.json(
        { data: null, error: 'period_start and period_end are required' },
        { status: 400 }
      )
    }

    const data = await taxService.calculateVAT(
      context.companyId,
      period_start,
      period_end,
      tax_rate
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
