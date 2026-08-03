'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface Warehouse {
  id: string
  code: string
  name: string
  location: string | null
  is_active: boolean
}

export default function WarehousesPage() {
  const [rows, setRows] = useState<Warehouse[]>([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const boot = async () => {
      try {
        const res = await fetch('/api/inventory/warehouses?limit=50')
        const data = await res.json()
        setRows(data.data?.data ?? [])
      } catch { setRows([]) }
    }
    boot()
  }, [])

  const create = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/inventory/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, location: location || null, is_active: true }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Failed')
      else { setCode(''); setName(''); setLocation(''); const r = await fetch('/api/inventory/warehouses?limit=50'); const d = await r.json(); setRows(d.data?.data ?? []) }
    } catch { setError('Network error') }
    setBusy(false)
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/inventory/warehouses/${id}`, { method: 'DELETE' })
    if (res.ok) setRows(rows.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Warehouses" description="Stock locations for your products" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (e.g. MAIN)" className="rounded-lg border bg-background px-3 py-2 text-sm" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Main Warehouse)" className="rounded-lg border bg-background px-3 py-2 text-sm" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" className="rounded-lg border bg-background px-3 py-2 text-sm" />
          <button onClick={create} disabled={busy || !code || !name} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40">
            Add Warehouse
          </button>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No warehouses yet" description="Add your first warehouse to track stock by location." />
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{w.code}</td>
                  <td className="px-4 py-3">{w.name}</td>
                  <td className="px-4 py-3">{w.location || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${w.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}`}>
                      {w.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(w.id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}