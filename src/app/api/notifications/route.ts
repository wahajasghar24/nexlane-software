import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { notificationService } from '@/features/notifications/services/notificationService'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACTIVITY_LIST)

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const unreadOnly = url.searchParams.get('unread') === 'true'

    const data = await notificationService.list(context.companyId, context.userId, { page, limit, unreadOnly })

    return NextResponse.json({ data, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json(
        { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
        { status: err instanceof ZodError ? 400 : 500 }
      )
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.NOTIFICATIONS_MANAGE)

    const body = await request.json()
    if (body.markAll) {
      await notificationService.markAllRead(context.companyId, context.userId)
    } else if (body.id) {
      await notificationService.markRead(context.companyId, context.userId, body.id)
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json(
        { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
        { status: err instanceof ZodError ? 400 : 500 }
      )
  }
}
