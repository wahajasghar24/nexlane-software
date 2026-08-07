'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'

interface AdminStat {
  label: string
  value: string | number
  color: string
}

export default function AdminPage() {
  const t = useTranslations('hr')
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'jobs' | 'observability'>('overview')
  const [stats, setStats] = useState<AdminStat[]>([
    { label: t('admin.total_companies'), value: '—', color: 'bg-blue-500' },
    { label: t('admin.total_users'), value: '—', color: 'bg-green-500' },
    { label: t('admin.active_projects'), value: '—', color: 'bg-purple-500' },
    { label: t('admin.companies_today'), value: '—', color: 'bg-orange-500' },
  ])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadStats = () => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()).catch(() => ({ data: null })),
      fetch('/api/admin/audit-logs?limit=20').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([statsData, auditData]) => {
      if (statsData.data) {
        const s = statsData.data
        setStats([
          { label: 'Total Companies', value: s.totalCompanies ?? '—', color: 'bg-blue-500' },
          { label: 'Total Users', value: s.totalUsers ?? '—', color: 'bg-green-500' },
          { label: 'Active Projects', value: s.activeProjects ?? '—', color: 'bg-purple-500' },
          { label: 'Companies Today', value: s.companiesToday ?? '—', color: 'bg-orange-500' },
        ])
      }
      setAuditLogs(auditData.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadStats() }, [])

  return (
    <div>
      <PageHeader title={t('admin.title')} description={t('admin.description')} />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {[
          { key: 'overview', label: t('admin.tab_overview') },
          { key: 'audit', label: t('admin.tab_audit') },
          { key: 'jobs', label: t('admin.tab_jobs') },
          { key: 'observability', label: t('admin.tab_observability') },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${s.color}`} />
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold mt-2">{loading ? '...' : s.value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{t('admin.audit_log')}</h3>
          </div>
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t('admin.no_audit')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">{t('admin.action')}</th>
                    <th className="text-left p-3 font-medium">{t('admin.entity')}</th>
                    <th className="text-left p-3 font-medium">{t('common.user')}</th>
                    <th className="text-left p-3 font-medium">{t('common.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log: any, i: number) => (
                    <tr key={log.id || i} className="border-t">
                      <td className="p-3">{log.action}</td>
                      <td className="p-3 text-muted-foreground">{log.entity_type}/{log.entity_id?.slice(0,8)}</td>
                      <td className="p-3 text-muted-foreground">{log.user_id?.slice(0,8)}</td>
                      <td className="p-3 text-muted-foreground">{log.created_at ? new Date(log.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">{t('admin.system_jobs')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('admin.jobs_desc')}
          </p>
          <div className="space-y-3">
            {[
              { name: t('admin.profile_sync'), status: t('admin.no_recent_runs'), icon: '🔄' },
              { name: t('admin.email_notifications'), status: t('admin.no_recent_runs'), icon: '📧' },
              { name: t('admin.data_cleanup'), status: t('admin.no_recent_runs'), icon: '🧹' },
            ].map(job => (
              <div key={job.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{job.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{job.name}</p>
                    <p className="text-xs text-muted-foreground">{job.status}</p>
                  </div>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded">{t('admin.coming_soon')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observability Tab */}
      {activeTab === 'observability' && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">{t('admin.observability')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('admin.observability_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: t('admin.api_latency'), value: t('admin.not_available'), color: 'text-muted-foreground' },
              { label: t('admin.error_rate'), value: t('admin.not_available'), color: 'text-muted-foreground' },
              { label: t('admin.active_users'), value: t('admin.not_available'), color: 'text-muted-foreground' },
            ].map(m => (
              <div key={m.label} className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className={`text-lg font-semibold mt-1 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
