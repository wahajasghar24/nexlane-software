import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/features/notifications/services/emailService'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { to, subject, body: emailBody } = body as { to?: string; subject?: string; body?: string }

  if (!to || !subject || !emailBody) {
    return NextResponse.json(
      { error: 'Missing required fields: to, subject, body' },
      { status: 400 },
    )
  }

  const result = await sendEmail({
    to,
    subject,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;color:#1e293b"><p>${emailBody}</p></body></html>`,
  })

  return NextResponse.json({ sent: result.sent, id: result.id ?? null })
}
