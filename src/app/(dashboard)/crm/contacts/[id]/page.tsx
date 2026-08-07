'use client'

import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

export default function ContactDetailPage() {
  const params = useParams()
  const id = params.id as string
  const t = useTranslations('crm')
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/crm/contacts/${id}`)
      .then(r => r.json())
      .then(d => setContact(d.data || d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>
  if (!contact) return <EmptyState title={t('contact_detail_not_found')} />

  const companyName = typeof contact.crm_company === 'object' ? contact.crm_company?.name : contact.company || contact.crm_company || '-'
  const companyId = typeof contact.crm_company === 'object' ? contact.crm_company?.id : null

  return (
    <div>
      <PageHeader title={contact.name} description={t('contact_detail_details')} />

      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{contact.name}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{contact.email || '-'}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t('contact_detail_phone')}</dt><dd>{contact.phone || '-'}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t('contact_detail_whatsapp')}</dt><dd>{contact.whatsapp || '-'}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t('contact_detail_company')}</dt><dd>{companyId ? <Link href={`/crm/companies/${companyId}`} className="hover:text-primary">{companyName}</Link> : companyName}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t('contact_detail_position')}</dt><dd>{contact.position || '-'}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t('contact_detail_created')}</dt><dd>{contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '-'}</dd></div>
        </dl>
        {contact.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">{t('contact_detail_notes')}</p>
            <p className="text-sm">{contact.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
