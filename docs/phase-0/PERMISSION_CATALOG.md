# Permission Catalog

**Project:** Nexlane
**Total Permissions:** 64
**Last Updated:** QG-1

---

## RBAC (1)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `rbac.manage` | Manage RBAC | Create, update, delete roles and assign permissions | Owner, Admin |

---

## Employees (5)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `employees.list` | List Employees | View employee directory | Owner, Admin, Manager |
| `employees.read` | View Employee | View individual employee details | Owner, Admin, Manager |
| `employees.create` | Create Employee | Add new employees | Owner, Admin |
| `employees.update` | Update Employee | Modify employee records | Owner, Admin, Manager |
| `employees.delete` | Delete Employee | Remove employees | Owner, Admin |

---

## Projects (6)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `projects.list` | List Projects | View project list | Owner, Admin, Manager |
| `projects.read` | View Project | View project details | Owner, Admin, Manager |
| `projects.create` | Create Project | Create new projects | Owner, Admin, Manager |
| `projects.update` | Update Project | Modify project details | Owner, Admin, Manager |
| `projects.delete` | Delete Project | Remove projects | Owner, Admin |
| `projects.manage_members` | Manage Project Members | Add/remove project members | Owner, Admin |

---

## Tasks (6)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `tasks.list` | List Tasks | View task list | Owner, Admin, Manager, Employee |
| `tasks.read` | View Task | View task details | Owner, Admin, Manager, Employee |
| `tasks.create` | Create Task | Create new tasks | Owner, Admin, Manager, Employee |
| `tasks.update` | Update Task | Modify tasks | Owner, Admin, Manager, Employee |
| `tasks.delete` | Delete Task | Remove tasks | Owner, Admin |
| `tasks.comment` | Comment on Task | Add comments to tasks | Owner, Admin, Manager, Employee |

---

## CRM — Leads (6)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `leads.list` | List Leads | View leads list | Owner, Admin, Manager |
| `leads.read` | View Lead | View lead details | Owner, Admin, Manager |
| `leads.create` | Create Lead | Add new leads | Owner, Admin, Manager |
| `leads.update` | Update Lead | Modify lead records | Owner, Admin, Manager |
| `leads.delete` | Delete Lead | Remove leads | Owner, Admin |
| `leads.convert` | Convert Lead | Convert lead to customer | Owner, Admin |

---

## CRM — Customers (5)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `customers.list` | List Customers | View customer list | Owner, Admin, Manager, Accountant |
| `customers.read` | View Customer | View customer details | Owner, Admin, Manager, Accountant |
| `customers.create` | Create Customer | Add new customers | Owner, Admin, Manager |
| `customers.update` | Update Customer | Modify customer records | Owner, Admin, Manager |
| `customers.delete` | Delete Customer | Remove customers | Owner, Admin |

---

## Invoices (2)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `invoices.list` | List Invoices | View invoice list | Owner, Admin, Accountant |
| `invoices.read` | View Invoice | View invoice details | Owner, Admin, Accountant |

---

## Accounting (4)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `accounting.read` | View Accounting Data | View financial records | Owner, Admin, Accountant |
| `accounting.create` | Create Accounting Entries | Create journal entries | Owner, Admin, Accountant |
| `accounting.manage` | Manage Accounting Config | Configure chart of accounts | Owner, Admin |
| `accounting.reports` | View Accounting Reports | Generate financial reports | Owner, Admin, Accountant |

---

## Spreadsheets (7)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `spreadsheets.list` | List Spreadsheets | View spreadsheet list | Owner, Admin, Manager, Accountant |
| `spreadsheets.read` | View Spreadsheet | View spreadsheet data | Owner, Admin, Manager, Accountant |
| `spreadsheets.create` | Create Spreadsheet | Create new spreadsheets | Owner, Admin, Manager |
| `spreadsheets.update` | Update Spreadsheet | Modify spreadsheet properties | Owner, Admin, Manager |
| `spreadsheets.delete` | Delete Spreadsheet | Remove spreadsheets | Owner, Admin |
| `spreadsheets.manage_columns` | Manage Columns | Add/edit/delete columns | Owner, Admin |
| `spreadsheets.edit_data` | Edit Spreadsheet Data | Edit cell values | Owner, Admin, Manager |

---

## Settings (2)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `settings.read` | View Settings | View system/company settings | Owner, Admin, Manager, Employee |
| `settings.manage` | Manage Settings | Modify system/company settings | Owner, Admin |

---

## Files (3)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `files.upload` | Upload Files | Upload files to system | Owner, Admin, Manager, Employee, Accountant |
| `files.read` | View Files | Download and view files | Owner, Admin, Manager, Employee, Accountant |
| `files.delete` | Delete Files | Remove files from system | Owner, Admin |

---

## Comments (4)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `comments.read` | View Comments | Read comments on entities | Owner, Admin, Manager, Employee, Accountant |
| `comments.create` | Create Comment | Add comments to entities | Owner, Admin, Manager, Employee, Accountant |
| `comments.update` | Update Comment | Edit own comments | Owner, Admin, Manager, Employee |
| `comments.delete` | Delete Comment | Delete own or any comment | Owner, Admin |

---

## Tags (2)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `tags.read` | View Tags | View available tags | Owner, Admin, Manager, Employee, Accountant |
| `tags.manage` | Manage Tags | Create, update, delete tags | Owner, Admin, Manager |

---

## Reports (4)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `reports.dashboard` | View Dashboard | View main dashboard | Owner, Admin, Manager, Employee, Accountant |
| `reports.financial` | View Financial Reports | View financial/accounting reports | Owner, Admin, Accountant |
| `reports.projects` | View Project Reports | View project performance reports | Owner, Admin, Manager |
| `reports.tasks` | View Task Reports | View task completion reports | Owner, Admin, Manager, Employee |

---

## Activity (1)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `activity.list` | View Activity Log | View audit trail / activity history | Owner, Admin, Manager, Employee |

---

## Notifications (2)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `notifications.read` | View Notifications | Read own notifications | Owner, Admin, Manager, Employee, Accountant |
| `notifications.manage` | Manage Notifications | Configure notification preferences | Owner, Admin, Manager |

---

## Admin (4)

| Code | Name | Description | Assigned To |
|------|------|-------------|-------------|
| `admin.access` | Admin Access | Access admin panel (system-wide) | Owner |
| `admin.manage_jobs` | Manage Background Jobs | View/manage background job queue | Owner, Admin |
| `admin.manage_events` | Manage Domain Events | View/replay domain events | Owner, Admin |
| `admin.observability` | View Observability Data | View logs, metrics, errors | Owner, Admin |

---

## Summary by Role

| Role | Permissions Count | Scope |
|------|-------------------|-------|
| **Owner** | 64 (all) | Full system access |
| **Admin** | 63 (all except `admin.access`) | Administrative access |
| **Manager** | ~30 | Department management |
| **Accountant** | ~22 | Financial module access (now includes invoices.list/invoices.read) |
| **Employee** | ~15 | Basic self-service access |
