'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface Employee {
  id: string
  position?: string
  employment_status: string
  employee_code?: string
  department?: { id: string; name: string } | null
  designation?: { id: string; name: string } | null
  profile?: { full_name?: string; email?: string; phone?: string } | null
  created_at: string
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  terminated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export default function EmployeesPage() {
  const t = useTranslations('hr')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [designationFilter, setDesignationFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [designations, setDesignations] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch(`/api/employees?page=${page}&limit=20${search ? `&search=${search}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${departmentFilter ? `&department_id=${departmentFilter}` : ''}${designationFilter ? `&designation_id=${designationFilter}` : ''}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setEmployees(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, departmentFilter, designationFilter])

  useEffect(() => {
    fetch('/api/departments?limit=100').then(r => r.json()).then(d => setDepartments((d?.data) || (Array.isArray(d) ? d : []))).catch(() => {})
    fetch('/api/designations?limit=100').then(r => r.json()).then(d => setDesignations((d?.data) || (Array.isArray(d) ? d : []))).catch(() => {})
  }, [])

  const getDisplayName = (e: Employee) => e.profile?.full_name || t('common.unnamed')

  return (
    <div>
      <PageHeader
        title={t('employees.title')}
        description={t('employees.description')}
        actions={
          <Link href="/employees/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t('employees.add')}
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder={t('employees.search')}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto"
        >
          <option value="">{t('common.all_statuses')}</option>
          <option value="active">{t('status.active')}</option>
          <option value="inactive">{t('status.inactive')}</option>
          <option value="on_leave">{t('status.on_leave')}</option>
          <option value="terminated">{t('status.terminated')}</option>
        </select>
        <select
          value={departmentFilter}
          onChange={e => { setDepartmentFilter(e.target.value); setPage(1) }}
          className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto"
        >
          <option value="">{t('common.all_departments')}</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select
          value={designationFilter}
          onChange={e => { setDesignationFilter(e.target.value); setPage(1) }}
          className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto"
        >
          <option value="">{t('common.all_designations')}</option>
          {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
              <div className="h-6 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          title={t('employees.no_employees')}
          description={t('employees.no_employees_desc')}
          action={<Link href="/employees/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t('employees.add')}</Link>}
        />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {employees.map(emp => (
              <div key={emp.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/employees/${emp.id}`} className="font-medium hover:text-primary">
                    {getDisplayName(emp)}
                  </Link>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[emp.employment_status] || ''}`}>
                    {emp.employment_status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                  <span>{emp.department?.name || t('common.no_dept')}</span>
                  <span className="text-right">{emp.designation?.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t text-sm">
                  <span className="text-muted-foreground">{emp.position || '-'}</span>
                  <div className="flex gap-2">
                    <Link href={`/employees/${emp.id}`} className="text-muted-foreground hover:text-primary">{t('common.view')}</Link>
                    <Link href={`/employees/${emp.id}/edit`} className="text-muted-foreground hover:text-primary">{t('common.edit')}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table view */}
          <div className="rounded-lg border overflow-x-auto hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.name')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('fields.department')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('fields.designation')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('fields.position')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.status')}</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3">
                      <Link href={`/employees/${emp.id}`} className="font-medium hover:text-primary">
                        {getDisplayName(emp)}
                      </Link>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{emp.department?.name || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{emp.designation?.name || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{emp.position || '-'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[emp.employment_status] || ''}`}>
                        {emp.employment_status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link href={`/employees/${emp.id}`} className="text-sm text-muted-foreground hover:text-primary mr-2">View</Link>
                      <Link href={`/employees/${emp.id}/edit`} className="text-sm text-muted-foreground hover:text-primary">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-muted-foreground">{t('common.page_of', { page, totalPages })}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
