'use client'

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
    { key: 'overview', label: 'Overview' },
    { key: 'projects', label: 'Projects' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'work-logs', label: 'Work Logs' },
    { key: 'activity', label: 'Activity' },
    { key: 'skills', label: 'Skills' },
  ]

  const displayName = employee
    ? employee.profile?.full_name || 'Unnamed'
    : ''

  const totalHours = workLogs.reduce((sum: number, wl: any) => sum + (wl.hours || 0), 0)

  return (
    <div>
      <PageHeader
        title={displayName || 'Employee'}
        description={employee?.position || ''}
        actions={
          <div className="flex gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[employee?.employment_status || ''] || ''}`}>
              {employee?.employment_status?.replace(/_/g, ' ') || 'N/A'}
            </span>
            <Link href={`/employees/${id}/edit`} className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">Edit</Link>
          </div>
        }
      />

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      ) : !employee ? (
        <EmptyState title="Employee not found" description="This employee may have been deleted" />
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
                <h3 className="font-semibold mb-3">Basic Info</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd>{displayName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{employee.profile?.email || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{employee.profile?.phone || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Department</dt>
                    <dd>{employee.department?.name || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Designation</dt>
                    <dd>{employee.designation?.name || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Position</dt>
                    <dd>{employee.position || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Employee Code</dt>
                    <dd>{employee.employee_code || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Hire Date</dt>
                    <dd>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}</dd>
                  </div>
                </dl>
                {employee.bio && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm">{employee.bio}</p>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid gap-4 grid-cols-3">
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{projects.length}</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{tasks.length}</p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{totalHours}h</p>
                    <p className="text-xs text-muted-foreground">Hours Logged</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="rounded-lg border">
              {projects.length === 0 ? (
                <EmptyState title="No projects assigned" />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Project</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p: any) => (
                      <tr key={p.id} className="border-b last:border-b-0">
                        <td className="p-3"><Link href={`/projects/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link></td>
                        <td className="p-3 text-sm text-muted-foreground capitalize">{p.status?.replace(/_/g, ' ')}</td>
                        <td className="p-3 text-sm text-muted-foreground">{p.role || 'Member'}</td>
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
                <EmptyState title="No tasks assigned" />
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
                <EmptyState title="No work logs found" />
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
                <EmptyState title="No activity found" />
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
                <h3 className="font-semibold mb-3">Current Skills</h3>
                {skills.length === 0 ? (
                  <EmptyState title="No skills added" />
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
                <h3 className="font-semibold mb-3">Add Skill</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Skill name"
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  <select
                    value={newSkillProficiency}
                    onChange={e => setNewSkillProficiency(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <button
                    onClick={addSkill}
                    className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Add Skill
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
