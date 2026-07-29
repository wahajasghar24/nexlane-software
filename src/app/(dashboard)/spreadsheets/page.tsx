'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface Spreadsheet {
  id: string
  name: string
  description?: string
  columns?: { count: number }[] | number
  rows?: { count: number }[] | number
  created_by?: string
  created_at: string
}

export default function SpreadsheetsPage() {
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    fetch(`/api/spreadsheets?${params}`)
      .then(r => r.json())
      .then(d => {
        const paginated = d.data || d
        const items = Array.isArray(paginated) ? paginated : (paginated?.data || [])
        setSpreadsheets(Array.isArray(items) ? items : [])
        setTotalPages(paginated?.totalPages || 1)
      })
      .catch(() => setSpreadsheets([]))
      .finally(() => setLoading(false))
  }, [page, search])

  const getColumnCount = (s: Spreadsheet) => {
    if (typeof s.columns === 'number') return s.columns
    if (Array.isArray(s.columns)) return s.columns[0]?.count || 0
    return 0
  }

  const getRowCount = (s: Spreadsheet) => {
    if (typeof s.rows === 'number') return s.rows
    if (Array.isArray(s.rows)) return s.rows[0]?.count || 0
    return 0
  }

  const handleNewSpreadsheet = async () => {
    const name = prompt('Spreadsheet name:')
    if (!name?.trim()) return

    try {
      const res = await fetch('/api/spreadsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (data.data?.id) {
        window.location.href = `/spreadsheets/${data.data.id}`
      }
    } catch {
      alert('Failed to create spreadsheet')
    }
  }

  return (
    <div>
      <PageHeader
        title="Spreadsheets"
        description="Create and manage spreadsheets"
        actions={
          <button
            onClick={handleNewSpreadsheet}
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New Spreadsheet
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search spreadsheets..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]"
        />
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-5 w-48 bg-muted rounded" />
              </div>
              <div className="flex gap-4 mt-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : spreadsheets.length === 0 ? (
        <EmptyState
          title="No spreadsheets found"
          description="Create your first spreadsheet to get started"
          action={
            <button onClick={handleNewSpreadsheet} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              New Spreadsheet
            </button>
          }
        />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {spreadsheets.map(s => (
              <div key={s.id} className="rounded-lg border bg-card p-4">
                <Link href={`/spreadsheets/${s.id}`} className="font-medium hover:text-primary block mb-1">
                  {s.name}
                </Link>
                {s.description && (
                  <p className="text-sm text-muted-foreground mb-2">{s.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{getColumnCount(s)} columns</span>
                  <span>{getRowCount(s)} rows</span>
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
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Columns</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rows</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {spreadsheets.map(s => (
                  <tr key={s.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3">
                      <Link href={`/spreadsheets/${s.id}`} className="font-medium hover:text-primary">
                        {s.name}
                      </Link>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {s.description || '-'}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{getColumnCount(s)}</td>
                    <td className="p-3 text-sm text-muted-foreground">{getRowCount(s)}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/spreadsheets/${s.id}`}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
