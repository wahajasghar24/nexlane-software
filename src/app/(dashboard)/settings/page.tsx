'use client'

import { useTranslations } from 'next-intl'

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
  const t = useTranslations('misc')
  const [activeSection, setActiveSection] = useState<'profile' | 'company' | 'security' | 'email'>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [companyForm, setCompanyForm] = useState({ name: '', domain: '', phone: '', base_currency: 'AED' })

  // --- MFA state ---
  const [mfaFactors, setMfaFactors] = useState<{ id: string; friendly_name?: string }[]>([])
  const [mfaStatus, setMfaStatus] = useState('')
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [enrollData, setEnrollData] = useState<{ id: string; qr?: string; secret: string; uri: string } | null>(null)
  const [enrollCode, setEnrollCode] = useState('')
  const [busy, setBusy] = useState(false)

  // --- Email config state ---
  const [emailForm, setEmailForm] = useState({ api_key: '', from_email: '' })
  const [testTo, setTestTo] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  const loadMfa = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.mfa.listFactors()
      setMfaFactors((data?.totp || []).filter(f => f.status === 'verified').map(f => ({ id: f.id, friendly_name: f.friendly_name })))
      setMfaError(null)
    } catch { setMfaError(t('settings_2fa_load_failed')) }
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
    } catch (e) { setMfaError(e instanceof Error ? e.message : t('settings_2fa_enroll_failed')) }
    finally { setBusy(false) }
  }

  const verifyEnroll = async () => {
    setBusy(true)
    setMfaError(null)
    try {
      const supabase = createClient()
      if (!enrollData) throw new Error(t('settings_2fa_no_pending'))
      const { data: challenge, error: cError } = await supabase.auth.mfa.challenge({ factorId: enrollData.id })
      if (cError) throw cError
      const { error: vError } = await supabase.auth.mfa.verify({ factorId: enrollData.id, challengeId: challenge.id, code: enrollCode })
      if (vError) throw new Error(t('settings_2fa_invalid_code'))
      setEnrollData(null)
      setEnrollCode('')
      setMfaStatus(t('settings_2fa_connected'))
      await loadMfa()
      // Verify response upgrades the session to AAL2; guard the edge case where it didn't
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.currentLevel !== 'aal2') {
        await supabase.auth.signOut()
        window.location.href = '/login?mfa=enabled'
      }
    } catch (e) { setMfaError(e instanceof Error ? e.message : t('settings_2fa_verify_failed')) }
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
    if (!confirm(t('settings_2fa_disable_confirm'))) return
    setBusy(true)
    setMfaError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw error
      setMfaStatus(t('settings_2fa_disabled'))
      await loadMfa()
    } catch (e) { setMfaError(e instanceof Error ? e.message : t('settings_2fa_disable_failed')) }
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
        setCompanyForm({ name: cData.data.name || '', domain: cData.data.domain || '', phone: cData.data.phone || '', base_currency: cData.data.base_currency || 'AED' })
        // Load email config from company_settings if present
        if (cData.data.email_config) {
          setEmailForm(cData.data.email_config)
        }
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
      else { setMessage(t('settings_profile_updated')); setProfile(data.data) }
    } catch { setMessage(t('settings_save_failed')) }
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
      else { setMessage(t('settings_company_updated')); setCompany(data.data) }
    } catch { setMessage('Failed to save') }
    finally { setSaving(false); setTimeout(() => setMessage(''), 3000) }
  }

  const saveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setEmailMessage('')
    try {
      const res = await fetch('/api/settings/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_config: emailForm }),
      })
      const data = await res.json()
      if (data.error) setEmailMessage(`Error: ${data.error}`)
      else setEmailMessage(t('settings_email_config_saved'))
    } catch { setEmailMessage(t('settings_save_failed')) }
    finally { setSaving(false); setTimeout(() => setEmailMessage(''), 3000) }
  }

  const sendTestEmail = async () => {
    if (!testTo) { setEmailMessage(t('settings_email_test_to_required')); return }
    setSendingTest(true); setEmailMessage('')
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testTo, subject: 'Nexlane Test Email', body: 'This is a test email from Nexlane ERP.' }),
      })
      const data = await res.json()
      if (data.sent) setEmailMessage(t('settings_email_test_sent'))
      else setEmailMessage(t('settings_email_test_failed'))
    } catch { setEmailMessage(t('settings_email_test_failed')) }
    finally { setSendingTest(false); setTimeout(() => setEmailMessage(''), 5000) }
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
        {(['profile', 'company', 'security', 'email'] as const).map(tab => (
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
            {tab === 'profile' ? t('settings_tab_profile') : tab === 'company' ? t('settings_tab_company') : tab === 'security' ? t('settings_tab_security') : t('settings_tab_email')}
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
          <h3 className="text-lg font-semibold mb-4">{t('settings_profile_title')}</h3>
          <form onSubmit={saveProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings_email')}</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">{t('settings_email_fixed')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings_name')}</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={t('settings_name_placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings_phone')}</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+123****7890"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? t('settings_saving') : t('settings_save_profile')}
            </button>
          </form>
        </div>
      )}

      {activeSection === 'company' && company && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings_company_title')}</h3>
          <form onSubmit={saveCompany} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings_company_name')}</label>
              <input
                type="text"
                value={companyForm.name}
                onChange={e => setCompanyForm(c => ({ ...c, name: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={t('settings_company_name_placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings_domain')}</label>
              <input
                type="text"
                value={companyForm.domain}
                onChange={e => setCompanyForm(c => ({ ...c, domain: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={t('settings_domain_placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={companyForm.phone}
                onChange={e => setCompanyForm(c => ({ ...c, phone: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+123****7890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings_base_currency') || 'Base Currency'}</label>
              <select
                value={companyForm.base_currency}
                onChange={e => setCompanyForm(c => ({ ...c, base_currency: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="AED">AED — UAE Dirham</option>
                <option value="USD">USD — US Dollar</option>
                <option value="QAR">QAR — Qatari Riyal</option>
                <option value="PKR">PKR — Pakistani Rupee</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="SAR">SAR — Saudi Riyal</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? t('settings_saving') : t('settings_save_company')}
            </button>
          </form>
        </div>
      )}
      {activeSection === 'security' && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-1">{t('settings_2fa_title')}</h3>
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
                  <img src={enrollData.qr} alt={t('settings_2fa_qr_alt')} className="h-44 w-44 rounded bg-white p-2" />
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
                  placeholder={t('settings_2fa_code_placeholder')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={verifyEnroll}
                  disabled={busy || enrollCode.length !== 6}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy ? t('settings_2fa_verifying') : t('settings_2fa_verify_enable')}
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
              {busy ? t('settings_2fa_starting') : t('settings_2fa_enable')}
            </button>
          )}
        </div>
      )}

      {activeSection === 'email' && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings_email_config_title')}</h3>

          {emailMessage && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${
              emailMessage.startsWith('Error') || emailMessage.includes('failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {emailMessage}
            </div>
          )}

          <form onSubmit={saveEmailConfig} className="space-y-4 max-w-lg mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings_email_api_key')}</label>
              <input
                type="password"
                value={emailForm.api_key}
                onChange={e => setEmailForm(f => ({ ...f, api_key: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={t('settings_email_api_key_placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings_email_from')}</label>
              <input
                type="email"
                value={emailForm.from_email}
                onChange={e => setEmailForm(f => ({ ...f, from_email: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="noreply@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? t('settings_saving') : t('settings_save_email_config')}
            </button>
          </form>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">{t('settings_email_test_send')}</h4>
            <div className="flex items-end gap-3 max-w-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">{t('settings_email_test_to')}</label>
                <input
                  type="email"
                  value={testTo}
                  onChange={e => setTestTo(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="test@example.com"
                />
              </div>
              <button onClick={sendTestEmail} disabled={sendingTest}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap">
                {sendingTest ? t('settings_email_sending') : t('settings_email_send_test')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
