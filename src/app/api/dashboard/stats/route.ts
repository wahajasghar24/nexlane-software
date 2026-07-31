import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { createAdminClient } from '@/core/supabase/admin'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.REPORTS_DASHBOARD)

    const supabase = createAdminClient()
    const companyId = context.companyId

    const [employees, projects, tasks, workLogs] = await Promise.all([
      supabase.from('employees').select('id', { count: 'exact', head: true }).eq('company_id', companyId).is('deleted_at', null),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('is_archived', false).is('deleted_at', null),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('company_id', companyId).in('status', ['todo', 'in_progress', 'blocked', 'review', 'testing']).is('deleted_at', null),
      supabase.from('work_logs').select('id, hours', { count: 'exact', head: true }).eq('company_id', companyId).eq('log_date', new Date().toISOString().split('T')[0]),
    ])

    const todayLogs = workLogs.count || 0
    const todayHours = workLogs.data?.reduce((sum, l: any) => sum + (l.hours || 0), 0) || 0

    return NextResponse.json({
      data: {
        totalEmployees: employees.count || 0,
        activeProjects: projects.count || 0,
        openTasks: tasks.count || 0,
        todayWorkLogs: todayLogs,
        todayHours,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: err.status || 500 }
    )
  }
}
