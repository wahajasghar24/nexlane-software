import { NextResponse } from 'next/server'
import { authenticate } from '@/core/auth/authenticate'
import { getStatusTransitions } from '@/core/workflow/statusMachine'
import { approveRequest, rejectRequest } from '@/core/workflow/approvalService'
import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { AppError } from '@/core/errors/app-error'
import { z } from 'zod'

const bodySchema = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
})

// Map entityType → Supabase table + status column
const ENTITY_TABLES: Record<string, string> = {
  invoice: 'invoices',
  purchase_order: 'purchase_orders',
  leave_request: 'time_off_requests',
  work_log: 'work_logs',
}

// Determine what status to set after approval based on entity type
function getStatusAfterApproval(entityType: string): string {
  switch (entityType) {
    case 'leave_request':
    case 'work_log':
      return 'approved'
    case 'purchase_order':
      return 'approved'
    default:
      return 'approved'
  }
}

function getStatusAfterRejection(entityType: string): string {
  switch (entityType) {
    case 'leave_request':
    case 'work_log':
      return 'rejected'
    default:
      return 'rejected'
  }
}

export async function POST(request: Request) {
  try {
    const context = await authenticate(request)
    const body = bodySchema.parse(await request.json())

    // Validate entity type exists in our transition map
    const transitions = getStatusTransitions(body.entityType)
    if (transitions.length === 0) {
      throw new AppError('VALIDATION', `Unknown entity type: ${body.entityType}`, 400)
    }

    const entityConfig = ENTITY_TABLES[body.entityType]
    if (!entityConfig) {
      throw new AppError('VALIDATION', `No table mapping for entity type: ${body.entityType}`, 400)
    }

    if (body.action === 'approve') {
      await approveRequest(body.entityType, body.entityId, context.userId, context.companyId)

      const newStatus = getStatusAfterApproval(body.entityType)
      const supabase = await createClient()
      const { error } = await supabase
        .from(entityConfig)
        .update({ status: newStatus })
        .eq('id', body.entityId)
        .eq('company_id', context.companyId)

      if (error) throw new DatabaseError(error)

      return NextResponse.json({ data: { success: true, newStatus }, error: null })
    } else {
      const record = await rejectRequest(
        body.entityType,
        body.entityId,
        context.userId,
        context.companyId,
        body.reason
      )

      const newStatus = getStatusAfterRejection(body.entityType)
      const supabase = await createClient()
      const { error } = await supabase
        .from(entityConfig)
        .update({ status: newStatus })
        .eq('id', body.entityId)
        .eq('company_id', context.companyId)

      if (error) throw new DatabaseError(error)

      return NextResponse.json({ data: { success: true, newStatus }, error: null })
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json({ data: null, error: (err as AppError).message }, { status: (err as AppError).status })
    }
    return NextResponse.json(
      { data: null, error: err instanceof z.ZodError ? (err.issues[0]?.message ?? 'Validation failed') : 'Internal server error' },
      { status: err instanceof z.ZodError ? 400 : 500 },
    )
  }
}
