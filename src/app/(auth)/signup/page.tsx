'use client'

import { useTranslations } from 'next-intl'
import { SignupForm } from '@/features/auth/components/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  const t = useTranslations('auth')

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Nexlane</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('signup.create_account')}</p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          {t('signup.already_have_account')}{' '}
          <Link href="/login" className="text-primary hover:underline">{t('signup.sign_in')}</Link>
        </p>
      </div>
    </div>
  )
}