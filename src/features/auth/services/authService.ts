import { createClient } from '@/core/supabase/client'
import { createAdminClient } from '@/core/supabase/admin'
import { AppError } from '@/core/errors/app-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { LoginInput, SignupInput } from '@/features/auth/schemas/auth.schema'

export const authService = {
  async login(input: LoginInput) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword(input)

    if (error) {
      throw new AppError('AUTH_ERROR', error.message, 401)
    }

    if (data.user) {
      const adminClient = createAdminClient()
      const { data: membership } = await adminClient
        .from('company_members')
        .select('company_id')
        .eq('profile_id', data.user.id)
        .eq('is_default', true)
        .maybeSingle()

      await eventBus.emit({
        companyId: membership?.company_id || '',
        eventType: EventTypes.USER_LOGIN,
        entityType: 'user',
        entityId: data.user.id,
        payload: { actorId: data.user.id, email: data.user.email },
      })
    }

    return data
  },

  async signup(input: SignupInput) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { full_name: input.fullName },
      },
    })

    if (error) throw new AppError('AUTH_ERROR', error.message, 400)
    return data
  },

  async logout() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.auth.signOut()

    if (user) {
      const adminClient = createAdminClient()
      const { data: membership } = await adminClient
        .from('company_members')
        .select('company_id')
        .eq('profile_id', user.id)
        .eq('is_default', true)
        .maybeSingle()

      await eventBus.emit({
        companyId: membership?.company_id || '',
        eventType: EventTypes.USER_LOGOUT,
        entityType: 'user',
        entityId: user.id,
        payload: { actorId: user.id },
      })
    }
  },

  async getSession() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getSession()
    if (error) throw new AppError('AUTH_ERROR', error.message, 401)
    return data.session
  },

  async getCurrentUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: memberships } = await supabase
      .from('company_members')
      .select('company_id, companies!inner(id, name, slug, logo_url)')
      .eq('profile_id', user.id)

    return { user, profile, companies: memberships || [] }
  },
}
