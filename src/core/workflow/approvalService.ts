import { settingsService } from '@/infrastructure/settings/services/settingsService'
import { AppError } from '@/core/errors/app-error'

// ponytail: all approvals in one JSON blob in company_settings
// fine at company scale (10-100 pending), upgrade to a dedicated table if throughput matters

const KEY = 'pending_approvals'

interface ApprovalRecord {
  entityType: string
  entityId: string
  requestedBy: string
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected'
  resolvedBy?: string
  resolvedAt?: string
  reason?: string
}

async function loadApprovals(companyId: string): Promise<ApprovalRecord[]> {
  const raw = await settingsService.getCompany(companyId, KEY)
  return Array.isArray(raw) ? (raw as ApprovalRecord[]) : []
}

async function saveApprovals(companyId: string, records: ApprovalRecord[]): Promise<void> {
  await settingsService.setCompany(companyId, KEY, records, 'workflow')
}

export async function requestApproval(
  entityType: string,
  entityId: string,
  requestedBy: string,
  companyId: string
): Promise<ApprovalRecord> {
  const approvals = await loadApprovals(companyId)

  // Don't duplicate if already pending for same entity
  const existing = approvals.find(
    a => a.entityType === entityType && a.entityId === entityId && a.status === 'pending'
  )
  if (existing) {
    throw new AppError('CONFLICT', 'Approval already pending for this entity', 409)
  }

  const record: ApprovalRecord = {
    entityType,
    entityId,
    requestedBy,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  }

  approvals.push(record)
  await saveApprovals(companyId, approvals)
  return record
}

export async function approveRequest(
  entityType: string,
  entityId: string,
  approverId: string,
  companyId: string
): Promise<ApprovalRecord> {
  const approvals = await loadApprovals(companyId)
  const record = approvals.find(
    a => a.entityType === entityType && a.entityId === entityId && a.status === 'pending'
  )
  if (!record) {
    throw new AppError('NOT_FOUND', 'No pending approval found for this entity', 404)
  }

  record.status = 'approved'
  record.resolvedBy = approverId
  record.resolvedAt = new Date().toISOString()

  await saveApprovals(companyId, approvals)
  return record
}

export async function rejectRequest(
  entityType: string,
  entityId: string,
  approverId: string,
  companyId: string,
  reason?: string
): Promise<ApprovalRecord> {
  const approvals = await loadApprovals(companyId)
  const record = approvals.find(
    a => a.entityType === entityType && a.entityId === entityId && a.status === 'pending'
  )
  if (!record) {
    throw new AppError('NOT_FOUND', 'No pending approval found for this entity', 404)
  }

  record.status = 'rejected'
  record.resolvedBy = approverId
  record.resolvedAt = new Date().toISOString()
  if (reason) record.reason = reason

  await saveApprovals(companyId, approvals)
  return record
}

export async function getPendingApprovals(
  companyId: string,
  userId?: string
): Promise<ApprovalRecord[]> {
  const approvals = await loadApprovals(companyId)
  const pending = approvals.filter(a => a.status === 'pending')
  if (userId) {
    return pending.filter(a => a.requestedBy === userId)
  }
  return pending
}

export async function getAllApprovals(
  companyId: string
): Promise<ApprovalRecord[]> {
  return loadApprovals(companyId)
}
