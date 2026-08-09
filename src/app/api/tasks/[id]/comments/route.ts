import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { createClient } from '@/core/supabase/server'
import { ZodError } from 'zod'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.TASKS_READ)
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('comments')
      .select('*, profile:author_id(id, email, full_name)')
      .eq('entity_type', 'task')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data: { comments: data || [] }, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string }
      return NextResponse.json({ data: null, error: e.message }, { status: e.status })
    }
    return NextResponse.json(
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.TASKS_COMMENT)
    const { id } = await params
    const body = await request.json()
    const content = (body?.content || '').toString().trim()
    if (!content) {
      return NextResponse.json({ data: null, error: 'Comment content is required' }, { status: 400 })
    }
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('comments')
      .insert({ entity_type: 'task', entity_id: id, author_id: context.userId, content })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      const e = err as { status: number; message: string }
      return NextResponse.json({ data: null, error: e.message }, { status: e.status })
    }
    return NextResponse.json(
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 }
    )
  }
}