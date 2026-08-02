import { createClient } from '@/core/supabase/server'
import { createAdminClient } from '@/core/supabase/admin'
import { AppError } from '@/core/errors/app-error'
import { syncProfile, syncEmployeeForUser } from '@/core/auth/profile-sync'
import { logAudit } from '@/core/auth/audit'
import type { UserContext } from '@/core/types/common'

// Decode the `aal` claim from a JWT access token without any dependency
// (payload is base64url-encoded JSON). Returns undefined when unreadable.
function decodeAal(accessToken?: string): string | undefined {
  if (!accessToken) return undefined
  try {
    const payload = accessToken.split('.')[1]
    const json = Buffer.from(payload, 'base64url').toString('utf-8')
    return JSON.parse(json).aal as string | undefined
  } catch {
    return undefined
  }
}

export async function authenticate(request?: Request): Promise<UserContext> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AppError('UNAUTHENTICATED', 'Authentication required', 401)
  }

  // 0. MFA/AAL2 enforcement — users with a verified TOTP factor must present an aal2 token
  const { data: { session } } = await supabase.auth.getSession()
  const aal = decodeAal(session?.access_token)
  if (aal !== 'aal2') {
    const admin = createAdminClient()
    const { data: adminUser } = await admin.auth.admin.getUserById(user.id)
    const hasVerifiedTotp = (adminUser?.user?.factors || []).some(
      f => f.factor_type === 'totp' && f.status === 'verified'
    )
    if (hasVerifiedTotp) {
      throw new AppError('MFA_REQUIRED', 'Two-factor authentication required', 403)
    }
  }

  // 1. Sync profile — ensures profile row exists and is up-to-date
  let profile: { id: string; email: string; full_name: string } | null = null
  let syncSuccess = false
  try {
    const meta = user.user_metadata as Record<string, unknown> | null
    await syncProfile(user.id, user.email || '', meta)

    // Look up profile
    const { data: p } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', user.id)
      .single()
    profile = p

    // Ensure employee records exist
    if (profile) {
      const created = await syncEmployeeForUser(user.id, profile.full_name)
      if (created > 0) {
        console.log(`[auth] Created ${created} employee record(s) for user ${user.id}`)
      }
    }

    syncSuccess = true
  } catch (syncErr) {
    // Sync failure should not block authentication
    console.warn('[auth] Sync failed (non-fatal):', syncErr)
  }

  // 2. Find the user's default company
  let { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('profile_id', user.id)
    .eq('is_default', true)
    .maybeSingle()

  // If no company membership found, try to auto-create one using admin client
  if (!membership) {
    try {
      const admin = createAdminClient()

      // Check if user has ANY company membership (not just default)
      const { data: anyMembership } = await admin
        .from('company_members')
        .select('company_id, is_default')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (anyMembership) {
        membership = { company_id: anyMembership.company_id }
      } else {
        // No memberships at all — find the first company and add user
        const { data: firstCompany } = await admin
          .from('companies')
          .select('id')
          .limit(1)
          .single()

        if (firstCompany) {
          // Ensure profile exists first
          if (!profile) {
            const { data: p } = await supabase
              .from('profiles')
              .select('id, email, full_name')
              .eq('id', user.id)
              .single()
            profile = p
          }

          // Create company membership
          const { error: cmError } = await admin
            .from('company_members')
            .insert({
              company_id: firstCompany.id,
              profile_id: user.id,
              is_default: true,
            })

          if (cmError) {
            console.warn('[auth] Could not auto-create company membership:', cmError.message)
          } else {
            console.log(`[auth] Auto-created company_members for user ${user.id} in company ${firstCompany.id}`)
            membership = { company_id: firstCompany.id }

            // Also create an employee record for the new membership
            try {
              await syncEmployeeForUser(user.id, profile?.full_name)
            } catch {
              // non-fatal
            }
          }
        }
      }
    } catch (adminErr) {
      // Admin client requires SUPABASE_SERVICE_ROLE_KEY
      console.warn('[auth] Admin client unavailable:', adminErr)
    }
  }

  const companyId = membership?.company_id

  if (!companyId) {
    throw new AppError('NO_COMPANY', 'User is not associated with any company', 403)
  }

  // 3. If sync failed and we have no profile, get it the normal way
  if (!profile) {
    const { data: p } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', user.id)
      .single()
    profile = p
  }

  const ip = request?.headers.get('x-forwarded-for') || undefined
  const userAgent = request?.headers.get('user-agent') || undefined

  // Audit every authenticated API action (enterprise audit trail)
  const method = request?.method || 'UNKNOWN'
  const path = request?.url ? new URL(request.url).pathname : 'unknown'
  await logAudit({
    companyId,
    userId: user.id,
    email: profile?.email || user.email || '',
    action: `${method} ${path}`,
    entityType: 'api',
    request,
  })

  return {
    userId: user.id,
    companyId,
    email: profile?.email || user.email || '',
    ip,
    userAgent,
  }
}
