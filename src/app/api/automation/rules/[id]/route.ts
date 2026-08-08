import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { getRules, updateRule, deleteRule, type AutomationRule } from '@/core/automation/rulesEngine'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const ctx = await authenticate()
    const { id } = await params
    const rules = await getRules(ctx.companyId)
    const rule = rules.find((r: AutomationRule) => r.id === id)
    if (!rule) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: rule, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await authenticate()
    const { id } = await params
    const body = await request.json()
    const rule = await updateRule(ctx.companyId, id, body)
    return NextResponse.json({ data: rule, error: null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ data: null, error: msg }, { status: msg === 'Rule not found' ? 404 : 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await authenticate()
    const { id } = await params
    await deleteRule(ctx.companyId, id)
    return NextResponse.json({ data: { id }, error: null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ data: null, error: msg }, { status: msg === 'Rule not found' ? 404 : 500 })
  }
}
