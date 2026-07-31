'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { StaggerGroup, StaggerItem } from '@/shared/components/motion'
import Link from 'next/link'

interface DashboardStats {
  total_employees: number
  active_projects: number
  open_tasks: number
  today_logs: number
  total_logs_hours: number
}

interface Activity {
  id: string
  action: string
  entity_type: string
  entity_id: string
  actor_name: string
  created_at: string
}

const icons = {
  employees: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  projects: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7h12"/><path d="M8 12h12"/><path d="M8 17h12"/><rect width="4" height="4" x="2" y="3"/><rect width="4" height="4" x="2" y="10"/><rect width="4" height="4" x="2" y="17"/></svg>,
  tasks: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z"/></svg>,
  logs: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  clock: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrow: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
}

const quickLinks = [
  { href: '/employees/new', label: 'New Employee', icon: icons.employees },
  { href: '/projects/new', label: 'New Project', icon: icons.projects },
  { href: '/tasks/new', label: 'New Task', icon: icons.tasks },
]

const kpiConfig = [
  { key: 'total_employees', label: 'Total Employees', icon: icons.employees, chip: 'bg-primary/10 text-primary' },
  { key: 'active_projects', label: 'Active Projects', icon: icons.projects, chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { key: 'open_tasks', label: 'Open Tasks', icon: icons.tasks, chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { key: 'today_logs', label: "Today's Work Logs", icon: icons.logs, chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
] as const

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/timeline?limit=10'),
        ])
        if (!ignore && statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.data || statsData)
        }
        if (!ignore && activityRes.ok) {
          const actData = await activityRes.json()
          setActivities(actData.data?.items || actData || [])
        }
      } catch {
        // API routes may not exist yet; show empty state
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to Nexlane"
        actions={
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-shadow hover:bg-primary/90 hover:shadow"
              >
                {q.icon}
                {q.label}
              </Link>
            ))}
            <Link href="/work-logs" className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-accent/60">
              <span className="text-muted-foreground">{icons.clock}</span>
              Log Work
            </Link>
          </div>
        }
      />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 animate-pulse">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded mt-3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <StaggerGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {kpiConfig.map((kpi) => (
              <StaggerItem key={kpi.key}>
                <div className="group rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{kpi.label}</p>
                      <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">{stats?.[kpi.key] ?? 0}</p>
                    </div>
                    <span className={`rounded-lg p-2.5 ${kpi.chip}`}>{kpi.icon}</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="font-semibold">Recent Activity</h3>
                <Link href="/timeline" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  View all {icons.arrow}
                </Link>
              </div>
              <div className="p-5">
                {activities.length === 0 ? (
                  <EmptyState title="No recent activity" description="Activity from your team will appear here" />
                ) : (
                  <StaggerGroup className="space-y-4">
                    {activities.map((act) => (
                      <StaggerItem key={act.id}>
                        <div className="flex items-start gap-3 text-sm">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {initials(act.actor_name)}
                          </span>
                          <div className="min-w-0 pt-0.5">
                            <p className="leading-snug">
                              <span className="font-medium">{act.actor_name}</span> {act.action}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(act.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerGroup>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
              <div className="p-5 border-b">
                <h3 className="font-semibold">Team Hours</h3>
              </div>
              <div className="p-5 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-5xl font-bold tracking-tight tabular-nums">{stats?.total_logs_hours ?? 0}</p>
                <p className="text-sm text-muted-foreground">Total hours logged across all work logs</p>
                <Link
                  href="/work-logs"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open Work Logs {icons.arrow}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
