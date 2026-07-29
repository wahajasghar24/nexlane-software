import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { sheetTableService } from '@/features/spreadsheets/services/sheetTableService'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; rowId: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SPREADSHEETS_EDIT_DATA)

    const { id, rowId } = await params
    await sheetTableService.deleteRow(context.companyId, rowId)

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
