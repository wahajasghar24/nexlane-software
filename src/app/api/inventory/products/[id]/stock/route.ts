import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { productService } from '@/features/inventory/services/productService'
import { stockAdjustSchema } from '@/features/inventory/schemas/product.schema'
import { ZodError } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.PRODUCTS_UPDATE)
    const { id } = await params
    const body = stockAdjustSchema.parse(await request.json())
    const data = await productService.adjustStock(context.companyId, id, body, context.userId)
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
