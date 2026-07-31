import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { createAdminClient } from '@/core/supabase/admin'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.TIMELINE_VIEW)

    const url = new URL(request.url)
    const employee_id = url.searchParams.get('employee_id')
    const project_id = url.searchParams.get('project_id')
    const task_id = url.searchParams.get('task_id')
    const action = url.searchParams.get('action')
    const date_from = url.searchParams.get('date_from')
    const date_to = url.searchParams.get('date_to')
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    const offset = (page - 1) * limit

    const supabase = createAdminClient()
    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('company_id', context.companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (employee_id) query = query.eq('employee_id', employee_id)
    if (project_id) query = query.eq('project_id', project_id)
    if (task_id) query = query.eq('task_id', task_id)
    if (action) query = query.eq('action', action)
    if (date_from) query = query.gte('created_at', date_from)
    if (date_to) query = query.lte('created_at', date_to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { items: data, total: count, page, limit }, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(
        { data: null, error: (err as any).message },
        { status: (err as any).status }
      )
    }
    return NextResponse.json(
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 }
    )
  }
}
