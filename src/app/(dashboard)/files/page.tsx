'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface FileItem {
  id: string
  file_name: string
  file_size: number
  mime_type: string
  folder: string
  url?: string
  entity_type?: string
  created_at: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/files?page=${page}&limit=20`)
      const d = await res.json()
      const paginated = d.data || d
      setFiles(Array.isArray(paginated) ? paginated : (paginated?.data || []))
      setTotalPages(paginated?.totalPages || 1)
    } catch {
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return
    await fetch(`/api/files/${id}`, { method: 'DELETE' })
    fetchFiles()
  }

  const getIcon = (mime: string) => {
    if (mime.startsWith('image/')) return '🖼️'
    if (mime.startsWith('video/')) return '🎬'
    if (mime.includes('pdf')) return '📄'
    if (mime.includes('sheet') || mime.includes('excel')) return '📊'
    if (mime.includes('document') || mime.includes('word')) return '📝'
    return '📎'
  }

  return (
    <div>
      <PageHeader title="Files" description="Manage uploaded files" />

      {loading ? (
        <div className="rounded-lg border animate-pulse space-y-3 p-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}
        </div>
      ) : files.length === 0 ? (
        <EmptyState title="No files" description="Upload files to get started" />
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Size</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map(f => (
                  <tr key={f.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span>{getIcon(f.mime_type)}</span>
                        <span className="font-medium">{f.file_name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{formatSize(f.file_size)}</td>
                    <td className="p-3 text-sm text-muted-foreground">{f.mime_type}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      {f.url && <a href={f.url} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary mr-2">Download</a>}
                      <button onClick={() => handleDelete(f.id)} className="text-sm text-muted-foreground hover:text-destructive">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
