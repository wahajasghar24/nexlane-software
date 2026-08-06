import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './src/i18n/routing'

export default async function middleware(request: NextRequest) {
  // probe: redirect /mwtest to prove middleware execution on Vercel
  if (request.nextUrl.pathname === '/mwtest') {
    return new Response('MW-RAN', { headers: { 'content-type': 'text/plain' } })
  }
  const res = await createMiddleware(routing)(request)
  return res
}

export const config = {
  // Match all paths except api, _next, static files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}