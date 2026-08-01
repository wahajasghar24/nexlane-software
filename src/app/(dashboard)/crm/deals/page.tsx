'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

const stages = ['new', 'contacted', 'demo_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost']

const stageLabels: Record<string, string> = {
  new: 'New', contacted: 'Contacted', demo_scheduled: 'Demo Scheduled',
  proposal_sent: 'Proposal Sent', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
}

interface Deal {
  id: string
  name: string
  value?: number
  probability?: number
  stage: string
  expected_close_date?: string
  owner?: { name: string } | string
}

export default function DealsPipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/crm/deals?limit=200')
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || d.data || d || []
        setDeals(Array.isArray(data) ? data : [])
      })
      .catch(() => setDeals([]))
      .finally(() => setLoading(false))
  }, [])

  const grouped = stages.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage)
    return acc
  }, {} as Record<string, Deal[]>)

  const getOwnerName = (d: Deal) => {
    if (typeof d.owner === 'object') return d.owner?.name
    return d.owner || '-'
  }

  const stageColor = (stage: string) => {
    if (stage === 'won') return 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
    if (stage === 'lost') return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
    return 'border-l-gray-300 bg-card'
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="flex gap-4 overflow-x-auto pb-4">{[...Array(4)].map((_, i) => <div key={i} className="h-96 w-64 flex-shrink-0 bg-muted rounded" />)}</div></div>

  return (
    <div>
      <PageHeader
        title="Deal Pipeline"
        description="Track deals through each stage"
        actions={
          <Link href="/crm/deals/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            New Deal
          </Link>
        }
      />

      {deals.length === 0 ? (
        <EmptyState title="No deals found" description="Create your first deal to build your pipeline" action={<Link href="/crm/deals/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Deal</Link>} />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {stages.map(stage => (
            <div key={stage} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold capitalize">{stageLabels[stage]}</h3>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{grouped[stage]?.length || 0}</span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {(grouped[stage] || []).map(deal => (
                  <Link
                    key={deal.id}
                    href={`/crm/deals/${deal.id}`}
                    className={`block rounded-md border border-l-4 p-3 text-sm hover:shadow-md transition-shadow ${stageColor(stage)}`}
                  >
                    <p className="font-medium mb-1 truncate">{deal.name}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{deal.value ? `$${deal.value.toLocaleString()}` : '-'}</span>
                      <span>{deal.probability ? `${deal.probability}%` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{getOwnerName(deal)}</span>
                      <span>{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
