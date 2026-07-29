import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { accountingService } from '@/features/accounting/services/accountingService'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_READ)

    const url = new URL(request.url)
    const query: Record<string, unknown> = {}

    const page = url.searchParams.get('page')
    const limit = url.searchParams.get('limit')

    if (page) query.page = parseInt(page, 10)
    if (limit) query.limit = parseInt(limit, 10)

    const data = await accountingService.listPayments(context.companyId, query)

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
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_CREATE)

    const body = await request.json()
    const data = await accountingService.createPayment(context.companyId, body, context.userId)

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
