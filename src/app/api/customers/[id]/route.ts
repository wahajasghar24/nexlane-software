import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { createClient } from '@/core/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.CUSTOMERS_READ)
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('crm_companies')
      .select('*')
      .eq('id', id)
      .eq('company_id', context.companyId)
      .single()

    if (error || !data) {
      return NextResponse.json({ data: null, error: 'Customer not found' }, { status: 404 })
    }
    return NextResponse.json({ data, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string }
      return NextResponse.json({ data: null, error: e.message }, { status: e.status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}