'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/core/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // Recovery link lands as {redirectTo}#access_token=...&type=recovery
    const params = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const boot = async () => {
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (error) setError('Invalid or expired reset link. Request a new one.')
        else setReady(true)
      } else {
        setError('Invalid reset link. Request a new one.')
      }
    }
    boot()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">N</span>
          <span className="text-xl font-bold">Nexlane</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a new password for your account</p>
        </div>
        {done ? (
          <div className="space-y-4">
            <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
              Password updated successfully!
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Login
            </button>
          </div>
        ) : ready ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">New Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {error && <p className="text-center text-xs text-destructive">{error}</p>}
            <Link
              href="/forgot-password"
              className="block w-full rounded-md border border-input px-4 py-2 text-center text-sm font-medium hover:bg-accent"
            >
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
