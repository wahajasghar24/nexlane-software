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

  // Fetch base_currency from company_settings
  const { data: currSetting } = await supabase
    .from('company_settings')
    .select('value')
    .eq('company_id', companyMember.company_id)
    .eq('key', 'base_currency')
    .single()

  const base_currency = currSetting?.value
    ? (typeof currSetting.value === 'string' ? JSON.parse(currSetting.value) : currSetting.value)
    : 'AED'

  return NextResponse.json({ data: { ...company, base_currency }, error: null })
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

  // Handle base_currency via company_settings (key/value table)
  if (body.base_currency !== undefined) {
    await supabase
      .from('company_settings')
      .upsert({
        company_id: companyMember.company_id,
        key: 'base_currency',
        value: JSON.stringify(body.base_currency),
      }, { onConflict: 'company_id,key' })
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
