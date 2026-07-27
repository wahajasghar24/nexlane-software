'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/timeline?limit=10'),
        ])
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.data || statsData)
        }
        if (activityRes.ok) {
          const actData = await activityRes.json()
          setActivities(actData.data || actData || [])
        }
      } catch {
        // API routes may not exist yet; show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to Nexlane"
        actions={
          <div className="flex gap-2">
            <Link href="/employees/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Employee</Link>
            <Link href="/projects/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Project</Link>
            <Link href="/tasks/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Task</Link>
            <Link href="/work-logs" className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">Log Work</Link>
          </div>
        }
      />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">{stats?.total_employees ?? 0}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">{stats?.active_projects ?? 0}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Open Tasks</p>
              <p className="text-2xl font-bold">{stats?.open_tasks ?? 0}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Today&apos;s Work Logs</p>
              <p className="text-2xl font-bold">{stats?.today_logs ?? 0}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="p-4">
                {activities.length === 0 ? (
                  <EmptyState title="No recent activity" description="Activity from your team will appear here" />
                ) : (
                  <div className="space-y-3">
                    {activities.map((act) => (
                      <div key={act.id} className="flex items-start gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div>
                          <p><span className="font-medium">{act.actor_name}</span> {act.action}</p>
                          <p className="text-xs text-muted-foreground">{new Date(act.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


          </div>
        </>
      )}
    </div>
  )
}
