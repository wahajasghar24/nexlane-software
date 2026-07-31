import { createAdminClient } from '@/core/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * ProfileSyncResult — describes what the sync operation did.
 */
export interface ProfileSyncResult {
  profileCreated: boolean
  profileUpdated: boolean
  employeeCreated: boolean
  profileFields?: string[]
}

/**
 * syncProfile
 *
 * Ensures a profile row exists for the given auth user and is up-to-date.
 * Uses the admin client (service_role) to bypass RLS.
 *
 * Handles:
 *  - Missing profile (e.g. DB trigger failed)
 *  - Stale email (user changed email in Supabase Auth)
 *  - Stale full_name (updated via raw_user_meta_data)
 *  - Stale avatar_url (updated via raw_user_meta_data)
 *  - last_sign_in_at tracking
 */
export async function syncProfile(
  userId: string,
  email: string,
  userMetaData?: Record<string, unknown> | null,
): Promise<ProfileSyncResult> {
  const admin = createAdminClient()
  const result: ProfileSyncResult = {
    profileCreated: false,
    profileUpdated: false,
    employeeCreated: false,
  }

  // 1. Check existing profile
  const { data: existing } = await admin
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  const fullName =
    (userMetaData?.full_name as string) ||
    (userMetaData?.name as string) ||
    email.split('@')[0] ||
    'Unknown'

  const avatarUrl =
    (userMetaData?.avatar_url as string) ||
    (userMetaData?.picture as string) ||
    null

  if (!existing) {
    // 2. Profile missing — create it
    const profileInsert: Record<string, unknown> = {
      id: userId,
      email,
      full_name: fullName,
      last_sign_in_at: new Date().toISOString(),
    }
    if (avatarUrl) {
      profileInsert.avatar_url = avatarUrl
    }

    const { error: insertError } = await admin
      .from('profiles')
      .insert(profileInsert)

    if (insertError) {
      // If the trigger already created it between our SELECT and INSERT,
      // this is a harmless duplicate-key — treat as created
      if (!insertError.message?.includes('duplicate key')) {
        throw insertError
      }
    }

    result.profileCreated = true
    return result
  }

  // 3. Profile exists — check if anything needs updating
  const updates: Record<string, string | null> = {}
  const changedFields: string[] = []

  if (existing.email !== email) {
    updates.email = email
    changedFields.push('email')
  }

  if (
    (userMetaData?.full_name || userMetaData?.name) &&
    existing.full_name !== fullName
  ) {
    updates.full_name = fullName
    changedFields.push('full_name')
  }

  if (avatarUrl !== null && existing.avatar_url !== avatarUrl) {
    updates.avatar_url = avatarUrl
    changedFields.push('avatar_url')
  }

  // Always bump last_sign_in_at on login
  updates.last_sign_in_at = new Date().toISOString()
  changedFields.push('last_sign_in_at')

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (updateError) throw updateError
    result.profileUpdated = true
    result.profileFields = changedFields
  }

  return result
}

/**
 * ensureEmployee
 *
 * Creates an employee record for a user in a specific company if one does not
 * already exist. Uses a generated employee_code based on the profile's full_name.
 *
 * Idempotent: safe to call multiple times.
 */
export async function ensureEmployee(
  admin: SupabaseClient,
  profileId: string,
  companyId: string,
  actorId: string,
  fullName?: string,
): Promise<boolean> {
  // Check if they already have an employee record in this company
  const { data: existing } = await admin
    .from('employees')
    .select('id')
    .eq('profile_id', profileId)
    .eq('company_id', companyId)
    .maybeSingle()

  if (existing) return false // already exists

  // Generate a code based on the name and a timestamp
  const prefix = (fullName || 'user')
    .split(' ')
    .map((s: string) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, 'X')

  const ts = Date.now().toString(36).toUpperCase().slice(-5)
  const employeeCode = `EMP-${prefix}${ts}`

  const { error: insertError } = await admin.from('employees').insert({
    company_id: companyId,
    profile_id: profileId,
    full_name: fullName,
    employee_code: employeeCode,
    employment_status: 'active',
    position: 'Member',
    created_by: actorId,
  })

  if (insertError) {
    // Race-condition guard: another invocation may have inserted between our
    // check and insert — in that case there is nothing to fix.
    if (insertError.message?.includes('duplicate key')) return false
    throw insertError
  }

  return true
}

/**
 * syncEmployeeForUser
 *
 * Ensures the user has an employee record for EVERY company they're a member
 * of. This is called during login, session refresh, and authentication to
 * guarantee that company_members always have a corresponding employees row.
 *
 * Uses the admin client (service_role) to bypass RLS.
 */
export async function syncEmployeeForUser(
  userId: string,
  fullName?: string,
): Promise<number> {
  const admin = createAdminClient()

  // 1. Fetch all companies this user is a member of
  const { data: memberships } = await admin
    .from('company_members')
    .select('company_id')
    .eq('profile_id', userId)

  if (!memberships || memberships.length === 0) return 0

  let created = 0

  // 2. For each membership, ensure an employee record exists
  for (const membership of memberships) {
    const didCreate = await ensureEmployee(
      admin,
      userId,
      membership.company_id,
      userId,
      fullName,
    )
    if (didCreate) created++
  }

  return created
}
