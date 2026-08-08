import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { bankReconciliationService } from '@/features/accounting/services/bankReconciliationService'
import type { BankTransactionQuery } from '@/features/accounting/schemas'
import { ZodError } from 'zod'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_READ)
    const { id: bankAccountId } = await params

    const url = new URL(request.url)
    const typeParam = url.searchParams.get('type')
    const isReconciledParam = url.searchParams.get('is_reconciled')
    const query: BankTransactionQuery = {
      page: parseInt(url.searchParams.get('page') || '', 10) || 1,
      limit: parseInt(url.searchParams.get('limit') || '', 10) || 50,
      search: url.searchParams.get('search') || undefined,
      type: typeParam === 'credit' || typeParam === 'debit' ? typeParam : undefined,
      is_reconciled: isReconciledParam === 'true' ? true : isReconciledParam === 'false' ? false : undefined,
      start_date: url.searchParams.get('start_date') || undefined,
      end_date: url.searchParams.get('end_date') || undefined,
    }

    const data = await bankReconciliationService.listBankTransactions(
      context.companyId,
      bankAccountId,
      query
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
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_CREATE)
    const { id: bankAccountId } = await params

    const body = await request.json()
    const data = await bankReconciliationService.importTransactions(
      context.companyId,
      bankAccountId,
      body.transactions || body
    )

    return NextResponse.json({ data, error: null }, { status: 201 })
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
