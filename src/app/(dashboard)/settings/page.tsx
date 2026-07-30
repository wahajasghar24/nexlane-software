'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'

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
  const [activeSection, setActiveSection] = useState<'profile' | 'company'>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [companyForm, setCompanyForm] = useState({ name: '', domain: '', phone: '' })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/settings/profile').then(r => r.json()),
      fetch('/api/settings/company').then(r => r.json()),
    ]).then(([pData, cData]) => {
      if (pData.data) {
        setProfile(pData.data)
        setProfileForm({ name: pData.data.name || '', phone: pData.data.phone || '' })
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
        {(['profile', 'company'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeSection === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'profile' ? 'Profile Settings' : 'Company Settings'}
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
    </div>
  )
}
