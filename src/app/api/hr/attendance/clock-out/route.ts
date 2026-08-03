import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { hrService } from '@/features/hr/services/hrService'

export async function POST(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ATTENDANCE_CHECKOUT)
    const result = await hrService.clockOut(context.companyId, context.userId)
    return NextResponse.json({ data: result, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}