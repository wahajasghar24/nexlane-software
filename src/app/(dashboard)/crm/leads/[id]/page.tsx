'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  new: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  qualified: 'bg-green-100 text-green-800',
  unqualified: 'bg-orange-100 text-orange-800',
  converted: 'bg-purple-100 text-purple-800',
}

export default function LeadDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [lead, setLead] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  useEffect(() => { load() }, [id])

  const load = async () => {
    try {
      const res = await fetch(`/api/crm/leads/${id}`)
      if (res.ok) {
        const d = await res.json()
        setLead(d.data || d)
      }
      const notesRes = await fetch(`/api/crm/leads/${id}/notes`)
      if (notesRes.ok) {
        const n = await notesRes.json()
        setNotes(n.data || n || [])
      }
      const actRes = await fetch(`/api/crm/activities?entity_type=lead&entity_id=${id}&limit=20`)
      if (actRes.ok) {
        const a = await actRes.json()
        setActivities(a.data || a || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    setAddingNote(true)
    try {
      const res = await fetch(`/api/crm/leads/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      })
      if (res.ok) {
        setNotes(prev => [...prev, { content: newNote, created_at: new Date().toISOString() }])
        setNewNote('')
      }
    } finally {
      setAddingNote(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this lead?')) return
    await fetch(`/api/crm/leads/${id}`, { method: 'DELETE' })
    window.location.href = '/crm/leads'
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>
  if (!lead) return <EmptyState title="Lead not found" />

  const assignedName = typeof lead.assigned_to === 'object' ? lead.assigned_to?.name : lead.assigned_to || '-'

  return (
    <div>
      <PageHeader
        title={lead.title || 'Untitled Lead'}
        description={`Contact: ${lead.name}`}
        actions={
          <div className="flex gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[lead.status] || ''}`}>{lead.status}</span>
            <Link href={`/crm/leads/${id}/edit`} className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">Edit</Link>
            <button onClick={() => {}} className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Convert to Deal</button>
            <button onClick={handleDelete} className="inline-flex items-center justify-center rounded-md border border-red-200 bg-background px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Lead Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{lead.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{lead.email || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{lead.phone || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Company</dt><dd>{lead.company || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Website</dt><dd>{lead.website || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Industry</dt><dd>{lead.industry || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Source</dt><dd className="capitalize">{lead.source || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Priority</dt><dd className="capitalize">{lead.priority}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Estimated Value</dt><dd>{lead.estimated_value ? `$${lead.estimated_value}` : '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Assigned To</dt><dd>{assignedName}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Created</dt><dd>{new Date(lead.created_at).toLocaleDateString()}</dd></div>
            </dl>
            {lead.notes && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{lead.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Notes</h3>
            <div className="flex gap-2 mb-3">
              <textarea rows={2} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." className="flex-1 rounded-md border bg-background px-3 py-2 text-sm" />
              <button onClick={addNote} disabled={addingNote || !newNote.trim()} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 self-end">
                {addingNote ? 'Adding...' : 'Add'}
              </button>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notes.map((n: any, i: number) => (
                  <div key={n.id || i} className="border-b last:border-b-0 pb-2 text-sm">
                    <p>{n.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Activity Timeline</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities recorded</p>
            ) : (
              <div className="space-y-3">
                {activities.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 text-sm">
                    <span className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                    <div>
                      <p className="capitalize font-medium">{act.type?.replace(/_/g, ' ')}</p>
                      <p className="text-muted-foreground">{act.description || act.notes || '-'}</p>
                      <p className="text-xs text-muted-foreground">{act.created_at ? new Date(act.created_at).toLocaleString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
