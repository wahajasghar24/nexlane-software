import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { n8nWebhookService } from '@/features/crm/services/webhookService'
import { z } from 'zod'

const configSchema = z.object({ webhookUrl: z.string().url() })

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SETTINGS_MANAGE)
    const apiKey = await n8nWebhookService.getApiKey(context.companyId)
    return NextResponse.json({ data: { apiKey }, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SETTINGS_MANAGE)
    const body = configSchema.parse(await request.json())
    await n8nWebhookService.setWebhookUrl(context.companyId, body.webhookUrl)
    return NextResponse.json({ data: { webhookUrl: body.webhookUrl }, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json(
      { data: null, error: err instanceof z.ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof z.ZodError ? 400 : 500 },
    )
  }
}