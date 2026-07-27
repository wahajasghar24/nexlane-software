export interface PaginationParams {
  page: number
  pageSize: number
  offset: number
  limit: number
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))
  const offset = (page - 1) * pageSize
  return { page, pageSize, offset, limit: pageSize }
}

export function parseFilters(
  searchParams: URLSearchParams,
  allowedFields: string[]
): Record<string, string> {
  const filters: Record<string, string> = {}
  for (const field of allowedFields) {
    const value = searchParams.get(field)
    if (value) filters[field] = value
  }
  return filters
}
