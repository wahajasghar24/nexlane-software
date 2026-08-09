import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM || 'Nexlane <no-reply@nexlane.online>'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ sent: boolean; id?: string }> {
  if (!resend) {
    console.log('[EMAIL STUB] Would send:', JSON.stringify(options, null, 2))
    return { sent: false }
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    })
    return { sent: true, id: result.data?.id }
  } catch (error) {
    console.error('[EMAIL ERROR]', error)
    return { sent: false }
  }
}
