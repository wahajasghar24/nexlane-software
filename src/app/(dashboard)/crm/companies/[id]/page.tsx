'use client'

import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

export default function CompanyDetailPage() {
  const params = useParams()
  const id = params.id as string
  const t = useTranslations('crm')
  const [company, setCompany] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const res = await fetch(`/api/crm/companies/${id}`)
        if (res.ok) {
          const d = await res.json()
          if (!ignore) setCompany(d.data || d)
        }
        const contRes = await fetch(`/api/crm/contacts?company_id=${id}&limit=50`)
        if (contRes.ok) {
          const c = await contRes.json()
          if (!ignore) setContacts(c.data || c || [])
        }
        const dealRes = await fetch(`/api/crm/deals?crm_company_id=${id}&limit=50`)
        if (dealRes.ok) {
          const d = await dealRes.json()
          if (!ignore) setDeals(d.data?.data || (d?.data) || (Array.isArray(d) ? d : []))
        }
      } catch {} finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [id])


  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>
  if (!company) return <EmptyState title={t('company_detail_not_found')} />

  const addr = company.address || {}

  return (
    <div>
      <PageHeader
        title={company.name}
        description={company.industry || ''}
        actions={
          <Link href={`/crm/companies/${id}/edit`} className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">{t('common_edit')}</Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 rounded-lg border bg-card p-4">
          <h3 className="font-semibold mb-3">{t('company_detail_info')}</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{t('company_detail_industry')}</dt><dd>{company.industry || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t('company_detail_website')}</dt><dd>{company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{company.website}</a> : '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t('company_detail_phone')}</dt><dd>{company.phone || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t('company_detail_email')}</dt><dd>{company.email || '-'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t('company_detail_address')}</dt><dd>{typeof addr === 'string' ? addr : [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ') || '-'}</dd></div>
          </dl>
          {company.notes && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-1">{t('company_detail_notes')}</p>
              <p className="text-sm">{company.notes}</p>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('company_detail_contacts', { count: contacts.length })}</h3>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('company_detail_no_contacts')}</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2">
                    <Link href={`/crm/contacts/${c.id}`} className="font-medium hover:text-primary">{c.name}</Link>
                    <span className="text-muted-foreground">{c.email || c.phone || '-'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('company_detail_deals', { count: deals.length })}</h3>
            {deals.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('company_detail_no_deals')}</p>
            ) : (
              <div className="space-y-2">
                {deals.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2">
                    <Link href={`/crm/deals/${d.id}`} className="font-medium hover:text-primary">{d.name}</Link>
                    <span className="text-muted-foreground">{d.value ? `$${d.value}` : '-'} - {d.stage?.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
