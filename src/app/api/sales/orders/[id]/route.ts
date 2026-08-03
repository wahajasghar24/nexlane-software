import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { salesOrderService } from '@/features/sales/services/salesOrderService'
import { updateSalesOrderSchema } from '@/features/sales/schemas/sales-order.schema'
import { ZodError } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const context = await authenticate(_request)
    await authorize(context, Permissions.SALES_ORDERS_READ)
    const { id } = await params
    const data = await salesOrderService.getById(context.companyId, id)
    return NextResponse.json({ data, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SALES_ORDERS_UPDATE)
    const { id } = await params
    const body = updateSalesOrderSchema.parse(await request.json())
    const data = await salesOrderService.update(context.companyId, id, body, context.userId)
    return NextResponse.json({ data, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json(
      { data: null, error: err instanceof ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof ZodError ? 400 : 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const context = await authenticate(_request)
    await authorize(context, Permissions.SALES_ORDERS_DELETE)
    const { id } = await params
    await salesOrderService.softDelete(context.companyId, id, context.userId)
    return NextResponse.json({ data: { id }, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
