import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { getRules, createRule } from '@/core/automation/rulesEngine'

export async function GET() {
  try {
    const ctx = await authenticate()
    const rules = await getRules(ctx.companyId)
    return NextResponse.json({ data: rules, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await authenticate()
    const body = await request.json()
    if (!body.name || !body.entity || !body.trigger) {
      return NextResponse.json({ data: null, error: 'name, entity, trigger required' }, { status: 400 })
    }
    const rule = await createRule(ctx.companyId, {
      name: body.name,
      entity: body.entity,
      trigger: body.trigger,
      conditions: body.conditions || [],
      actions: body.actions || [],
      enabled: body.enabled !== false,
    })
    return NextResponse.json({ data: rule, error: null }, { status: 201 })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
