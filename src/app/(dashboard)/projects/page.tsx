'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  client_name?: string
  status: string
  priority: string
  color?: string
  start_date?: string
  end_date?: string
  project_members?: { count: number }[] | number
  tasks?: { count: number }[] | number
}

const statusColors: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

export default function ProjectsPage() {
  const t = useTranslations('hr')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    fetch(`/api/projects?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setProjects(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, priorityFilter])

  const getMemberCount = (p: Project) => {
    if (typeof p.project_members === 'number') return p.project_members
    if (Array.isArray(p.project_members)) return p.project_members[0]?.count || 0
    return 0
  }

  const getTaskCount = (p: Project) => {
    if (typeof p.tasks === 'number') return p.tasks
    if (Array.isArray(p.tasks)) return p.tasks[0]?.count || 0
    return 0
  }

  return (
    <div>
      <PageHeader
        title={t('projects.title')}
        description={t('projects.description')}
        actions={
          <Link href="/projects/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t('projects.new')}
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder={t('projects.search')}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]"
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">{t('common.all_statuses')}</option>
          <option value="planning">{t('status.planning')}</option>
          <option value="active">{t('status.active')}</option>
          <option value="on_hold">{t('status.on_hold')}</option>
          <option value="completed">{t('status.completed')}</option>
          <option value="cancelled">{t('status.cancelled')}</option>
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">{t('common.all_priorities')}</option>
          <option value="low">{t('priority.low')}</option>
          <option value="medium">{t('priority.medium')}</option>
          <option value="high">{t('priority.high')}</option>
          <option value="urgent">{t('priority.urgent')}</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-muted" />
                <div className="h-5 w-48 bg-muted rounded" />
              </div>
              <div className="flex gap-4 mt-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title={t('projects.no_projects')}
          description={t('projects.no_projects_desc')}
          action={<Link href="/projects/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t('projects.new')}</Link>}
        />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {projects.map(p => (
              <div key={p.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: p.color || '#6366f1' }} />
                  <Link href={`/projects/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link>
                </div>
                <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground mb-2">
                  <span>{t('projects.client_value', { name: p.client_name || '-' })}{p.client_name || '-'}</span>
                  <span className="text-right">{getMemberCount(p)} {t('common.members')}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || ''}`}>
                      {p.status?.replace(/_/g, ' ')}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[p.priority] || ''}`}>
                      {p.priority}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/projects/${p.id}`} className="text-muted-foreground hover:text-primary">{t('common.view')}</Link>
                    <Link href={`/projects/${p.id}/edit`} className="text-muted-foreground hover:text-primary">{t('common.edit')}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table view */}
          <div className="rounded-lg border overflow-x-auto hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.name')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('fields.client')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.status')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.priority')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('projects.progress')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.members')}</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color || '#6366f1' }} />
                        <Link href={`/projects/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{p.client_name || '-'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || ''}`}>
                        {p.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[p.priority] || ''}`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden max-w-[100px]">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, getTaskCount(p) > 0 ? 60 : 0)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{getTaskCount(p)} {t('common.tasks')}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{getMemberCount(p)}</td>
                    <td className="p-3 text-right">
                      <Link href={`/projects/${p.id}`} className="text-sm text-muted-foreground hover:text-primary mr-2">View</Link>
                      <Link href={`/projects/${p.id}/edit`} className="text-sm text-muted-foreground hover:text-primary">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-muted-foreground">{t('common.page_of', { page, totalPages })}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">{t('common.previous')}</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">{t('common.next')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
