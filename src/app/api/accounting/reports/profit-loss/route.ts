import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { accountingService } from '@/features/accounting/services/accountingService'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_REPORTS)

    const url = new URL(request.url)
    const fromDate = url.searchParams.get('from_date') || new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)
    const toDate = url.searchParams.get('to_date') || new Date().toISOString().slice(0, 10)

    const data = await accountingService.getProfitAndLoss(context.companyId, fromDate, toDate)

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
