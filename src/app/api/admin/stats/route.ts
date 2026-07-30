import { NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'
import { createAdminClient } from '@/core/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ data: null, error: 'Authentication required' }, { status: 401 })
  }

  const admin = createAdminClient()

  const [
    { count: totalCompanies },
    { count: totalUsers },
    { count: activeProjects },
    { count: companiesToday },
  ] = await Promise.all([
    admin.from('companies').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('companies').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
  ])

  return NextResponse.json({
    data: {
      totalCompanies: totalCompanies ?? 0,
      totalUsers: totalUsers ?? 0,
      activeProjects: activeProjects ?? 0,
      companiesToday: companiesToday ?? 0,
    },
    error: null,
  })
}
