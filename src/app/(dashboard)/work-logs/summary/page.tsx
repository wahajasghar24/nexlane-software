'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface EmployeeSummary {
  employee_id: string
  employee_name: string
  total_hours: number
  log_count: number
  approved_hours: number
}

export default function WorkLogsSummaryPage() {
  const t = useTranslations('hr')
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly')
  const [summary, setSummary] = useState<EmployeeSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ period: view, limit: '50' })
    fetch(`/api/work-logs/summary?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.logs || (d?.data) || (Array.isArray(d) ? d : [])
        setSummary(Array.isArray(data) ? data : [])
      })
      .catch(() => setSummary([]))
      .finally(() => setLoading(false))
  }, [view])

  const maxHours = Math.max(...summary.map(s => s.total_hours), 1)
  const totalHoursAll = summary.reduce((sum, s) => sum + s.total_hours, 0)
  const avgHoursPerPerson = summary.length > 0 ? totalHoursAll / summary.length : 0

  return (
    <div>
      <PageHeader
        title={t('work_logs_summary.title')}
        description={t('work_logs_summary.description')}
      />

      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setView('weekly')}
          className={`rounded-md px-3 py-2 text-sm font-medium ${view === 'weekly' ? 'bg-primary text-primary-foreground' : 'border bg-background hover:bg-accent'}`}
        >
          {t('work_logs_summary.weekly')}
        </button>
        <button
          onClick={() => setView('monthly')}
          className={`rounded-md px-3 py-2 text-sm font-medium ${view === 'monthly' ? 'bg-primary text-primary-foreground' : 'border bg-background hover:bg-accent'}`}
        >
          {t('work_logs_summary.monthly')}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t('work_logs_summary.total_hours')}</p>
          <p className="text-2xl font-bold">{totalHoursAll}h</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t('work_logs_summary.active_employees')}</p>
          <p className="text-2xl font-bold">{summary.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t('work_logs_summary.avg_hours')}</p>
          <p className="text-2xl font-bold">{avgHoursPerPerson.toFixed(1)}h</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-4 animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 flex-1 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : summary.length === 0 ? (
        <EmptyState title={t('work_logs_summary.no_data')} description={t('work_logs_summary.no_data_desc', { view })} />
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{t('work_logs_summary.hours_per_employee')}</h3>
          </div>
          <div className="p-4 space-y-4">
            {summary.map(s => {
              const pct = (s.total_hours / maxHours) * 100
              return (
                <div key={s.employee_id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.employee_name || t('common.unknown')}</span>
                    <span className="text-muted-foreground">{s.total_hours}h ({s.log_count} logs, {s.approved_hours}h approved)</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
