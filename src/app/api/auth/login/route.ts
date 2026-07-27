import { NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'
import { loginSchema } from '@/features/auth/schemas/auth.schema'

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
