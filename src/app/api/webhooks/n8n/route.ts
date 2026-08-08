import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { n8nWebhookService } from '@/features/crm/services/webhookService'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const context = await authenticate(request)
    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())

    const result = await n8nWebhookService.receive(context.companyId, headers, body)

    return NextResponse.json(result)
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
