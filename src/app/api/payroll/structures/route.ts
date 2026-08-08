import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { payrollService } from '@/features/payroll/services/payrollService'
import { ZodError } from 'zod'
import { z } from 'zod'

const createStructureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  components: z.array(z.unknown()).optional(),
})

export async function GET() {
  try {
    const context = await authenticate()
    const result = await payrollService.listPayrollStructures(context.companyId)
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
    const data = createStructureSchema.parse(body)
    const result = await payrollService.createPayrollStructure(context.companyId, data)
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
