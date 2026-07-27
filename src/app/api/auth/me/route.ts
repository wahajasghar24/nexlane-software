import { NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: companies } = await supabase
    .from('company_members')
    .select('company_id, companies!inner(id, name, slug, logo_url)')
    .eq('profile_id', user.id)

  return NextResponse.json({
    data: { user, profile, companies: companies || [] },
    error: null,
  })
}
