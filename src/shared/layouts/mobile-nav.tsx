'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/core/utils/cn'

const navItems = [
  { label: 'Home', href: '/', icon: '◇' },
  { label: 'Projects', href: '/projects', icon: '◆' },
  { label: 'Tasks', href: '/tasks', icon: '☐' },
  { label: 'Work Logs', href: '/work-logs', icon: '⏱' },
  { label: 'Settings', href: '/settings', icon: '⚙' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background">
      <div className="flex items-center justify-around h-14">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 text-xs',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
