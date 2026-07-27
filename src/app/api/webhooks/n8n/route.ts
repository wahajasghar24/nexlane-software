import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { n8nWebhookService } from '@/features/crm/services/webhookService'

export async function POST(request: Request) {
  try {
    const context = await authenticate(request)
    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())

    await n8nWebhookService.receive(context.companyId, headers, body)

    return NextResponse.json({ received: true })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(
        { data: null, error: (err as any).message },
        { status: (err as any).status }
      )
    }
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
