'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface Contact {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  whatsapp?: string
  crm_company?: { name: string } | string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (companyFilter) params.set('company', companyFilter)
    fetch(`/api/crm/contacts?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || []
        setContacts(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setContacts([]))
      .finally(() => setLoading(false))
  }, [page, search, companyFilter])

  const getCompanyName = (c: Contact) => {
    if (typeof c.crm_company === 'object') return c.crm_company?.name
    return c.company || c.crm_company || '-'
  }

  return (
    <div>
      <PageHeader title="Contacts" description="Manage your CRM contacts" />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Search contacts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]" />
        <input type="text" placeholder="Filter by company..." value={companyFilter} onChange={e => { setCompanyFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto" />
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="flex gap-4"><div className="h-4 w-32 bg-muted rounded" /><div className="h-4 w-24 bg-muted rounded" /></div>
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState title="No contacts found" description="Contacts from leads or companies will appear here" />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {contacts.map(c => (
              <div key={c.id} className="rounded-lg border bg-card p-4">
                <Link href={`/crm/contacts/${c.id}`} className="font-medium hover:text-primary block mb-1">{c.name}</Link>
                <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground mb-2">
                  <span>{getCompanyName(c)}</span>
                  <span className="text-right">{c.email || '-'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <div className="flex gap-3 text-muted-foreground">
                    {c.phone && <span>{c.phone}</span>}
                    {c.whatsapp && <span>{c.whatsapp}</span>}
                  </div>
                  <Link href={`/crm/contacts/${c.id}`} className="text-muted-foreground hover:text-primary">View</Link>
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
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Company</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">WhatsApp</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr key={c.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3"><Link href={`/crm/contacts/${c.id}`} className="font-medium hover:text-primary">{c.name}</Link></td>
                    <td className="p-3 text-sm text-muted-foreground">{getCompanyName(c)}</td>
                    <td className="p-3 text-sm text-muted-foreground">{c.email || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{c.phone || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{c.whatsapp || '-'}</td>
                    <td className="p-3 text-right">
                      <Link href={`/crm/contacts/${c.id}`} className="text-sm text-muted-foreground hover:text-primary">View</Link>
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
