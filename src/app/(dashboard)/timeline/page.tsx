'use client'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('hr')
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [employees, setEmployees] = useState<any[]>([])

  const load = async (pageNum: number) => {
    const params = new URLSearchParams({ page: String(pageNum), limit: '20' })
    if (employeeFilter) params.set('employee_id', employeeFilter)
    if (actionFilter) params.set('action', actionFilter)
    const res = await fetch(`/api/timeline?${params}`)
    let list: ActivityItem[] = []
    let hasMore = false
    if (res.ok) {
      const d = await res.json()
      const items = d.data?.items || d.items || d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
      const raw = Array.isArray(items) ? items : []
      hasMore = raw.length === 20
      list = raw
      if (entityFilter) {
        list = raw.filter(item => item.entity_type === entityFilter)
      }
    }
    return { list, hasMore }
  }

  useEffect(() => {
    let ignore = false
    load(1).then(({ list, hasMore }) => {
      if (ignore) return
      setActivities(list)
      setHasMore(hasMore)
    }).catch(() => {
      if (!ignore) setActivities([])
    }).finally(() => {
      if (!ignore) setLoading(false)
    })
    return () => { ignore = true }
  }, [employeeFilter, entityFilter, actionFilter])

  useEffect(() => {
    fetch('/api/employees?limit=200').then(r => r.json()).then(d => setEmployees(d.data?.data || d.data || [])).catch(() => {})
  }, [])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    setLoadingMore(true)
    load(nextPage).then(({ list, hasMore }) => {
      setActivities(prev => [...prev, ...list])
      setHasMore(hasMore)
    }).finally(() => setLoadingMore(false))
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
        title={t('timeline.title')}
        description={t('timeline.description')}
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <select value={employeeFilter} onChange={e => { setPage(1); setEmployeeFilter(e.target.value) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">{t('timeline.all_actors')}</option>
          {employees.map((emp: any) => (
            <option key={emp.id} value={emp.id}>{getDisplayName(emp)}</option>
          ))}
        </select>
        <select value={entityFilter} onChange={e => { setPage(1); setEntityFilter(e.target.value) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">{t('timeline.all_entity_types')}</option>
          <option value="employee">{t('timeline.entity_employee')}</option>
          <option value="project">{t('timeline.entity_project')}</option>
          <option value="task">{t('timeline.entity_task')}</option>
          <option value="work_log">{t('timeline.entity_work_log')}</option>
          <option value="comment">{t('timeline.entity_comment')}</option>
          <option value="department">{t('timeline.entity_department')}</option>
        </select>
        <select value={actionFilter} onChange={e => { setPage(1); setActionFilter(e.target.value) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">{t('timeline.all_actions')}</option>
          <option value="created">{t('timeline.action_created')}</option>
          <option value="updated">{t('timeline.action_updated')}</option>
          <option value="deleted">{t('timeline.action_deleted')}</option>
          <option value="assigned">{t('timeline.action_assigned')}</option>
          <option value="commented">{t('timeline.action_commented')}</option>
          <option value="status_changed">{t('timeline.action_status_changed')}</option>
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
        <EmptyState title={t('timeline.no_activity')} description={t('timeline.no_activity_desc')} />
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
                        <span className="font-medium">{item.actor_name || t('common.system')}</span>
                        {' '}{item.action || t('timeline.performed_action')}
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
                {loadingMore ? t('common.loading') : t('timeline.load_more')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
