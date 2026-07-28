import { NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'
import { loginSchema } from '@/features/auth/schemas/auth.schema'
import { syncProfile, syncEmployeeForUser } from '@/core/auth/profile-sync'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.parse(body)
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.email,
      password: parsed.password,
    })

    if (error) {
      return NextResponse.json(
        { data: null, error: { code: 'AUTH_ERROR', message: error.message } },
        { status: 401 }
      )
    }

    // Ensure profile exists and sync last_sign_in_at / email / avatar
    if (data.user) {
      try {
        const syncResult = await syncProfile(
          data.user.id,
          data.user.email || parsed.email,
          data.user.user_metadata as Record<string, unknown> | null,
        )

        // Ensure employee records exist for ALL companies the user is a member of
        const employeeCount = await syncEmployeeForUser(
          data.user.id,
          (data.user.user_metadata as { full_name?: string } | null)?.full_name,
        )

        if (syncResult.employeeCreated || employeeCount > 0) {
          console.log(
            `[sync] Created ${employeeCount} employee record(s) for user ${data.user.id}`,
          )
        }
      } catch (syncErr) {
        // Sync failure should not block login
        // This can happen when SUPABASE_SERVICE_ROLE_KEY is not configured
        console.warn('[sync] Profile/employee sync failed:', syncErr)
      }
    }

    return NextResponse.json({ data: { user: data.user }, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err } },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
