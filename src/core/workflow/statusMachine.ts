export interface StatusTransition {
  from: string
  to: string
  requiresApproval: boolean
  approverRole?: string
}

// Static transition map keyed by entity type
const TRANSITIONS: Record<string, StatusTransition[]> = {
  invoice: [
    { from: 'draft', to: 'sent', requiresApproval: false },
    { from: 'sent', to: 'paid', requiresApproval: false },
    { from: 'sent', to: 'overdue', requiresApproval: false },
    { from: 'draft', to: 'cancelled', requiresApproval: false },
    { from: 'sent', to: 'cancelled', requiresApproval: false },
  ],
  purchase_order: [
    { from: 'draft', to: 'pending_approval', requiresApproval: false },
    { from: 'pending_approval', to: 'approved', requiresApproval: true, approverRole: 'manager' },
    { from: 'approved', to: 'received', requiresApproval: false },
    { from: '*', to: 'cancelled', requiresApproval: false }, // any → cancelled
  ],
  leave_request: [
    { from: 'pending', to: 'approved', requiresApproval: true, approverRole: 'manager' },
    { from: 'pending', to: 'rejected', requiresApproval: true, approverRole: 'manager' },
    { from: 'pending', to: 'cancelled', requiresApproval: false },
  ],
  work_log: [
    { from: 'pending', to: 'approved', requiresApproval: true, approverRole: 'manager' },
    { from: 'pending', to: 'rejected', requiresApproval: true, approverRole: 'manager' },
  ],
}

export function getStatusTransitions(entityType: string): StatusTransition[] {
  return TRANSITIONS[entityType] ?? []
}

export function canTransition(entityType: string, from: string, to: string): boolean {
  const transitions = TRANSITIONS[entityType]
  if (!transitions) return false
  return transitions.some(t => (t.from === '*' || t.from === from) && t.to === to)
}

export function requiresApproval(entityType: string, from: string, to: string): boolean {
  const transitions = TRANSITIONS[entityType]
  if (!transitions) return false
  const match = transitions.find(t => (t.from === '*' || t.from === from) && t.to === to)
  return match?.requiresApproval ?? false
}
