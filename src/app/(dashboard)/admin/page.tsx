'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface AdminStat {
  label: string
  value: string | number
  color: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')

  const stats: AdminStat[] = [
    { label: 'Total Companies', value: '—', color: 'bg-blue-500' },
    { label: 'Total Users', value: '—', color: 'bg-green-500' },
    { label: 'Active Projects', value: '—', color: 'bg-purple-500' },
    { label: 'System Jobs', value: '—', color: 'bg-orange-500' },
  ]

  return (
    <div>
      <PageHeader title="Admin Panel" description="System administration and settings" />

      <div className="flex gap-1 mb-6 border-b">
        {(['overview', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'overview' ? 'Overview' : 'Settings'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${s.color}`} />
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold mt-2">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                { label: 'View Audit Log', href: '/admin/audit' },
                { label: 'Manage Jobs', href: '/admin/jobs' },
                { label: 'Observability', href: '/admin/observability' },
                { label: 'System Events', href: '/admin/events' },
              ].map(action => (
                <a
                  key={action.label}
                  href={action.href}
                  className="rounded-lg border p-3 text-sm font-medium hover:bg-accent text-center"
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">System Settings</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure global system settings for your Nexlane instance.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Prevent user access during maintenance</p>
              </div>
              <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Default Language</p>
                <p className="text-xs text-muted-foreground">Set the default system language</p>
              </div>
              <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Date Format</p>
                <p className="text-xs text-muted-foreground">Configure global date formatting</p>
              </div>
              <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
