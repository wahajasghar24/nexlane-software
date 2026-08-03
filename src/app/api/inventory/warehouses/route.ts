import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { warehouseService } from '@/features/inventory/services/warehouseService'
import { warehouseSchema } from '@/features/inventory/schemas/warehouse.schema'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.WAREHOUSES_LIST)
    const url = new URL(request.url)
    const query = { page: url.searchParams.get('page') ?? '1', limit: url.searchParams.get('limit') ?? '20' }
    const result = await warehouseService.list(context.companyId, query as never)
    return NextResponse.json({ data: result, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.WAREHOUSES_CREATE)
    const body = warehouseSchema.parse(await request.json())
    const result = await warehouseService.create(context.companyId, body, context.userId)
    return NextResponse.json({ data: result, error: null }, { status: 201 })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json(
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 },
    )
  }
}