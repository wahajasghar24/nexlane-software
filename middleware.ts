import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './src/i18n/routing'

export default async function middleware(request: NextRequest) {
  const res = await createMiddleware(routing)(request)
  res.headers.set('x-next-intl-matcher', 'RAN')
  return res
}

export const config = {
  // Match all paths except api, _next, static files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}