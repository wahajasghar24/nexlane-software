import { NextResponse } from 'next/server'
import { createAdminClient } from '@/core/supabase/admin'
import { forgotPasswordSchema } from '@/features/auth/schemas/auth.schema'
import { rateLimit, rateLimitKey } from '@/core/security/rate-limit'

export async function POST(request: Request) {
  // Rate limit: 5 attempts / 15 min per IP+email
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
  const body = await request.json().catch(() => ({}))
  const email = (body?.email || '').toString().toLowerCase()
  const rl = rateLimit(rateLimitKey('forgot-password', ip, email), 5, 15 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json(
      { data: null, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes.' } },
      { status: 429 }
    )
  }

  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.flatten() }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexlane-projects-nexlane.vercel.app'}/reset-password`,
  })
  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 400 })
  }

  // Always return success — don't leak whether the email exists
  return NextResponse.json({ data: { success: true }, error: null })
}
