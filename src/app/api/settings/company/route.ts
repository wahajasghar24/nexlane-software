import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ data: null, error: 'Authentication required' }, { status: 401 })
  }

  const { data: companyMember } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('profile_id', user.id)
    .single()

  if (!companyMember) {
    return NextResponse.json({ data: null, error: 'No company found' })
  }

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyMember.company_id)
    .single()

  return NextResponse.json({ data: company, error: null })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ data: null, error: 'Authentication required' }, { status: 401 })
  }

  const { data: companyMember } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('profile_id', user.id)
    .single()

  if (!companyMember) {
    return NextResponse.json({ data: null, error: 'No company found' })
  }

  const body = await req.json()
  const allowed = ['name', 'logo_url', 'domain', 'phone', 'address']
  const updates: Record<string, any> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyMember.company_id)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 400 })
  return NextResponse.json({ data, error: null })
}
