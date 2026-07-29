export const Permissions = {
  // RBAC
  RBAC_MANAGE: 'rbac.manage',

  // Employees
  EMPLOYEES_LIST: 'employees.list',
  EMPLOYEES_READ: 'employees.read',
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_UPDATE: 'employees.update',
  EMPLOYEES_DELETE: 'employees.delete',

  // Projects
  PROJECTS_LIST: 'projects.list',
  PROJECTS_READ: 'projects.read',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_UPDATE: 'projects.update',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_MANAGE_MEMBERS: 'projects.manage_members',

  // Tasks
  TASKS_LIST: 'tasks.list',
  TASKS_READ: 'tasks.read',
  TASKS_CREATE: 'tasks.create',
  TASKS_UPDATE: 'tasks.update',
  TASKS_DELETE: 'tasks.delete',
  TASKS_COMMENT: 'tasks.comment',

  // Leads
  LEADS_LIST: 'leads.list',
  LEADS_READ: 'leads.read',
  LEADS_CREATE: 'leads.create',
  LEADS_UPDATE: 'leads.update',
  LEADS_DELETE: 'leads.delete',
  LEADS_ASSIGN: 'leads.assign',
  LEADS_CONVERT: 'leads.convert',

  // Customers
  CUSTOMERS_LIST: 'customers.list',
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_DELETE: 'customers.delete',

  // Accounting
  ACCOUNTING_READ: 'accounting.read',
  ACCOUNTING_CREATE: 'accounting.create',
  ACCOUNTING_MANAGE: 'accounting.manage',
  ACCOUNTING_REPORTS: 'accounting.reports',

  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_MANAGE: 'settings.manage',

  // Files
  FILES_UPLOAD: 'files.upload',
  FILES_READ: 'files.read',
  FILES_DELETE: 'files.delete',

  // Comments
  COMMENTS_READ: 'comments.read',
  COMMENTS_CREATE: 'comments.create',
  COMMENTS_UPDATE: 'comments.update',
  COMMENTS_DELETE: 'comments.delete',

  // Tags
  TAGS_READ: 'tags.read',
  TAGS_MANAGE: 'tags.manage',

  // Reports
  REPORTS_DASHBOARD: 'reports.dashboard',
  REPORTS_FINANCIAL: 'reports.financial',
  REPORTS_PROJECTS: 'reports.projects',
  REPORTS_TASKS: 'reports.tasks',

  // Activity
  ACTIVITY_LIST: 'activity.list',

  // Spreadsheets
  SPREADSHEETS_LIST: 'spreadsheets.list',
  SPREADSHEETS_READ: 'spreadsheets.read',
  SPREADSHEETS_CREATE: 'spreadsheets.create',
  SPREADSHEETS_UPDATE: 'spreadsheets.update',
  SPREADSHEETS_DELETE: 'spreadsheets.delete',
  SPREADSHEETS_MANAGE_COLUMNS: 'spreadsheets.manage_columns',
  SPREADSHEETS_EDIT_DATA: 'spreadsheets.edit_data',
  SPREADSHEETS_EXPORT: 'spreadsheets.export',

  // Departments
  DEPARTMENTS_LIST: 'departments.list',
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_DELETE: 'departments.delete',

  // Designations
  DESIGNATIONS_LIST: 'designations.list',
  DESIGNATIONS_CREATE: 'designations.create',
  DESIGNATIONS_UPDATE: 'designations.update',
  DESIGNATIONS_DELETE: 'designations.delete',

  // Teams
  TEAMS_LIST: 'teams.list',
  TEAMS_CREATE: 'teams.create',
  TEAMS_UPDATE: 'teams.update',
  TEAMS_DELETE: 'teams.delete',

  // Tasks (extended)
  TASKS_ASSIGN: 'tasks.assign',
  TASKS_WATCH: 'tasks.watch',
  TASKS_CHECKLIST: 'tasks.checklist',
  TASKS_LABELS: 'tasks.labels',

  // Work Logs
  WORK_LOGS_LIST: 'work_logs.list',
  WORK_LOGS_CREATE: 'work_logs.create',
  WORK_LOGS_UPDATE: 'work_logs.update',
  WORK_LOGS_APPROVE: 'work_logs.approve',

  // Timeline
  TIMELINE_VIEW: 'timeline.view',
  TIMELINE_EXPORT: 'timeline.export',

  // Projects (extended)
  PROJECTS_MODULES: 'projects.modules',
  PROJECTS_MILESTONES: 'projects.milestones',
  PROJECTS_ARCHIVE: 'projects.archive',

  // Notifications
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_MANAGE: 'notifications.manage',

  // Invoices
  INVOICES_LIST: 'invoices.list',
  INVOICES_READ: 'invoices.read',

  // CRM - Companies
  CRM_COMPANIES_LIST: 'crm_companies.list',
  CRM_COMPANIES_READ: 'crm_companies.read',
  CRM_COMPANIES_CREATE: 'crm_companies.create',
  CRM_COMPANIES_UPDATE: 'crm_companies.update',
  CRM_COMPANIES_DELETE: 'crm_companies.delete',

  // CRM - Contacts
  CONTACTS_LIST: 'contacts.list',
  CONTACTS_READ: 'contacts.read',
  CONTACTS_CREATE: 'contacts.create',
  CONTACTS_UPDATE: 'contacts.update',
  CONTACTS_DELETE: 'contacts.delete',

  // CRM - Deals
  DEALS_LIST: 'deals.list',
  DEALS_READ: 'deals.read',
  DEALS_CREATE: 'deals.create',
  DEALS_UPDATE: 'deals.update',
  DEALS_DELETE: 'deals.delete',
  DEALS_WON: 'deals.won',
  DEALS_LOST: 'deals.lost',

  // CRM - Activities
  ACTIVITIES_LIST: 'activities.list',
  ACTIVITIES_CREATE: 'activities.create',
  ACTIVITIES_UPDATE: 'activities.update',
  ACTIVITIES_DELETE: 'activities.delete',

  // CRM - Notes
  CRM_NOTES_CREATE: 'crm_notes.create',
  CRM_NOTES_READ: 'crm_notes.read',

  // Admin
  ADMIN_ACCESS: 'admin.access',
  ADMIN_MANAGE_JOBS: 'admin.manage_jobs',
  ADMIN_MANAGE_EVENTS: 'admin.manage_events',
  ADMIN_OBSERVABILITY: 'admin.observability',
} as const

export type PermissionCode = (typeof Permissions)[keyof typeof Permissions]
