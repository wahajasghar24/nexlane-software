import { NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'
import { syncProfile } from '@/core/auth/profile-sync'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  // Sync profile to catch stale email / full_name / avatar and track session
  await syncProfile(
    user.id,
    user.email || '',
    user.user_metadata as Record<string, unknown> | null,
  )

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
