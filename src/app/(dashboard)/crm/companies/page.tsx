'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  industry?: string
  website?: string
  contacts?: { count: number }[] | number
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (industryFilter) params.set('industry', industryFilter)
    fetch(`/api/crm/companies?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || []
        setCompanies(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false))
  }, [page, search, industryFilter])

  const getContactCount = (c: Company) => {
    if (typeof c.contacts === 'number') return c.contacts
    if (Array.isArray(c.contacts)) return c.contacts[0]?.count || 0
    return 0
  }

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Manage your CRM companies"
        actions={
          <Link href="/crm/companies/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            New Company
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Search companies..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]" />
        <input type="text" placeholder="Filter by industry..." value={industryFilter} onChange={e => { setIndustryFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto" />
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="flex gap-4"><div className="h-4 w-24 bg-muted rounded" /><div className="h-4 w-16 bg-muted rounded" /></div>
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState title="No companies found" description="Add your first company" action={<Link href="/crm/companies/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Company</Link>} />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {companies.map(c => (
              <div key={c.id} className="rounded-lg border bg-card p-4">
                <Link href={`/crm/companies/${c.id}`} className="font-medium hover:text-primary block mb-1">{c.name}</Link>
                <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground mb-2">
                  <span>{c.industry || 'No industry'}</span>
                  <span className="text-right">{getContactCount(c)} contacts</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  {c.website ? (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary truncate max-w-[180px]">{c.website}</a>
                  ) : <span className="text-muted-foreground">-</span>}
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/crm/companies/${c.id}`} className="text-muted-foreground hover:text-primary">View</Link>
                    <Link href={`/crm/companies/${c.id}/edit`} className="text-muted-foreground hover:text-primary">Edit</Link>
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
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Industry</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Website</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Contacts</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3"><Link href={`/crm/companies/${c.id}`} className="font-medium hover:text-primary">{c.name}</Link></td>
                    <td className="p-3 text-sm text-muted-foreground">{c.industry || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{c.website}</a> : '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{getContactCount(c)}</td>
                    <td className="p-3 text-right">
                      <Link href={`/crm/companies/${c.id}`} className="text-sm text-muted-foreground hover:text-primary mr-2">View</Link>
                      <Link href={`/crm/companies/${c.id}/edit`} className="text-sm text-muted-foreground hover:text-primary">Edit</Link>
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
