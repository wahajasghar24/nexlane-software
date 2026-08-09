import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { sendEmail } from '@/features/notifications/services/emailService'

export async function POST(req: NextRequest) {
  try {
    const context = await authenticate(req)

    const body = await req.json()
    const { to, subject, body: emailBody } = body as { to?: string; subject?: string; body?: string }

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 },
      )
    }

    // Sanitize email body — strip HTML tags to prevent XSS
    const safeBody = emailBody.replace(/<[^>]*>/g, '').slice(0, 5000)

    const result = await sendEmail({
      to,
      subject,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;color:#1e293b"><p>${safeBody}</p></body></html>`,
    })

    return NextResponse.json({ sent: result.sent, id: result.id ?? null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
