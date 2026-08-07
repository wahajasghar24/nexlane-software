'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/core/supabase/client'

export default function MfaChallengePage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = supabaseRef.current
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data: aal }) => {
      setChecking(false)
      if (!aal) return
      if (aal.currentLevel === 'aal2') {
        router.replace('/')
      } else if (aal.nextLevel !== 'aal2') {
        // No MFA factor enrolled — nothing to verify
        router.replace('/')
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = supabaseRef.current

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totpFactor = (factors?.totp || []).find(f => f.status === 'verified')
      if (!totpFactor) throw new Error(t('mfa.no_authenticator'))

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: totpFactor.id, challengeId: challenge.id, code })
      if (verifyError) throw new Error(t('mfa.invalid_code'))

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('mfa.verification_failed'))
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">N</span>
          <span className="text-xl font-bold">Nexlane</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t('mfa.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('mfa.hint')}</p>
        </div>
        {checking ? (
          <p className="text-center text-sm text-muted-foreground">{t('mfa.checking')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                required
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {error && <p className="text-xs text-destructive text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? t('mfa.verifying') : t('mfa.verify')}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">{t('mfa.back_to_login')}</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}