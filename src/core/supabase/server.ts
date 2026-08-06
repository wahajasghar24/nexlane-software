import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient(accessToken?: string) {
  const cookieStore = await cookies()
  // Fallback: read Bearer token from the incoming request so service-layer
  // clients authenticate too (server-to-server, no cookies).
  const bearer =
    accessToken ||
    (await headers()).get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  return client
}
