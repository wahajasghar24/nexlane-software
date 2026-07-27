import { createClient } from '@/core/supabase/server'
import { AppError } from '@/core/errors/app-error'
import { syncProfile, syncEmployeeForUser } from '@/core/auth/profile-sync'
import type { UserContext } from '@/core/types/common'

export async function authenticate(request?: Request): Promise<UserContext> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AppError('UNAUTHENTICATED', 'Authentication required', 401)
  }

  // 1. Sync profile — ensures profile row exists and is up-to-date
  //    This replaces the previous inline auto-repair logic.
  const meta = user.user_metadata as Record<string, unknown> | null
  await syncProfile(
    user.id,
    user.email || '',
    meta,
  )

  // 2. Look up profile (now guaranteed to exist)
  let { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Defensive — should never happen after syncProfile above
    throw new AppError('PROFILE_NOT_FOUND', 'User profile not found after sync', 500)
  }

  // 3. Ensure employee records exist for all user's companies
  //    Handles the case where a user was added to company_members
  //    but doesn't have an employees row yet.
  await syncEmployeeForUser(
    user.id,
    profile.full_name,
  )

  // 4. Find the user's default company
  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('profile_id', user.id)
    .eq('is_default', true)
    .single()

  const companyId = membership?.company_id

  if (!companyId) {
    throw new AppError('NO_COMPANY', 'User is not associated with any company', 403)
  }

  const ip = request?.headers.get('x-forwarded-for') || undefined
  const userAgent = request?.headers.get('user-agent') || undefined

  return {
    userId: user.id,
    companyId,
    email: profile.email,
    ip,
    userAgent,
  }
}
