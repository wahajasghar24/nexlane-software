'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { createClient } from '@/core/supabase/client'

interface Profile {
  id: string
  name: string
  email: string
  avatar_url?: string
  phone?: string
}

interface Company {
  id: string
  name: string
  logo_url?: string
  domain?: string
  phone?: string
  address?: Record<string, any>
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'profile' | 'company' | 'security'>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [companyForm, setCompanyForm] = useState({ name: '', domain: '', phone: '' })

  // --- MFA state ---
  const [mfaFactors, setMfaFactors] = useState<{ id: string; friendly_name?: string }[]>([])
  const [mfaStatus, setMfaStatus] = useState('')
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [enrollData, setEnrollData] = useState<{ id: string; qr?: string; secret: string; uri: string } | null>(null)
  const [enrollCode, setEnrollCode] = useState('')
  const [busy, setBusy] = useState(false)

  const loadMfa = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.mfa.listFactors()
      setMfaFactors((data?.totp || []).filter(f => f.status === 'verified').map(f => ({ id: f.id, friendly_name: f.friendly_name })))
      setMfaError(null)
    } catch { setMfaError('Could not load security settings') }
  }, [])

  const startEnroll = async () => {
    setBusy(true)
    setMfaError(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) throw error
      setEnrollData({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret, uri: data.totp.uri })
      setEnrollCode('')
    } catch (e) { setMfaError(e instanceof Error ? e.message : 'Enrollment failed') }
    finally { setBusy(false) }
  }

  const verifyEnroll = async () => {
    setBusy(true)
    setMfaError(null)
    try {
      const supabase = createClient()
      if (!enrollData) throw new Error('No pending enrollment')
      const { data: challenge, error: cError } = await supabase.auth.mfa.challenge({ factorId: enrollData.id })
      if (cError) throw cError
      const { error: vError } = await supabase.auth.mfa.verify({ factorId: enrollData.id, challengeId: challenge.id, code: enrollCode })
      if (vError) throw new Error('Invalid code. Check the code in your authenticator app.')
      setEnrollData(null)
      setEnrollCode('')
      setMfaStatus('Authenticator app connected successfully!')
      await loadMfa()
      // Verify response upgrades the session to AAL2; guard the edge case where it didn't
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.currentLevel !== 'aal2') {
        await supabase.auth.signOut()
        window.location.href = '/login?mfa=enabled'
      }
    } catch (e) { setMfaError(e instanceof Error ? e.message : 'Verification failed') }
    finally { setBusy(false) }
  }

  const cancelEnroll = async () => {
    try {
      const supabase = createClient()
      if (enrollData) await supabase.auth.mfa.unenroll({ factorId: enrollData.id })
    } catch {}
    setEnrollData(null)
    setEnrollCode('')
  }

  const disableMfa = async (factorId: string) => {
    if (!confirm('Disable two-factor authentication for this account?')) return
    setBusy(true)
    setMfaError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw error
      setMfaStatus('Two-factor authentication disabled.')
      await loadMfa()
    } catch (e) { setMfaError(e instanceof Error ? e.message : 'Failed to disable 2FA') }
    finally { setBusy(false) }
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/profile').then(r => r.json()),
      fetch('/api/settings/company').then(r => r.json()),
    ]).then(([pData, cData]) => {
      if (pData.data) {
        setProfile(pData.data)
        setProfileForm({ name: pData.data.full_name || '', phone: pData.data.phone || '' })
      }
      if (cData.data) {
        setCompany(cData.data)
        setCompanyForm({ name: cData.data.name || '', domain: cData.data.domain || '', phone: cData.data.phone || '' })
      }
    }).finally(() => setLoading(false))
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (data.error) setMessage(`Error: ${data.error}`)
      else { setMessage('Profile updated successfully!'); setProfile(data.data) }
    } catch { setMessage('Failed to save') }
    finally { setSaving(false); setTimeout(() => setMessage(''), 3000) }
  }

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/settings/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      })
      const data = await res.json()
      if (data.error) setMessage(`Error: ${data.error}`)
      else { setMessage('Company updated successfully!'); setCompany(data.data) }
    } catch { setMessage('Failed to save') }
    finally { setSaving(false); setTimeout(() => setMessage(''), 3000) }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Settings" description="Manage your account and company settings" />
        <div className="mt-6 space-y-4">
          {[1,2].map(i => <div key={i} className="h-40 rounded-lg border bg-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and company settings" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {(['profile', 'company', 'security'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveSection(tab)
              if (tab === 'security') loadMfa()
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeSection === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'profile' ? 'Profile Settings' : tab === 'company' ? 'Company Settings' : 'Security (2FA)'}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${
          message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {activeSection === 'profile' && profile && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
          <form onSubmit={saveProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+1234567890"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {activeSection === 'company' && company && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Company Settings</h3>
          <form onSubmit={saveCompany} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={companyForm.name}
                onChange={e => setCompanyForm(c => ({ ...c, name: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input
                type="text"
                value={companyForm.domain}
                onChange={e => setCompanyForm(c => ({ ...c, domain: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={companyForm.phone}
                onChange={e => setCompanyForm(c => ({ ...c, phone: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+1234567890"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Company'}
            </button>
          </form>
        </div>
      )}
      {activeSection === 'security' && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-1">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add an extra layer of security with an authenticator app (Google Authenticator, Authy, etc.).
            Once enabled, you&apos;ll be asked for a code every time you sign in.
          </p>

          {mfaStatus && (
            <div className="p-3 rounded-lg mb-4 text-sm bg-green-50 text-green-700 border border-green-200">{mfaStatus}</div>
          )}
          {mfaError && (
            <div className="p-3 rounded-lg mb-4 text-sm bg-red-50 text-red-700 border border-red-200">{mfaError}</div>
          )}

          {mfaFactors.length > 0 ? (
            <div className="space-y-3 max-w-lg">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Authenticator app</p>
                  <p className="text-xs text-muted-foreground">Active · used at every sign-in</p>
                </div>
                <button
                  onClick={() => disableMfa(mfaFactors[0].id)}
                  disabled={busy}
                  className="rounded-md border px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-white disabled:opacity-50"
                >
                  Disable
                </button>
              </div>
            </div>
          ) : enrollData ? (
            <div className="space-y-4 max-w-lg">
              <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
                <p className="font-medium mb-2">1. Scan the QR code with your authenticator app</p>
                {enrollData.qr && enrollData.qr.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={enrollData.qr} alt="2FA QR code" className="h-44 w-44 rounded bg-white p-2" />
                ) : (
                  <p className="font-mono text-xs break-all text-muted-foreground">{enrollData.uri}</p>
                )}
                <p className="text-xs text-muted-foreground mt-3">Can&apos;t scan? Manually enter this secret:</p>
                <p className="font-mono text-xs bg-background border rounded p-2 mt-1 select-all break-all">{enrollData.secret}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">2. Enter the 6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={enrollCode}
                  onChange={e => setEnrollCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={verifyEnroll}
                  disabled={busy || enrollCode.length !== 6}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button
                  onClick={cancelEnroll}
                  disabled={busy}
                  className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startEnroll}
              disabled={busy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? 'Starting...' : 'Enable 2FA'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
