'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

type Tab = 'overview' | 'modules' | 'milestones' | 'tasks'

const statusColors: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-600',
  pending: 'bg-gray-100 text-gray-600',
  overdue: 'bg-red-100 text-red-600',
}

export default function ProjectDetailPage() {
  const t = useTranslations('hr')
  const params = useParams()
  const id = params.id as string
  const [project, setProject] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`)
        if (res.ok) {
          const d = await res.json()
          const data = d.data || d
          if (!ignore) {
            setProject(data)
            setMembers(data.members || [])
            setModules(data.modules || [])
            setMilestones(data.milestones || [])
          }
        }
        const tasksRes = await fetch(`/api/tasks?project_id=${id}&limit=50`)
        if (tasksRes.ok) {
          const tData = await tasksRes.json()
          if (!ignore) setTasks(tData.data || tData || [])
        }
      } catch {} finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [id])


  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('projects_detail.tab_overview') },
    { key: 'modules', label: t('projects_detail.tab_modules') },
    { key: 'milestones', label: t('projects_detail.tab_milestones') },
    { key: 'tasks', label: t('projects_detail.tab_tasks') },
  ]

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>
  if (!project) return <EmptyState title={t('projects_detail.not_found')} />

  const getMemberName = (m: any) => m.profile?.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.name || t('common.unnamed')

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.client_name ? t('projects_detail.client_value', { name: project.client_name }) : ''}
        actions={
          <div className="flex gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status] || ''}`}>
              {project.status?.replace(/_/g, ' ')}
            </span>
            <Link href={`/projects/${id}/edit`} className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">{t('common.edit')}</Link>
          </div>
        }
      />

      <div className="border-b mb-6">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('projects_detail.project_info')}</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('common.status')}</dt><dd className="capitalize">{project.status?.replace(/_/g, ' ')}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('common.priority')}</dt><dd className="capitalize">{project.priority}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('fields.client')}</dt><dd>{project.client_name || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('fields.start')}</dt><dd>{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('fields.end')}</dt><dd>{project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('fields.budget')}</dt><dd>{project.budget ? `$${project.budget}` : '-'}</dd></div>
            </dl>
            {project.description && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">{t('common.description')}</p>
                <p className="text-sm">{project.description}</p>
              </div>
            )}
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="grid gap-4 grid-cols-3">
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-xs text-muted-foreground">{t('common.members')}</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-2xl font-bold">{modules.length}</p>
                <p className="text-xs text-muted-foreground">{t('common.modules')}</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-xs text-muted-foreground">{t('common.tasks')}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-3">{t('common.team_members')}</h3>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('projects_detail.no_members_assigned')}</p>
              ) : (
                <div className="space-y-2">
                  {members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2 text-sm">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {getMemberName(m).charAt(0).toUpperCase()}
                      </div>
                      <Link href={`/employees/${m.employee_id || m.id}`} className="hover:text-primary">{getMemberName(m)}</Link>
                      <span className="text-xs text-muted-foreground ml-auto">{m.role || t('common.member')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="rounded-lg border bg-card">
          {modules.length === 0 ? (
            <EmptyState title={t('projects_detail.no_modules')} description={t('projects_detail.no_modules_desc')} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">{t('fields.module')}</th>
                  <th className="text-left p-3 text-sm font-medium">{t('common.status')}</th>
                  <th className="text-left p-3 text-sm font-medium">{t('projects_detail.timeline')}</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod: any) => (
                  <tr key={mod.id} className="border-b last:border-b-0">
                    <td className="p-3 font-medium">{mod.name}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[mod.status] || ''}`}>
                        {mod.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {mod.start_date ? new Date(mod.start_date).toLocaleDateString() : ''}
                      {mod.end_date ? ` - ${new Date(mod.end_date).toLocaleDateString()}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="rounded-lg border bg-card">
          {milestones.length === 0 ? (
            <EmptyState title={t('projects_detail.no_milestones')} description={t('projects_detail.no_milestones_desc')} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">{t('projects_detail.milestone')}</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">{t('common.due_date')}</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((ms: any) => (
                  <tr key={ms.id} className="border-b last:border-b-0">
                    <td className="p-3 font-medium">{ms.name}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[ms.status] || ''}`}>
                        {ms.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{ms.due_date ? new Date(ms.due_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="rounded-lg border bg-card">
          {tasks.length === 0 ? (
            <EmptyState title={t('projects_detail.no_tasks')} description={t('projects_detail.no_tasks_desc')} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">{t('common.tasks')}</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">{t('common.priority')}</th>
                  <th className="text-left p-3 text-sm font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t: any) => (
                  <tr key={t.id} className="border-b last:border-b-0">
                    <td className="p-3"><Link href={`/tasks/${t.id}`} className="font-medium hover:text-primary">{t.title}</Link></td>
                    <td className="p-3 text-sm capitalize">{t.status?.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-sm capitalize">{t.priority}</td>
                    <td className="p-3 text-sm text-muted-foreground">{t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
