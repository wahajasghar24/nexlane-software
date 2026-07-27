import { NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    return NextResponse.json(
      { data: null, error: { code: 'AUTH_ERROR', message: error.message } },
      { status: 401 }
    )
  }

  return NextResponse.json({ data: { session }, error: null })
}
