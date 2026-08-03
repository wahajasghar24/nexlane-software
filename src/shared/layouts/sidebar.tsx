'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/core/utils/cn'

const svg = {
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3"/><rect width="7" height="5" x="14" y="3"/><rect width="7" height="9" x="14" y="12"/><rect width="7" height="5" x="3" y="16"/></svg>,
  employees: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  departments: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>,
  projects: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7h12"/><path d="M8 12h12"/><path d="M8 17h12"/><rect width="4" height="4" x="2" y="3"/><rect width="4" height="4" x="2" y="10"/><rect width="4" height="4" x="2" y="17"/></svg>,
  tasks: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z"/></svg>,
  workLogs: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  timeline: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20h4"/><path d="M12 16v4"/><path d="M3 12h4"/><path d="M5 8v8"/><path d="M17 12h4"/><path d="M19 8v8"/><path d="M10 4h4"/><path d="M12 0v4"/></svg>,
  spreadsheet: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>,
  settings: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  accounting: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20h16"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h5"/><path d="M8 18h8"/></svg>,
  notifications: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  files: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  admin: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  building: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>,
  contacts: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  leads: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>,
  deals: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/></svg>,
  activities: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 13v-3M12 13V7M17 13v-5"/><path d="M7 16h.01M12 16h.01M17 16h.01"/></svg>,
  inventory: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  sales: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  purchase: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>,
}

const managementItems = [
  { label: 'Employees', href: '/employees', icon: svg.employees },
  { label: 'Departments', href: '/departments', icon: svg.departments },
  { label: 'Designations', href: '/designations', icon: svg.projects },
  { label: 'Teams', href: '/teams', icon: svg.employees },
  { label: 'Projects', href: '/projects', icon: svg.projects },
  { label: 'Tasks', href: '/tasks', icon: svg.tasks },
  { label: 'Work Logs', href: '/work-logs', icon: svg.workLogs },
  { label: 'Timeline', href: '/timeline', icon: svg.timeline },
  { label: 'Spreadsheets', href: '/spreadsheets', icon: svg.spreadsheet },
]

const accountingItems = [
  { label: 'Accounts', href: '/accounting/accounts', icon: svg.accounting },
  { label: 'Journal Entries', href: '/accounting/journal-entries', icon: svg.tasks },
  { label: 'Invoices', href: '/accounting/invoices', icon: svg.projects },
  { label: 'Payments', href: '/accounting/payments', icon: svg.spreadsheet },
  { label: 'Reports', href: '/accounting/reports', icon: svg.timeline },
]

const crmItems = [
  { label: 'Companies', href: '/crm/companies', icon: svg.building },
  { label: 'Contacts', href: '/crm/contacts', icon: svg.contacts },
  { label: 'Leads', href: '/crm/leads', icon: svg.leads },
  { label: 'Deals', href: '/crm/deals', icon: svg.deals },
  { label: 'Activities', href: '/crm/activities', icon: svg.activities },
]

const salesItems = [
  { label: 'Products', href: '/inventory/products', icon: svg.inventory },
  { label: 'Sales Orders', href: '/sales/orders', icon: svg.sales },
  { label: 'Purchase Orders', href: '/purchase/orders', icon: svg.purchase },
]

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-primary/10 font-semibold text-primary'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
      )}
    >
      {active && (
        <span aria-hidden="true" className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r bg-card max-h-screen">
      <div className="flex items-center gap-2.5 p-4 border-b">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 text-sm font-bold text-white shadow-sm">
          N
        </span>
        <div className="leading-tight">
          <p className="font-bold tracking-tight">Nexlane</p>
          <p className="text-[11px] text-muted-foreground">Enterprise Suite</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <NavLink href="/" icon={svg.dashboard} label="Dashboard" />
        <div className="pt-3 pb-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Management</p>
        </div>
        {managementItems.map(item => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
        <div className="pt-3 pb-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Accounting</p>
        </div>
        {accountingItems.map(item => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
        <div className="pt-3 pb-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">CRM</p>
        </div>
        {crmItems.map(item => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
        <div className="pt-3 pb-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Sales & Inventory</p>
        </div>
        {salesItems.map(item => (
          <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
        <div className="pt-3 pb-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Tools</p>
        </div>
        <NavLink href="/notifications" icon={svg.notifications} label="Notifications" />
        <NavLink href="/files" icon={svg.files} label="Files" />
        <NavLink href="/admin" icon={svg.admin} label="Admin" />
        <div className="pt-3 mt-3 border-t space-y-0.5">
          <NavLink href="/settings" icon={svg.settings} label="Settings" />
        </div>
      </nav>
    </aside>
  )
}
