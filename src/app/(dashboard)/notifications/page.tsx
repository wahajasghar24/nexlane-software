'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  body?: string
  link?: string
  is_read: boolean
  created_at: string
}

const typeIcons: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const router = useRouter()

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (unreadOnly) params.set('unread', 'true')
    try {
      const res = await fetch(`/api/notifications?${params}`)
      const d = await res.json()
      const paginated = d.data || d
      setNotifications(Array.isArray(paginated) ? paginated : (paginated?.data || []))
      setTotalPages(paginated?.totalPages || 1)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [page, unreadOnly])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const handleMarkRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchNotifications()
  }

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    })
    fetchNotifications()
  }

  const handleClick = (n: Notification) => {
    if (!n.is_read) handleMarkRead(n.id)
    if (n.link) router.push(n.link)
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated with system activity"
        actions={
          <button
            onClick={handleMarkAllRead}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Mark All Read
          </button>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={unreadOnly} onChange={e => { setUnreadOnly(e.target.checked); setPage(1) }} className="rounded" />
          Unread only
        </label>
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-96 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" description={unreadOnly ? 'No unread notifications' : 'No notifications yet'} />
      ) : (
        <>
          <div className="rounded-lg border divide-y">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{typeIcons[n.type] || 'ℹ️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{n.title}</span>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    {n.body && <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button onClick={e => { e.stopPropagation(); handleMarkRead(n.id) }} className="text-xs text-primary hover:underline shrink-0">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mt-4">
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
