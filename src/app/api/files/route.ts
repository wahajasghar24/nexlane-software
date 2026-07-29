import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { authorize } from '@/core/auth/authorize'
import { Permissions } from '@/core/auth/permissions'
import { fileService } from '@/features/files/services/fileService'

export async function GET(request: Request) {
  try {
    const context = await authenticate(request)
    await authorize(context, Permissions.FILES_READ)

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const folder = url.searchParams.get('folder') || undefined
    const entity_type = url.searchParams.get('entity_type') || undefined

    const data = await fileService.list(context.companyId, { page, limit, folder, entity_type })

    return NextResponse.json({ data, error: null })
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
    await authorize(context, Permissions.FILES_UPLOAD)

    const body = await request.json()
    const data = await fileService.create(context.companyId, context.userId, body)

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as any).message }, { status: (err as any).status })
    }
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
