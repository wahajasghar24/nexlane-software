import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { sheetTableService } from '@/features/spreadsheets/services/sheetTableService'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.SPREADSHEETS_EXPORT)

    const { id } = await params

    const csv = await sheetTableService.exportCsv(context.companyId, id)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="spreadsheet-${id}.csv"`,
      },
    })
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
