import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { hrService } from '@/features/hr/services/hrService'
import { attendanceQuerySchema } from '@/features/hr/schemas/hr.schema'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ATTENDANCE_LIST)
    const query = attendanceQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()))
    const result = await hrService.listAttendance(context.companyId, query)
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
    await authorize(context, Permissions.ATTENDANCE_CHECKIN)
    const result = await hrService.clockIn(context.companyId, context.userId)
    return NextResponse.json({ data: result, error: null }, { status: 201 })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}