'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/core/supabase/client'

export function useUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: companies } = await supabase
        .from('company_members')
        .select('company_id, companies(id, name, slug, logo_url)')
        .eq('profile_id', user.id)

      return { user, profile, companies: companies || [] }
    },
    staleTime: 60_000,
  })
}

export function useSession() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      return data.session
    },
    staleTime: 30_000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword(input)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
