import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { sheetTableService } from '@/features/spreadsheets/services/sheetTableService'
import { createSheetRowSchema } from '@/features/spreadsheets/schemas/sheet-table.schema'
import { ZodError } from 'zod'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SPREADSHEETS_EDIT_DATA)

    const { id } = await params
    const body = createSheetRowSchema.parse({ sheet_table_id: id, ...(await request.json()) })
    const data = await sheetTableService.addRow(context.companyId, body)

    return NextResponse.json({ data, error: null }, { status: 201 })
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
