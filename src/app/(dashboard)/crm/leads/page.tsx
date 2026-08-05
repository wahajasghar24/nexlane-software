'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { useConfirm } from '@/shared/hooks/use-confirm-dialog'
import Link from 'next/link'

interface Lead {
  id: string
  title: string
  name: string
  company?: string
  status: string
  priority: string
  assigned_to?: { name: string } | string
  created_at: string
}

const statusColors: Record<string, string> = {
  new: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  contacted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  unqualified: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const confirm = useConfirm()

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    fetch(`/api/crm/leads?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setLeads(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setLeads([]))
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, priorityFilter])

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this lead?'))) return
    try {
      await fetch(`/api/crm/leads/${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
    } catch {}
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Manage your sales leads"
        actions={
          <Link href="/crm/leads/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            New Lead
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Search leads..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="unqualified">Unqualified</option>
          <option value="converted">Converted</option>
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="flex gap-4"><div className="h-4 w-20 bg-muted rounded" /><div className="h-4 w-20 bg-muted rounded" /></div>
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <EmptyState title="No leads found" description="Create your first lead to get started" action={<Link href="/crm/leads/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Lead</Link>} />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {leads.map(lead => (
              <div key={lead.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link href={`/crm/leads/${lead.id}`} className="font-medium hover:text-primary">{lead.title || 'Untitled'}</Link>
                    <p className="text-sm text-muted-foreground">{lead.name}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lead.status] || ''}`}>{lead.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground mb-2">
                  <span>Company: {lead.company || '-'}</span>
                  <span className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[lead.priority] || ''}`}>{lead.priority}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <span className="text-muted-foreground">{typeof lead.assigned_to === 'object' ? lead.assigned_to?.name : lead.assigned_to || 'Unassigned'}</span>
                  <div className="flex gap-2">
                    <Link href={`/crm/leads/${lead.id}`} className="text-muted-foreground hover:text-primary">View</Link>
                    <Link href={`/crm/leads/${lead.id}/edit`} className="text-muted-foreground hover:text-primary">Edit</Link>
                    <button onClick={() => handleDelete(lead.id)} className="text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table view */}
          <div className="rounded-lg border overflow-x-auto hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Title</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Company</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Assigned To</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3"><Link href={`/crm/leads/${lead.id}`} className="font-medium hover:text-primary">{lead.title || 'Untitled'}</Link></td>
                    <td className="p-3 text-sm">{lead.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{lead.company || '-'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lead.status] || ''}`}>{lead.status}</span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[lead.priority] || ''}`}>{lead.priority}</span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{typeof lead.assigned_to === 'object' ? lead.assigned_to?.name : lead.assigned_to || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link href={`/crm/leads/${lead.id}`} className="text-sm text-muted-foreground hover:text-primary mr-2">View</Link>
                      <Link href={`/crm/leads/${lead.id}/edit`} className="text-sm text-muted-foreground hover:text-primary mr-2">Edit</Link>
                      <button onClick={() => handleDelete(lead.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
