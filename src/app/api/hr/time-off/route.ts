import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { hrService } from '@/features/hr/services/hrService'
import { createTimeOffSchema, timeOffQuerySchema } from '@/features/hr/schemas/hr.schema'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.TIMEOFF_LIST)
    const query = timeOffQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()))
    const result = await hrService.listTimeOff(context.companyId, query)
    return NextResponse.json({ data: result, error: null })
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

export async function POST(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.TIMEOFF_CREATE)
    const body = createTimeOffSchema.parse(await request.json())
    const result = await hrService.requestTimeOff(context.companyId, body, context.userId)
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