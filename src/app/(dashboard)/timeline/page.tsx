'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface ActivityItem {
  id: string
  action: string
  description?: string
  entity_type: string
  entity_id: string
  actor_name?: string
  actor_id?: string
  created_at: string
}

export default function TimelinePage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [employees, setEmployees] = useState<any[]>([])

  const load = async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: '20' })
      if (employeeFilter) params.set('employee_id', employeeFilter)
      if (actionFilter) params.set('action', actionFilter)
      const res = await fetch(`/api/timeline?${params}`)
      if (res.ok) {
        const d = await res.json()
        const items = d.data || d || []
        const raw = Array.isArray(items) ? items : []
        setHasMore(raw.length === 20)
        let list = raw
        if (entityFilter) {
          list = raw.filter(item => item.entity_type === entityFilter)
        }
        setActivities(prev => append ? [...prev, ...list] : list)
      }
    } catch {} finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setPage(1)
    load(1)
  }, [employeeFilter, entityFilter, actionFilter])

  useEffect(() => {
    fetch('/api/employees?limit=200').then(r => r.json()).then(d => setEmployees(d.data || d || [])).catch(() => {})
  }, [])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    load(nextPage, true)
  }

  const getEntityLink = (item: ActivityItem) => {
    const map: Record<string, string> = {
      employee: '/employees/',
      project: '/projects/',
      task: '/tasks/',
    }
    const prefix = map[item.entity_type]
    return prefix ? `${prefix}${item.entity_id}` : null
  }

  const getEntityIcon = (type: string) => {
    const icons: Record<string, string> = {
      employee: '●', project: '◆', task: '☐',
      work_log: '⏱', comment: '💬', department: '🏢',
    }
    return icons[type] || '○'
  }

  const getDisplayName = (e: any) => e.profile?.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || e.name || 'Unknown'

  return (
    <div>
      <PageHeader
        title="Timeline"
        description="Activity feed across the organization"
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All Actors</option>
          {employees.map((emp: any) => (
            <option key={emp.id} value={emp.id}>{getDisplayName(emp)}</option>
          ))}
        </select>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All Entity Types</option>
          <option value="employee">Employee</option>
          <option value="project">Project</option>
          <option value="task">Task</option>
          <option value="work_log">Work Log</option>
          <option value="comment">Comment</option>
          <option value="department">Department</option>
        </select>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All Actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="assigned">Assigned</option>
          <option value="commented">Commented</option>
          <option value="status_changed">Status Changed</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-3 w-3 rounded-full bg-muted mt-1 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-64 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState title="No activity found" description="Try adjusting your filters" />
      ) : (
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
          <div className="space-y-4">
            {activities.map((item) => {
              const link = getEntityLink(item)
              const date = new Date(item.created_at)
              return (
                <div key={item.id} className="relative flex items-start gap-4 pl-6">
                  <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[8px]">
                    {getEntityIcon(item.entity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-sm">
                        <span className="font-medium">{item.actor_name || 'System'}</span>
                        {' '}{item.action || 'performed an action'}
                        {link ? (
                          <Link href={link} className="text-primary hover:underline ml-1">
                            {item.entity_type} #{item.entity_id?.slice(0, 8)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground ml-1">
                            {item.entity_type} #{item.entity_id?.slice(0, 8)}
                          </span>
                        )}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
