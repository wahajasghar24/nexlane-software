'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { useConfirm } from '@/shared/hooks/use-confirm-dialog'
import Link from 'next/link'

const stages = ['new', 'contacted', 'demo_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost']
const stageLabels: Record<string, string> = {
  new: 'New', contacted: 'Contacted', demo_scheduled: 'Demo Scheduled',
  proposal_sent: 'Proposal Sent', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
}

export default function DealDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [deal, setDeal] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const confirm = useConfirm()

  useEffect(() => { load() }, [id])

  const load = async () => {
    try {
      const res = await fetch(`/api/crm/deals/${id}`)
      if (res.ok) {
        const d = await res.json()
        const data = d.data || d
        setDeal(data)
        if (data.stage === 'won' && data.customer_id) {
          const cRes = await fetch(`/api/customers/${data.customer_id}`)
          if (cRes.ok) {
            const c = await cRes.json()
            setCustomer(c.data || c)
          }
        }
      }
      const actRes = await fetch(`/api/crm/activities?entity_type=deal&entity_id=${id}&limit=20`)
      if (actRes.ok) {
        const a = await actRes.json()
        setActivities(a.data || a || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const changeStage = async (newStage: string) => {
    if (!(await confirm(`Mark deal as ${stageLabels[newStage]}?`))) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/crm/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (res.ok) {
        setDeal((prev: any) => ({ ...prev, stage: newStage }))
        if (newStage === 'won' || newStage === 'lost') load()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!(await confirm('Delete this deal?'))) return
    await fetch(`/api/crm/deals/${id}`, { method: 'DELETE' })
    window.location.href = '/crm/deals'
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>
  if (!deal) return <EmptyState title="Deal not found" />

  const currentIndex = stages.indexOf(deal.stage)
  const ownerName = typeof deal.owner === 'object' ? deal.owner?.name : deal.owner || '-'

  return (
    <div>
      <PageHeader
        title={deal.name}
        description={`Stage: ${stageLabels[deal.stage]}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {deal.stage !== 'won' && (
              <button onClick={() => changeStage('won')} disabled={actionLoading} className="inline-flex items-center justify-center rounded-md bg-green-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                Mark Won
              </button>
            )}
            {deal.stage !== 'lost' && (
              <button onClick={() => changeStage('lost')} disabled={actionLoading} className="inline-flex items-center justify-center rounded-md bg-red-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                Mark Lost
              </button>
            )}
            <button onClick={handleDelete} className="inline-flex items-center justify-center rounded-md border border-red-200 bg-background px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50">
              Delete
            </button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {stages.map((stage, i) => (
            <div key={stage} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                i <= currentIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <span>{stageLabels[stage]}</span>
              </div>
              {i < stages.length - 1 && (
                <div className={`h-0.5 w-6 ${i < currentIndex ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Deal Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Value</dt><dd>{deal.value ? `$${deal.value.toLocaleString()}` : '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Probability</dt><dd>{deal.probability ? `${deal.probability}%` : '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Stage</dt><dd className="capitalize">{stageLabels[deal.stage]}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Expected Close</dt><dd>{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Owner</dt><dd>{ownerName}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Created</dt><dd>{deal.created_at ? new Date(deal.created_at).toLocaleDateString() : '-'}</dd></div>
            </dl>
            {deal.notes && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{deal.notes}</p>
              </div>
            )}
          </div>

          {customer && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-3">Customer (from Won Deal)</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{customer.name}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{customer.email || '-'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{customer.phone || '-'}</dd></div>
              </dl>
            </div>
          )}
        </div>

        <div className="md:col-span-2 rounded-lg border bg-card p-4">
          <h3 className="font-semibold mb-3">Activities</h3>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activities recorded</p>
          ) : (
            <div className="space-y-3">
              {activities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-3 text-sm">
                  <span className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                  <div>
                    <p className="capitalize font-medium">{act.type?.replace(/_/g, ' ')}</p>
                    <p className="text-muted-foreground">{act.description || act.notes || '-'}</p>
                    <p className="text-xs text-muted-foreground">{act.created_at ? new Date(act.created_at).toLocaleString() : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
