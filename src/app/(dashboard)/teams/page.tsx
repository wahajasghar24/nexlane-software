'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', lead_id: '', member_ids: [] as string[] })
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([
      fetch('/api/teams?limit=100').then(r => r.json()),
      fetch('/api/employees?limit=200').then(r => r.json()),
    ]).then(([tData, eData]) => {
      setTeams(tData.data || tData || [])
      setEmployees(eData.data || eData || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowModal(false)
        setForm({ name: '', description: '', lead_id: '', member_ids: [] })
        load()
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleMember = (id: string) => {
    setForm(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(id)
        ? prev.member_ids.filter(m => m !== id)
        : [...prev.member_ids, id],
    }))
  }

  const getDisplayName = (e: any) => e.profile?.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || e.name || 'Unnamed'

  return (
    <div>
      <PageHeader
        title="Teams"
        description="Manage teams and members"
        actions={
          <button onClick={() => setShowModal(true)} className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Create Team
          </button>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded mt-2" />
              <div className="flex -space-x-2 mt-3">
                {[...Array(3)].map((_, j) => <div key={j} className="h-8 w-8 rounded-full bg-muted border-2 border-background" />)}
              </div>
            </div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          title="No teams"
          description="Create your first team"
          action={<button onClick={() => setShowModal(true)} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Create Team</button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team: any) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold">{team.name}</h3>
              {team.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{team.description}</p>}
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>{team.member_count ?? team.members?.length ?? 0} members</span>
                {team.lead && <span className="ml-auto text-xs">Lead: {team.lead_name || 'N/A'}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Team</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team Lead</label>
                <select value={form.lead_id} onChange={e => setForm(prev => ({ ...prev, lead_id: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">Select lead</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{getDisplayName(emp)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Members</label>
                <div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-1">
                  {employees.map((emp: any) => (
                    <label key={emp.id} className="flex items-center gap-2 text-sm p-1 hover:bg-accent rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.member_ids.includes(emp.id)}
                        onChange={() => toggleMember(emp.id)}
                        className="rounded"
                      />
                      {getDisplayName(emp)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Team'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
