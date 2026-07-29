import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { accountingService } from '@/features/accounting/services/accountingService'
import type { AccountQuery } from '@/features/accounting/schemas'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_READ)

    const url = new URL(request.url)

    const query = {
      page: parseInt(url.searchParams.get('page') || '', 10) || 1,
      limit: parseInt(url.searchParams.get('limit') || '', 10) || 50,
      search: url.searchParams.get('search') || undefined,
      type: url.searchParams.get('type') || undefined,
    }

    const data = await accountingService.listAccounts(context.companyId, query)

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
    const data = await accountingService.createAccount(context.companyId, body, context.userId)

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
