import { createClient } from '@/core/supabase/server'
import { AppError } from '@/core/errors/app-error'
import type { UserContext } from '@/core/types/common'

export async function authenticate(request?: Request): Promise<UserContext> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AppError('UNAUTHENTICATED', 'Authentication required', 401)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'User profile not found', 401)
  }

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
