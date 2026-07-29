import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { sheetTableService } from '@/features/spreadsheets/services/sheetTableService'
import { updateSheetColumnSchema } from '@/features/spreadsheets/schemas/sheet-table.schema'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; columnId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SPREADSHEETS_MANAGE_COLUMNS)

    const { id, columnId } = await params
    const body = updateSheetColumnSchema.parse(await request.json())
    const data = await sheetTableService.updateColumn(context.companyId, columnId, body)

    return NextResponse.json({ data, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(
        { data: null, error: (err as any).message },
        { status: (err as any).status }
      )
    }
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; columnId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SPREADSHEETS_MANAGE_COLUMNS)

    const { id, columnId } = await params
    await sheetTableService.deleteColumn(context.companyId, columnId)

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(
        { data: null, error: (err as any).message },
        { status: (err as any).status }
      )
    }
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
