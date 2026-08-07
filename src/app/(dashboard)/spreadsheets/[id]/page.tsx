'use client'

import { useTranslations } from 'next-intl'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { useRouter, useParams } from 'next/navigation'

interface Column {
  id: string
  name: string
  key: string
  type: string
  position: number
  width: number
}

interface Row {
  id: string
  position: number
  cells: Record<string, string>
}

interface SheetData {
  id: string
  name: string
  description?: string
  columns: Column[]
  rows: Row[]
}

export default function SpreadsheetViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const t = useTranslations('misc')
  const [sheet, setSheet] = useState<SheetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumn, setNewColumn] = useState({ name: '', key: '', type: 'text' })
  const [saving, setSaving] = useState(false)

  const fetchSheet = async () => {
    try {
      const res = await fetch(`/api/spreadsheets/${id}`)
      const d = await res.json()
      return d.data || null
    } catch {
      return null
    }
  }

  const refreshSheet = async () => {
    const s = await fetchSheet()
    if (s) setSheet(s)
  }

  useEffect(() => {
    let ignore = false
    fetchSheet().then((data) => {
      if (ignore) return
      setSheet(data)
      setLoading(false)
    })
    return () => { ignore = true }
  }, [id])

  const handleExport = () => {
    window.open(`/api/spreadsheets/${id}/export`, '_blank')
  }

  const handleAddRow = async () => {
    setSaving(true)
    try {
      await fetch(`/api/spreadsheets/${id}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      await refreshSheet()
    } catch {
      alert(t('sheet_add_row_failed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRow = async (rowId: string) => {
    if (!confirm(t('sheet_delete_row_confirm'))) return
    try {
      await fetch(`/api/spreadsheets/${id}/rows/${rowId}`, {
        method: 'DELETE',
      })
      await refreshSheet()
    } catch {
      alert(t('sheet_delete_row_failed'))
    }
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm(t('sheet_delete_column_confirm'))) return
    try {
      await fetch(`/api/spreadsheets/${id}/columns/${columnId}`, {
        method: 'DELETE',
      })
      await refreshSheet()
    } catch {
      alert(t('sheet_delete_column_failed'))
    }
  }

  const handleAddColumn = async () => {
    if (!newColumn.name.trim() || !newColumn.key.trim()) {
      alert(t('sheet_name_key_required'))
      return
    }
    setSaving(true)
    try {
      const nextPosition = (sheet?.columns?.length || 0)
      await fetch(`/api/spreadsheets/${id}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet_table_id: id,
          name: newColumn.name.trim(),
          key: newColumn.key.trim(),
          type: newColumn.type,
          position: nextPosition,
          width: 200,
          required: false,
        }),
      })
      setShowAddColumn(false)
      setNewColumn({ name: '', key: '', type: 'text' })
      await refreshSheet()
    } catch {
      alert(t('sheet_add_column_failed'))
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (rowId: string, colId: string, currentValue: string) => {
    setEditingCell({ rowId, colId })
    setEditValue(currentValue || '')
  }

  const saveCell = async () => {
    if (!editingCell) return
    const { rowId, colId } = editingCell
    try {
      await fetch(`/api/spreadsheets/${id}/rows/${rowId}/cells`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: colId, value: editValue }),
      })
      setSheet(prev => {
        if (!prev) return prev
        return {
          ...prev,
          rows: prev.rows.map(r =>
            r.id === rowId
              ? { ...r, cells: { ...r.cells, [colId]: editValue } }
              : r
          ),
        }
      })
    } catch {
      // silently fail, data will refresh on next fetch
    }
    setEditingCell(null)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!sheet) {
    return (
      <div className="p-6">
        <PageHeader
          title={t('sheet_not_found')}
          actions={
            <button
              onClick={() => router.push('/spreadsheets')}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Back to Spreadsheets
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={sheet.name}
        description={sheet.description || `${sheet.columns?.length || 0} columns · ${sheet.rows?.length || 0} rows`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Export CSV
            </button>
            <button
              onClick={() => setShowAddColumn(true)}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Add Column
            </button>
            <button
              onClick={handleAddRow}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Add Row
            </button>
          </div>
        }
      />

      {/* Add Column Dialog */}
      {showAddColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg border bg-card p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{t('sheet_add_column_title')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t('sheet_name')}</label>
                <input
                  type="text"
                  value={newColumn.name}
                  onChange={e => setNewColumn(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('sheet_name_placeholder')}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('sheet_key')}</label>
                <input
                  type="text"
                  value={newColumn.key}
                  onChange={e => setNewColumn(prev => ({ ...prev, key: e.target.value }))}
                  placeholder={t('sheet_key_placeholder')}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <p className="text-xs text-muted-foreground mt-0.5">{t('sheet_key_hint')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('sheet_type')}</label>
                <select
                  value={newColumn.type}
                  onChange={e => setNewColumn(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="text">{t('sheet_type_text')}</option>
                  <option value="number">{t('sheet_type_number')}</option>
                  <option value="date">{t('sheet_type_date')}</option>
                  <option value="boolean">{t('sheet_type_boolean')}</option>
                  <option value="select">{t('sheet_type_select')}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddColumn(false)}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleAddColumn}
                disabled={saving}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? t('sheet_adding') : t('sheet_add_column_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-2 text-sm font-medium text-muted-foreground w-10">#</th>
              {sheet.columns?.map(col => (
                <th
                  key={col.id}
                  className="text-left p-2 text-sm font-medium text-muted-foreground relative group"
                  style={{ minWidth: col.width || 150 }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate">{col.name}</span>
                    <button
                      onClick={() => handleDeleteColumn(col.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      title={t('sheet_col_delete_title')}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </th>
              ))}
              <th className="text-left p-2 text-sm font-medium text-muted-foreground w-16">{t('sheet_col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sheet.rows?.length === 0 ? (
              <tr>
                <td
                  colSpan={(sheet.columns?.length || 0) + 2}
                  className="p-8 text-center text-sm text-muted-foreground"
                >
                  No rows yet. Click &quot;Add Row&quot; to get started.
                </td>
              </tr>
            ) : (
              sheet.rows?.map((row, rowIndex) => (
                <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-2 text-xs text-muted-foreground text-center">{rowIndex + 1}</td>
                  {sheet.columns?.map(col => {
                    const cellValue = row.cells?.[col.id] ?? ''
                    const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id

                    return (
                      <td key={col.id} className="p-1 border-r last:border-r-0">
                        {isEditing ? (
                          <input
                            type={col.type === 'number' ? 'number' : 'text'}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={saveCell}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveCell()
                              if (e.key === 'Escape') setEditingCell(null)
                            }}
                            className="w-full rounded px-2 py-1 text-sm bg-accent/50 border border-primary outline-none"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(row.id, col.id, cellValue)}
                            className="min-h-[28px] px-2 py-1 text-sm cursor-text hover:bg-accent/30 rounded"
                          >
                            {cellValue || <span className="text-muted-foreground italic">—</span>}
                          </div>
                        )}
                      </td>
                    )
                  })}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title={t('sheet_row_delete_title')}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={handleAddRow}
          disabled={saving}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
        >
          + Add Row
        </button>
        <button
          onClick={() => setShowAddColumn(true)}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          + Add Column
        </button>
      </div>
    </div>
  )
}
