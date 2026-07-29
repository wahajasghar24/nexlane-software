import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { PaginatedResult } from '@/core/types/common'
import {
  createSheetTableSchema,
  updateSheetTableSchema,
  sheetTableQuerySchema,
  createSheetColumnSchema,
  updateSheetColumnSchema,
  createSheetRowSchema,
} from '@/features/spreadsheets/schemas/sheet-table.schema'
import type {
  CreateSheetTableInput,
  UpdateSheetTableInput,
  SheetTableQuery,
  CreateSheetColumnInput,
  UpdateSheetColumnInput,
  CreateSheetRowInput,
} from '@/features/spreadsheets/schemas/sheet-table.schema'

export const sheetTableService = {
  async list(companyId: string, query: SheetTableQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = sheetTableQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('sheet_tables')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.search) {
      dbQuery = dbQuery.ilike('name', `%${parsed.search}%`)
    }

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + parsed.limit - 1)

    if (error) throw new DatabaseError(error)

    return {
      data: data || [],
      total: count || 0,
      page: parsed.page,
      pageSize: parsed.limit,
      totalPages: Math.ceil((count || 0) / parsed.limit),
    }
  },

  async getById(companyId: string, tableId: string) {
    const supabase = await createClient()

    const { data: table, error: tableError } = await supabase
      .from('sheet_tables')
      .select('*')
      .eq('id', tableId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()

    if (tableError) throw new DatabaseError(tableError)

    const { data: columns } = await supabase
      .from('sheet_columns')
      .select('*')
      .eq('sheet_table_id', tableId)
      .order('position')

    const { data: rows } = await supabase
      .from('sheet_rows')
      .select('*')
      .eq('sheet_table_id', tableId)
      .is('deleted_at', null)
      .order('position')

    const rowIds = (rows || []).map(r => r.id)
    const { data: cells } = rowIds.length > 0 ? await supabase
      .from('sheet_cells')
      .select('*')
      .in('sheet_row_id', rowIds) : { data: [] }

    return {
      ...table,
      columns: columns || [],
      rows: (rows || []).map(row => ({
        ...row,
        cells: (cells || []).filter(c => c.sheet_row_id === row.id).reduce((acc: Record<string, any>, c: any) => {
          acc[c.sheet_column_id] = c.value
          return acc
        }, {} as Record<string, any>),
      })),
    }
  },

  async create(companyId: string, input: CreateSheetTableInput, actorId: string) {
    const parsed = createSheetTableSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sheet_tables')
      .insert({
        company_id: companyId,
        name: parsed.name,
        description: parsed.description || null,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'sheet.created',
      entityType: 'sheet_table',
      entityId: data.id,
      payload: { sheet: data, actorId },
    })

    return data
  },

  async update(companyId: string, tableId: string, input: UpdateSheetTableInput, actorId: string) {
    const parsed = updateSheetTableSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sheet_tables')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', tableId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async softDelete(companyId: string, tableId: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('sheet_tables')
      .update({ deleted_at: new Date().toISOString(), deleted_by: actorId })
      .eq('id', tableId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },

  async addColumn(companyId: string, input: CreateSheetColumnInput) {
    const parsed = createSheetColumnSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sheet_columns')
      .insert({
        company_id: companyId,
        sheet_table_id: parsed.sheet_table_id,
        name: parsed.name,
        key: parsed.key,
        type: parsed.type,
        options: parsed.options || null,
        position: parsed.position,
        width: parsed.width,
        required: parsed.required,
        default_value: parsed.default_value || null,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async updateColumn(companyId: string, columnId: string, input: UpdateSheetColumnInput) {
    const parsed = updateSheetColumnSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sheet_columns')
      .update(parsed)
      .eq('id', columnId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async deleteColumn(companyId: string, columnId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('sheet_columns')
      .delete()
      .eq('id', columnId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },

  async addRow(companyId: string, input: CreateSheetRowInput) {
    const parsed = createSheetRowSchema.parse(input)
    const supabase = await createClient()

    const { data: row, error: rowError } = await supabase
      .from('sheet_rows')
      .insert({
        company_id: companyId,
        sheet_table_id: parsed.sheet_table_id,
      })
      .select()
      .single()

    if (rowError) throw new DatabaseError(rowError)

    if (parsed.cells) {
      const cellInserts = Object.entries(parsed.cells).map(([columnId, value]) => ({
        company_id: companyId,
        sheet_row_id: row.id,
        sheet_column_id: columnId,
        value: String(value ?? ''),
      }))

      if (cellInserts.length > 0) {
        const { error: cellsError } = await supabase
          .from('sheet_cells')
          .insert(cellInserts)

        if (cellsError) throw new DatabaseError(cellsError)
      }
    }

    return row
  },

  async updateCell(companyId: string, rowId: string, columnId: string, value: any) {
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('sheet_cells')
      .select('id')
      .eq('sheet_row_id', rowId)
      .eq('sheet_column_id', columnId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('sheet_cells')
        .update({ value: String(value ?? ''), updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (error) throw new DatabaseError(error)
    } else {
      const { error } = await supabase
        .from('sheet_cells')
        .insert({
          company_id: companyId,
          sheet_row_id: rowId,
          sheet_column_id: columnId,
          value: String(value ?? ''),
        })

      if (error) throw new DatabaseError(error)
    }
  },

  async deleteRow(companyId: string, rowId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('sheet_rows')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', rowId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },

  async batchUpdateCells(companyId: string, rowId: string, cells: Record<string, any>) {
    const supabase = await createClient()

    for (const [columnId, value] of Object.entries(cells)) {
      const { data: existing } = await supabase
        .from('sheet_cells')
        .select('id')
        .eq('sheet_row_id', rowId)
        .eq('sheet_column_id', columnId)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from('sheet_cells')
          .update({ value: String(value ?? ''), updated_at: new Date().toISOString() })
          .eq('id', existing.id)

        if (error) throw new DatabaseError(error)
      } else {
        const { error } = await supabase
          .from('sheet_cells')
          .insert({
            company_id: companyId,
            sheet_row_id: rowId,
            sheet_column_id: columnId,
            value: String(value ?? ''),
          })

        if (error) throw new DatabaseError(error)
      }
    }
  },

  async exportCsv(companyId: string, tableId: string): Promise<string> {
    const table = await this.getById(companyId, tableId)
    if (!table.columns?.length) return ''

    const headers = (table.columns as any[]).map((c: any) => c.name)
    const rows = (table.rows as any[] || []).map((row: any) =>
      (table.columns as any[]).map((col: any) => {
        const val = (row.cells as Record<string, any>)?.[col.id]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    )

    return [headers.join(','), ...rows].join('\n')
  },
}
