'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface Employee {
  id: string
  position?: string
  employment_status: string
  employee_code?: string
  bio?: string
  hire_date?: string
  department?: { id: string; name: string } | null
  designation?: { id: string; name: string } | null
  profile?: { full_name?: string; email?: string; phone?: string; avatar_url?: string } | null
}

interface Skill {
  id: string
  skill: string
  proficiency: string
}

type Tab = 'overview' | 'projects' | 'tasks' | 'work-logs' | 'activity' | 'skills'

export default function EmployeeDetailPage() {
  const t = useTranslations('hr')
  const params = useParams()
  const id = params.id as string
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [workLogs, setWorkLogs] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate')

  useEffect(() => {
    async function load() {
      try {
        const [empRes, skillsRes] = await Promise.all([
          fetch(`/api/employees/${id}`),
          fetch(`/api/employees/${id}/skills`),
        ])
        if (empRes.ok) {
          const empData = await empRes.json()
          const d = empData.data || empData
          setEmployee(d.employee || d)
          setProjects(d.projects || [])
          setTasks(d.tasks || [])
          setWorkLogs(d.work_logs || [])
          setActivity(d.activity || [])
        }
        if (skillsRes.ok) {
          const sData = await skillsRes.json()
          setSkills(sData.data || sData || [])
        }
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const addSkill = async () => {
    if (!newSkillName.trim()) return
    try {
      const res = await fetch(`/api/employees/${id}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: newSkillName, proficiency: newSkillProficiency }),
      })
      if (res.ok) {
        const data = await res.json()
        setSkills(prev => [...prev, data.data || data])
        setNewSkillName('')
      }
    } catch {}
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    terminated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('employees.tab_overview') },
    { key: 'projects', label: t('employees.tab_projects') },
    { key: 'tasks', label: t('employees.tab_tasks') },
    { key: 'work-logs', label: t('employees.tab_work_logs') },
    { key: 'activity', label: t('employees.tab_activity') },
    { key: 'skills', label: t('employees.tab_skills') },
  ]

  const displayName = employee
    ? employee.profile?.full_name || t('common.unnamed')
    : ''

  const totalHours = workLogs.reduce((sum: number, wl: any) => sum + (wl.hours || 0), 0)

  return (
    <div>
      <PageHeader
        title={displayName || t('employees.employee')}
        description={employee?.position || ''}
        actions={
          <div className="flex gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[employee?.employment_status || ''] || ''}`}>
              {employee?.employment_status?.replace(/_/g, ' ') || t('common.na')}
            </span>
            <Link href={`/employees/${id}/edit`} className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">{t('common.edit')}</Link>
          </div>
        }
      />

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      ) : !employee ? (
        <EmptyState title={t('employees.not_found')} description={t('employees.not_found_desc')} />
      ) : (
        <>
          <div className="border-b mb-6">
            <div className="flex gap-4 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
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
                <h3 className="font-semibold mb-3">{t('employees.basic_info')}</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('common.name')}</dt>
                    <dd>{displayName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('fields.email')}</dt>
                    <dd>{employee.profile?.email || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('fields.phone')}</dt>
                    <dd>{employee.profile?.phone || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('fields.department')}</dt>
                    <dd>{employee.department?.name || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('fields.designation')}</dt>
                    <dd>{employee.designation?.name || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('fields.position')}</dt>
                    <dd>{employee.position || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('employees.employee_code')}</dt>
                    <dd>{employee.employee_code || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('fields.hire_date')}</dt>
                    <dd>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}</dd>
                  </div>
                </dl>
                {employee.bio && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">{t('fields.bio')}</p>
                    <p className="text-sm">{employee.bio}</p>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid gap-4 grid-cols-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{projects.length}</p>
                    <p className="text-xs text-muted-foreground">{t('common.projects')}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{tasks.length}</p>
                    <p className="text-xs text-muted-foreground">{t('common.tasks')}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{totalHours}h</p>
                    <p className="text-xs text-muted-foreground">{t('employees.hours_logged')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="rounded-lg border">
              {projects.length === 0 ? (
                <EmptyState title={t('employees.no_projects')} />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('fields.project')}</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p: any) => (
                      <tr key={p.id} className="border-b last:border-b-0">
                        <td className="p-3"><Link href={`/projects/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link></td>
                        <td className="p-3 text-sm text-muted-foreground capitalize">{p.status?.replace(/_/g, ' ')}</td>
                        <td className="p-3 text-sm text-muted-foreground">{p.role || t('common.member')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="rounded-lg border">
              {tasks.length === 0 ? (
                <EmptyState title={t('employees.no_tasks')} />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Task</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Priority</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t: any) => (
                      <tr key={t.id} className="border-b last:border-b-0">
                        <td className="p-3"><Link href={`/tasks/${t.id}`} className="font-medium hover:text-primary">{t.title}</Link></td>
                        <td className="p-3 text-sm text-muted-foreground capitalize">{t.status?.replace(/_/g, ' ')}</td>
                        <td className="p-3 text-sm text-muted-foreground capitalize">{t.priority}</td>
                        <td className="p-3 text-sm text-muted-foreground">{t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'work-logs' && (
            <div className="rounded-lg border">
              {workLogs.length === 0 ? (
                <EmptyState title={t('employees.no_work_logs')} />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Hours</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workLogs.map((wl: any) => (
                      <tr key={wl.id} className="border-b last:border-b-0">
                        <td className="p-3 text-sm">{new Date(wl.log_date || wl.date).toLocaleDateString()}</td>
                        <td className="p-3 text-sm">{wl.hours}h</td>
                        <td className="p-3 text-sm text-muted-foreground">{wl.description || '-'}</td>
                        <td className="p-3 text-sm capitalize">{wl.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="rounded-lg border bg-card">
              {activity.length === 0 ? (
                <EmptyState title={t('employees.no_activity')} />
              ) : (
                <div className="p-4 space-y-3">
                  {activity.map((act: any) => (
                    <div key={act.id} className="flex items-start gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p>{act.action || act.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(act.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold mb-3">{t('employees.current_skills')}</h3>
                {skills.length === 0 ? (
                  <EmptyState title={t('employees.no_skills')} />
                ) : (
                  <div className="space-y-2">
                    {skills.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-md border p-2">
                        <span className="text-sm font-medium">{s.skill}</span>
                        <span className="text-xs text-muted-foreground capitalize">{s.proficiency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold mb-3">{t('employees.add_skill')}</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t('employees.skill_name')}
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  <select
                    value={newSkillProficiency}
                    onChange={e => setNewSkillProficiency(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="beginner">{t('proficiency.beginner')}</option>
                    <option value="intermediate">{t('proficiency.intermediate')}</option>
                    <option value="advanced">{t('proficiency.advanced')}</option>
                    <option value="expert">{t('proficiency.expert')}</option>
                  </select>
                  <button
                    onClick={addSkill}
                    className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {t('employees.add_skill')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
