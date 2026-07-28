import { NextResponse } from 'next/server'
import { createAdminClient } from '@/core/supabase/admin'
import { createClient } from '@/core/supabase/server'
import { syncProfile, syncEmployeeForUser } from '@/core/auth/profile-sync'

export async function GET() {
  const results: Record<string, unknown> = {}
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      results.auth = 'no user'
      return NextResponse.json(results)
    }
    
    results.user_id = user.id
    results.user_email = user.email
    
    // Test admin client
    try {
      const admin = createAdminClient()
      results.admin_created = true
      
      // Test query companies
      const { data: companies, error: cErr } = await admin.from('companies').select('id, name')
      results.companies = companies
      results.companies_error = cErr?.message
      
      // Test query company_members
      const { data: memberships, error: mErr } = await admin
        .from('company_members')
        .select('company_id, is_default')
        .eq('profile_id', user.id)
      results.memberships = memberships
      results.memberships_error = mErr?.message
      
    } catch (err) {
      results.admin_error = String(err)
    }
    
    // Test syncProfile
    try {
      const meta = user.user_metadata as Record<string, unknown> | null
      const syncResult = await syncProfile(user.id, user.email || '', meta)
      results.sync_result = syncResult
    } catch (err) {
      results.sync_error = String(err)
    }
    
    // Test reg profile query
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user.id)
      .maybeSingle()
    results.profile = profile
    
  } catch (err) {
    results.error = String(err)
  }
  
  return NextResponse.json(results)
}
