import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { sheetTableService } from '@/features/spreadsheets/services/sheetTableService'
import { ZodError } from 'zod'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; rowId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SPREADSHEETS_EDIT_DATA)

    const { id, rowId } = await params
    const { columnId, value } = await request.json()
    await sheetTableService.updateCell(context.companyId, rowId, columnId, value)

    return NextResponse.json({ data: { success: true }, error: null })
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

export async function POST(request: Request, { params }: { params: Promise<{ id: string; rowId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SPREADSHEETS_EDIT_DATA)

    const { rowId } = await params
    const { cells } = await request.json()
    // Accept both `{ [columnId]: value }` map and `[{ column_id, value }]` array contracts
    const normalized = Array.isArray(cells)
      ? Object.fromEntries(cells.map((c: { column_id: string; value: unknown }) => [c.column_id, c.value]))
      : cells
    await sheetTableService.batchUpdateCells(context.companyId, rowId, normalized)

    return NextResponse.json({ data: { success: true }, error: null })
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
