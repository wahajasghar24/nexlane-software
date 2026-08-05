'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

const typeIcons: Record<string, string> = {
  call: '📞',
  meeting: '🤝',
  email: '📧',
  follow_up: '🔔',
  task: '✅',
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [assignedFilter, setAssignedFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '30' })
    if (typeFilter) params.set('type', typeFilter)
    if (entityTypeFilter) params.set('entity_type', entityTypeFilter)
    if (assignedFilter) params.set('assigned_to', assignedFilter)
    fetch(`/api/crm/activities?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setActivities(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 30) || 1)
      })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))
  }, [page, typeFilter, entityTypeFilter, assignedFilter])

  const groupByDate = () => {
    const groups: Record<string, any[]> = {}
    activities.forEach(a => {
      const date = a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Unknown'
      if (!groups[date]) groups[date] = []
      groups[date].push(a)
    })
    return groups
  }

  return (
    <div>
      <PageHeader title="Activities" description="View all CRM activities" />

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All Types</option>
          <option value="call">Call</option>
          <option value="meeting">Meeting</option>
          <option value="email">Email</option>
          <option value="follow_up">Follow Up</option>
          <option value="task">Task</option>
        </select>
        <select value={entityTypeFilter} onChange={e => { setEntityTypeFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All Entities</option>
          <option value="lead">Lead</option>
          <option value="deal">Deal</option>
          <option value="company">Company</option>
          <option value="contact">Contact</option>
        </select>
        <input type="text" placeholder="Assigned to..." value={assignedFilter} onChange={e => { setAssignedFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="flex gap-3">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-muted rounded mb-1" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState title="No activities found" description="Activities from CRM actions will appear here" />
      ) : (
        <>
          <div className="rounded-lg border bg-card">
            {Object.entries(groupByDate()).map(([date, items]) => (
              <div key={date}>
                <div className="sticky top-0 bg-muted/50 px-4 py-2 border-b">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">{date}</p>
                </div>
                {items.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 p-4 border-b last:border-b-0 hover:bg-muted/30">
                    <span className="text-lg flex-shrink-0">{typeIcons[act.type] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium capitalize">{act.type?.replace(/_/g, ' ')}</p>
                        {act.entity_type && (
                          <span className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{act.entity_type}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{act.description || act.notes || '-'}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        {act.assigned_to && <span>Assigned to: {typeof act.assigned_to === 'object' ? act.assigned_to?.name : act.assigned_to}</span>}
                        {act.created_at && <span>{new Date(act.created_at).toLocaleTimeString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
