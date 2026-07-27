'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/core/utils/cn'

const svg = {
  home: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  projects: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 2H12v5.5a2.5 2.5 0 0 0 5 0V2Z"/><path d="M12 2H8.5a2.5 2.5 0 0 0 0 5H12V2Z"/><path d="M12 7v4"/><path d="M12 11H8.5a2.5 2.5 0 0 0 0 5H12v-5Z"/><path d="M12 11h3.5a2.5 2.5 0 0 1 0 5H12v-5Z"/><path d="M12 16v4.5a2.5 2.5 0 0 0 5 0V16h-5Z"/><path d="M12 16H8.5a2.5 2.5 0 0 1 0-5H12v5Z"/></svg>,
  tasks: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z"/></svg>,
  workLogs: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  employees: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  crm: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16"/><path d="M4 20V4"/><path d="M20 20V8"/><path d="m8 12 4 4 8-8"/></svg>,
  more: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
}

const allItems = [
  { label: 'Home', href: '/', icon: svg.home },
  { label: 'Projects', href: '/projects', icon: svg.projects },
  { label: 'Tasks', href: '/tasks', icon: svg.tasks },
  { label: 'Work Logs', href: '/work-logs', icon: svg.workLogs },
  { label: 'Employees', href: '/employees', icon: svg.employees },
  { label: 'CRM', href: '/crm', icon: svg.crm },
  { label: 'Teams', href: '/teams', icon: svg.employees },
  { label: 'Timeline', href: '/timeline', icon: svg.workLogs },
]

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background">
      <div className="flex items-center overflow-x-auto px-1 gap-0 h-14">
        {allItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-[10px] px-2.5 py-1.5 rounded-md min-w-[64px] shrink-0 transition-colors',
              isActive(item.href) ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span className="truncate max-w-[64px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
