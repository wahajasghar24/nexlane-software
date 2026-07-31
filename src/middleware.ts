import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/core/supabase/middleware'

const publicPaths = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/webhooks/n8n',
]

function isPublicPath(path: string): boolean {
  return publicPaths.some(p => path === p || path.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response: NextResponse
  try {
    response = await updateSession(request)
  } catch {
    // Supabase unavailable (missing env / network) — fall back to cookie-only routing
    response = NextResponse.next({ request })
  }

  if (isPublicPath(pathname)) {
    return response
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Without Supabase env config, skip the auth gate (routes enforce their own auth)
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const { createServerClient } = await import('@supabase/ssr')
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll() {},
    },
  })

  let user: { id: string } | null = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    user = null
  }

  if (!user && !pathname.startsWith('/api/')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect root to dashboard for authenticated users
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.).*)',
  ],
}
