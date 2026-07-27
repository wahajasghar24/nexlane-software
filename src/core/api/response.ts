import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/core/types/common'

export function json<T>(data: T, status: number = 200): NextResponse {
  const body: ApiResponse<T> = { data, error: null }
  return NextResponse.json(body, { status })
}

export function created<T>(data: T): NextResponse {
  return json(data, 201)
}

export function paginated<T>(data: T[], total: number, page: number, pageSize: number): NextResponse {
  const body = {
    data,
    error: null,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
  return NextResponse.json(body)
}

export function error(code: string, message: string, status: number = 400, details?: Record<string, unknown>): NextResponse {
  const body: ApiResponse<null> = {
    data: null,
    error: { code, message, details },
  }
  return NextResponse.json(body, { status })
}

export function unauthorized(): NextResponse {
  return error('UNAUTHORIZED', 'Authentication required', 401)
}

export function forbidden(): NextResponse {
  return error('FORBIDDEN', 'Access denied', 403)
}

export function notFound(entity: string = 'Resource'): NextResponse {
  return error('NOT_FOUND', `${entity} not found`, 404)
}

export function validationError(details: Record<string, unknown>): NextResponse {
  return error('VALIDATION_ERROR', 'Validation failed', 422, details)
}
