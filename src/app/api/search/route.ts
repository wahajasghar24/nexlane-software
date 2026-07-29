import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { searchService } from '@/features/search/services/searchService'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.ACTIVITY_LIST)

    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''

    if (!q.trim()) {
      return NextResponse.json({ data: [], error: null })
    }

    const data = await searchService.globalSearch(context.companyId, q.trim())

    return NextResponse.json({ data, error: null })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
