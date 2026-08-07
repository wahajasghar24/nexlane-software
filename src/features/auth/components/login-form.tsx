'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { useLogin } from '@/features/auth/hooks/useAuth'
import { createClient } from '@/core/supabase/client'
import { useRouter } from 'next/navigation'

type LoginForm = z.infer<ReturnType<typeof makeSchema>>

const makeSchema = (passwordRequired: string) => z.object({
  email: z.string().email(),
  password: z.string().min(1, passwordRequired),
})

export function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const login = useLogin()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(makeSchema(t('login.password_required'))),
  })

  async function onSubmit(data: LoginForm) {
    setError(null)
    try {
      await login.mutateAsync(data)
      // If the user has MFA enrolled, they must complete the TOTP challenge first
      const supabase = createClient()
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      router.push(aal?.nextLevel === 'aal2' ? '/mfa' : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.login_failed'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">{t('login.email')}</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">{t('login.password')}</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <div className="flex justify-end -mt-2">
        <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
          {t('login.forgot_password')}
        </Link>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? t('login.signing_in') : t('login.sign_in')}
      </button>
    </form>
  )
}