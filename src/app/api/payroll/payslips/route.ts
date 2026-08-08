import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { payrollService } from '@/features/payroll/services/payrollService'
import { ZodError } from 'zod'
import { z } from 'zod'

const generateSchema = z.object({
  period_start: z.string().min(1),
  period_end: z.string().min(1),
})

export async function GET(request: Request) {
  try {
    const context = await authenticate()
    const params = Object.fromEntries(new URL(request.url).searchParams.entries())
    const result = await payrollService.listPayslips(context.companyId, {
      period_start: params.period_start,
      period_end: params.period_end,
      employee_id: params.employee_id,
      status: params.status,
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 50,
    })
    return NextResponse.json({ data: result, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const context = await authenticate()
    const body = await request.json()
    const { period_start, period_end } = generateSchema.parse(body)
    const result = await payrollService.generatePayslips(context.companyId, period_start, period_end)
    return NextResponse.json({ data: result, error: null }, { status: 201 })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json(
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 },
    )
  }
}
