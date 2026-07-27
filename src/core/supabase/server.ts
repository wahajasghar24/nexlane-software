import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const globalForSupabase = globalThis as unknown as {
  _supabaseClient?: ReturnType<typeof createServerClient>
}

export async function createClient() {
  if (globalForSupabase._supabaseClient) {
    return globalForSupabase._supabaseClient
  }

  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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

  globalForSupabase._supabaseClient = client
  return client
}
