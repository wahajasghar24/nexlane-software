'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import Link from 'next/link'

export default function CRMDashboardPage() {
  const [stats, setStats] = useState({ leads: 0, activeDeals: 0, wonDeals: 0, companies: 0, contacts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/crm/leads?limit=1').then(r => r.json()).catch(() => ({ total: 0 })),
      fetch('/api/crm/deals?status=negotiation&limit=1').then(r => r.json()).catch(() => ({ total: 0 })),
      fetch('/api/crm/deals?status=won&limit=1').then(r => r.json()).catch(() => ({ total: 0 })),
      fetch('/api/crm/companies?limit=1').then(r => r.json()).catch(() => ({ total: 0 })),
      fetch('/api/crm/contacts?limit=1').then(r => r.json()).catch(() => ({ total: 0 })),
    ]).then(([leads, activeDeals, wonDeals, companies, contacts]) => {
      setStats({
        leads: leads.total || 0,
        activeDeals: activeDeals.total || 0,
        wonDeals: wonDeals.total || 0,
        companies: companies.total || 0,
        contacts: contacts.total || 0,
      })
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Leads', value: stats.leads, href: '/crm/leads', color: 'bg-blue-500' },
    { label: 'Active Deals', value: stats.activeDeals, href: '/crm/deals', color: 'bg-amber-500' },
    { label: 'Won Deals (This Month)', value: stats.wonDeals, href: '/crm/deals', color: 'bg-green-500' },
    { label: 'Companies', value: stats.companies, href: '/crm/companies', color: 'bg-purple-500' },
    { label: 'Contacts', value: stats.contacts, href: '/crm/contacts', color: 'bg-cyan-500' },
  ]

  const quickLinks = [
    { label: 'Leads', href: '/crm/leads', desc: 'Manage incoming leads' },
    { label: 'Deals', href: '/crm/deals', desc: 'Track deal pipeline' },
    { label: 'Companies', href: '/crm/companies', desc: 'View companies' },
    { label: 'Contacts', href: '/crm/contacts', desc: 'Manage contacts' },
    { label: 'Activities', href: '/crm/activities', desc: 'View activity log' },
  ]

  return (
    <div>
      <PageHeader title="CRM Dashboard" description="Overview of your sales pipeline" />

      {loading ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
              <div className="h-3 w-16 bg-muted rounded mb-2" />
              <div className="h-8 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8">
          {cards.map(card => (
            <Link key={card.label} href={card.href} className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </Link>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(link => (
          <Link key={link.label} href={link.href} className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors">
            <h3 className="font-medium">{link.label}</h3>
            <p className="text-sm text-muted-foreground">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
