import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { accountingService } from '@/features/accounting/services/accountingService'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_REPORTS)

    const url = new URL(request.url)
    const query = {
      account_id: url.searchParams.get('account_id') || undefined,
      from_date: url.searchParams.get('from_date') || undefined,
      to_date: url.searchParams.get('to_date') || undefined,
      page: parseInt(url.searchParams.get('page') || '', 10) || 1,
      limit: parseInt(url.searchParams.get('limit') || '', 10) || 50,
    }

    const data = await accountingService.getGeneralLedger(context.companyId, query)

    return NextResponse.json({ data, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(
        { data: null, error: (err as any).message },
        { status: (err as any).status }
      )
    }
    return NextResponse.json(
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 }
    )
  }
}
