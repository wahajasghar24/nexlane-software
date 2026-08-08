import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { payrollService } from '@/features/payroll/services/payrollService'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await authenticate()
    const { id } = await params
    const result = await payrollService.getPayslipDetail(context.companyId, id)
    return NextResponse.json({ data: result, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await authenticate()
    const { id } = await params
    const body = await request.json()
    if (body.status === 'approved') {
      const result = await payrollService.approvePayslip(context.companyId, id)
      return NextResponse.json({ data: result, error: null })
    }
    return NextResponse.json({ data: null, error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
