'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { useConfirm } from '@/shared/hooks/use-confirm-dialog'

export default function DesignationsPage() {
  const t = useTranslations('hr')
  const [designations, setDesignations] = useState<{ id: string; name: string; description?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const confirm = useConfirm()

  const load = () => {
    fetch('/api/designations?limit=100')
      .then(r => r.json())
      .then(d => setDesignations((d?.data) || (Array.isArray(d) ? d : [])))
      .catch(() => setDesignations([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: '', description: '' })
    setShowModal(true)
  }

  const openEdit = (des: { id: string; name: string; description?: string }) => {
    setEditingId(des.id)
    setForm({ name: des.name, description: des.description || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `/api/designations/${editingId}` : '/api/designations'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) {
        setShowModal(false)
        load()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm(t('designations.delete_confirm')))) return
    await fetch(`/api/designations/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <PageHeader
        title={t('designations.title')}
        description={t('designations.description')}
        actions={
          <button onClick={openCreate} className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t('designations.add')}
          </button>
        }
      />

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded mt-1" />
            </div>
          ))}
        </div>
      ) : designations.length === 0 ? (
        <EmptyState
          title={t('designations.no_designations')}
          description={t('designations.no_designations_desc')}
          action={<button onClick={openCreate} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t('designations.add')}</button>}
        />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.name')}</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.description')}</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {designations.map(des => (
                <tr key={des.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{des.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{des.description || '-'}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(des)} className="text-sm text-muted-foreground hover:text-primary mr-2">{t('common.edit')}</button>
                    <button onClick={() => handleDelete(des.id)} className="text-sm text-destructive hover:text-destructive/80">{t('common.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">editingId ? t('designations.edit_title') : t('designations.add_title')</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('common.name')} *</label>
                <input type="text" required value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {saving ? t('common.saving') : t('common.save')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
