import { NextResponse } from 'next/server'
import { createAdminClient } from '@/core/supabase/admin'
import { forgotPasswordSchema } from '@/features/auth/schemas/auth.schema'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
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
