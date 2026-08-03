export const EventTypes = {
  // Auth
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_CREATED: 'user.created',

  // Employees
  EMPLOYEE_CREATED: 'employee.created',
  EMPLOYEE_UPDATED: 'employee.updated',
  EMPLOYEE_DELETED: 'employee.deleted',

  // Departments
  DEPARTMENT_CREATED: 'department.created',
  DEPARTMENT_UPDATED: 'department.updated',
  DEPARTMENT_DELETED: 'department.deleted',

  // Designations
  DESIGNATION_CREATED: 'designation.created',
  DESIGNATION_UPDATED: 'designation.updated',
  DESIGNATION_DELETED: 'designation.deleted',

  // Teams
  TEAM_CREATED: 'team.created',
  TEAM_UPDATED: 'team.updated',
  TEAM_DELETED: 'team.deleted',
  TEAM_MEMBER_ADDED: 'team.member_added',
  TEAM_MEMBER_REMOVED: 'team.member_removed',

  // Projects
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_ARCHIVED: 'project.archived',
  PROJECT_UNARCHIVED: 'project.unarchived',
  PROJECT_MEMBER_ADDED: 'project.member_added',
  PROJECT_MEMBER_REMOVED: 'project.member_removed',

  // Project Modules
  MODULE_CREATED: 'module.created',
  MODULE_UPDATED: 'module.updated',
  MODULE_DELETED: 'module.deleted',

  // Milestones
  MILESTONE_CREATED: 'milestone.created',
  MILESTONE_UPDATED: 'milestone.updated',
  MILESTONE_DELETED: 'milestone.deleted',
  MILESTONE_COMPLETED: 'milestone.completed',

  // Tasks
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_ASSIGNED: 'task.assigned',
  TASK_UNASSIGNED: 'task.unassigned',
  TASK_STATUS_CHANGED: 'task.status_changed',
  TASK_STARTED: 'task.started',
  TASK_COMPLETED: 'task.completed',
  TASK_BLOCKED: 'task.blocked',
  TASK_CHECKLIST_ITEM_ADDED: 'task.checklist_item_added',
  TASK_CHECKLIST_ITEM_TOGGLED: 'task.checklist_item_toggled',
  TASK_WATCHER_ADDED: 'task.watcher_added',
  TASK_DEPENDENCY_ADDED: 'task.dependency_added',
  TASK_DEPENDENCY_REMOVED: 'task.dependency_removed',

  // Work Logs
  WORK_LOG_CREATED: 'work_log.created',
  WORK_LOG_UPDATED: 'work_log.updated',
  WORK_LOG_SUBMITTED: 'work_log.submitted',
  WORK_LOG_APPROVED: 'work_log.approved',
  WORK_LOG_REJECTED: 'work_log.rejected',

  // Comments
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',

  // Tags
  TAG_CREATED: 'tag.created',
  TAG_UPDATED: 'tag.updated',
  TAG_DELETED: 'tag.deleted',

  // Skills
  SKILL_ADDED: 'skill.added',
  SKILL_UPDATED: 'skill.updated',
  SKILL_REMOVED: 'skill.removed',

  // Leads
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_DELETED: 'lead.deleted',
  LEAD_ASSIGNED: 'lead.assigned',
  LEAD_CONVERTED: 'lead.converted',
  LEAD_STATUS_CHANGED: 'lead.status_changed',
  LEAD_NOTE_ADDED: 'lead.note_added',

  // Customers
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',

  // Accounting
  INVOICE_CREATED: 'invoice.created',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',
  EXPENSE_CREATED: 'expense.created',
  PAYMENT_RECEIVED: 'payment.received',

  // Files
  FILE_UPLOADED: 'file.uploaded',
  FILE_DELETED: 'file.deleted',

  // RBAC
  PERMISSION_CHANGED: 'permission.changed',
  ROLE_CREATED: 'role.created',
  ROLE_UPDATED: 'role.updated',
  ROLE_DELETED: 'role.deleted',
  USER_ROLE_ASSIGNED: 'user_role.assigned',

  // CRM - Companies
  CRM_COMPANY_CREATED: 'crm_company.created',
  CRM_COMPANY_UPDATED: 'crm_company.updated',
  CRM_COMPANY_DELETED: 'crm_company.deleted',

  // CRM - Contacts
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CONTACT_DELETED: 'contact.deleted',

  // CRM - Deals
  DEAL_CREATED: 'deal.created',
  DEAL_UPDATED: 'deal.updated',
  DEAL_DELETED: 'deal.deleted',
  DEAL_WON: 'deal.won',
  DEAL_LOST: 'deal.lost',
  DEAL_STAGE_CHANGED: 'deal.stage_changed',

  // CRM - Activities
  ACTIVITY_CREATED: 'activity.created',
  ACTIVITY_UPDATED: 'activity.updated',
  ACTIVITY_DELETED: 'activity.deleted',

  // Sales & Inventory
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  PRODUCT_STOCK_ADJUSTED: 'product.stock_adjusted',
  SALES_ORDER_CREATED: 'sales_order.created',
  SALES_ORDER_CONFIRMED: 'sales_order.confirmed',
  SALES_ORDER_CANCELLED: 'sales_order.cancelled',
  PURCHASE_ORDER_CREATED: 'purchase_order.created',
  PURCHASE_ORDER_RECEIVED: 'purchase_order.received',
  PURCHASE_ORDER_CANCELLED: 'purchase_order.cancelled',

  // HR - Attendance & Time Off
  ATTENDANCE_CLOCKED_IN: 'attendance.clocked_in',
  ATTENDANCE_CLOCKED_OUT: 'attendance.clocked_out',
  TIMEOFF_REQUESTED: 'timeoff.requested',
  TIMEOFF_DECIDED: 'timeoff.decided',

  // System
  JOB_FAILED: 'job.failed',
  EVENT_REPLAYED: 'event.replayed',
} as const

export type EventType = (typeof EventTypes)[keyof typeof EventTypes]

export type EventHandler = (event: import('@/core/types/common').DomainEvent) => Promise<void>
