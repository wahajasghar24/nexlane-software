import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { bankReconciliationService } from '@/features/accounting/services/bankReconciliationService'
import { ZodError } from 'zod'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; txId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACCOUNTING_MANAGE)
    const { id: accountId, txId } = await params
    const body = await request.json()

    const data = await bankReconciliationService.reconcileTransaction(
      context.companyId,
      txId,
      body?.journalEntryId || null
    )
    return NextResponse.json({ data, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string }
      return NextResponse.json({ data: null, error: e.message }, { status: e.status })
    }
    return NextResponse.json(
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 }
    )
  }
}