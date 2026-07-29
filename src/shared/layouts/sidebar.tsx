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

const bottomItems = [
  { label: 'Settings', href: '/settings', icon: svg.settings },
]

const accountingItems = [
  { label: 'Accounts', href: '/accounting/accounts', icon: svg.settings },
  { label: 'Journal Entries', href: '/accounting/journal-entries', icon: svg.tasks },
  { label: 'Invoices', href: '/accounting/invoices', icon: svg.projects },
  { label: 'Payments', href: '/accounting/payments', icon: svg.spreadsheet },
  { label: 'Reports', href: '/accounting/reports', icon: svg.timeline },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r bg-card max-h-screen">
      <div className="p-4 border-b">
        <Link href="/" className="text-lg font-bold">Nexlane</Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive('/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <span className="text-base">{svg.dashboard}</span>
          Dashboard
        </Link>
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Management</p>
        </div>
        {managementItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Accounting</p>
        </div>
        {accountingItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Tools</p>
        </div>
        <Link
          href="/notifications"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive('/notifications') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <span className="text-base">{svg.notifications}</span>
          Notifications
        </Link>
        <Link
          href="/files"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive('/files') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <span className="text-base">{svg.files}</span>
          Files
        </Link>
        <Link
          href="/admin"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive('/admin') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <span className="text-base">{svg.admin}</span>
          Admin
        </Link>
        <div className="pt-4 border-t mt-4">
          {bottomItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}
