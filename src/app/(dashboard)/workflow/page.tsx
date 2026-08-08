'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface Approval {
  entityType: string
  entityId: string
  requestedBy: string
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected'
  resolvedBy?: string
  resolvedAt?: string
  reason?: string
}

export default function WorkflowPage() {
  const t = useTranslations('hr')
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [filter, setFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter ? `/api/workflow/approve?status=${filter}` : '/api/workflow/approve'
      const res = await fetch(url)
      const d = await res.json()
      const rows = Array.isArray(d?.data) ? d.data : []
      setApprovals(rows)
    } catch {
      setApprovals([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    ;(async () => { await load() })()
  }, [load])

  const act = async (entityType: string, entityId: string, action: 'approve' | 'reject') => {
    setActing(`${entityType}-${entityId}`)
    try {
      await fetch('/api/workflow/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId, action }),
      })
      await load()
    } catch { /* noop */ }
    setActing('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('workflow.title')}
        description={t('workflow.description')}
      />

      {/* Status filter */}
      <div className="flex gap-2">
        {[
          { value: '', label: t('workflow.all') },
          { value: 'pending', label: t('status.pending') },
          { value: 'approved', label: t('status.approved') },
          { value: 'rejected', label: t('status.rejected') },
        ].map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === s.value ? 'bg-primary text-primary-foreground' : 'border text-muted-foreground hover:bg-accent'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg border bg-card animate-pulse" />)}</div>
      ) : approvals.length === 0 ? (
        <EmptyState title={t('workflow.no_items')} description={t('workflow.no_items_hint')} />
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3">{t('workflow.entity_type')}</th>
                  <th className="px-4 py-3">{t('workflow.entity_id')}</th>
                  <th className="px-4 py-3">{t('workflow.requested_by')}</th>
                  <th className="px-4 py-3">{t('common.date')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {approvals.map((a, i) => (
                  <tr key={`${a.entityType}-${a.entityId}-${i}`} className="border-b last:border-0">
                    <td className="px-4 py-3 capitalize">{a.entityType.replace('_', ' ')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{a.entityId.slice(0, 8)}…</td>
                    <td className="px-4 py-3">{a.requestedBy}</td>
                    <td className="px-4 py-3">{new Date(a.requestedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                        a.status === 'approved' ? 'bg-green-100 text-green-700' :
                        a.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{t(`status.${a.status}`)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {a.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => act(a.entityType, a.entityId, 'approve')}
                            disabled={acting === `${a.entityType}-${a.entityId}`}
                            className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50">
                            {t('common.approve')}
                          </button>
                          <button onClick={() => act(a.entityType, a.entityId, 'reject')}
                            disabled={acting === `${a.entityType}-${a.entityId}`}
                            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50">
                            {t('common.reject')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
