# Manual Test Checklist

## Prerequisites
- [ ] Seed data applied (`supabase/seed.sql` executed)
- [ ] All migrations run (000-044)
- [ ] Application builds and runs (`npm run dev`)
- [ ] Test users exist (alex@nexlane.com / password123, etc.)

---

## Module A: Authentication

### A.1 Login Flow
- [ ] Visit `/login` — login form renders
- [ ] Enter valid credentials (alex@nexlane.com / password123)
- [ ] Submit — redirects to dashboard (`/`)
- [ ] Dashboard loads with user name displayed
- [ ] Enter invalid email — error message shown
- [ ] Enter invalid password — error message shown
- [ ] Enter empty fields — validation error shown
- [ ] Already logged in user visits `/login` — redirects to dashboard

### A.2 Logout Flow
- [ ] Click logout button — session cleared
- [ ] After logout, redirect to `/login`
- [ ] After logout, visiting `/` redirects to `/login`
- [ ] API calls after logout return 401

### A.3 Signup Flow
- [ ] Visit `/signup` — registration form renders
- [ ] Fill all fields and submit — account created
- [ ] Duplicate email — error displayed
- [ ] Weak password — validation error (if enforced)
- [ ] After signup — redirect to login with success message

### A.4 Session Persistence
- [ ] Close tab, reopen — still logged in
- [ ] Clear cookies — session cleared, redirected to login

---

## Module B: Employee Management

### B.1 Employee List (`/employees`)
- [ ] Table renders with all 10 seed employees
- [ ] Columns: Code, Name, Department, Designation, Status, Position
- [ ] Pagination works (if >20 employees)
- [ ] Page number and total displayed
- [ ] Previous/Next buttons work and disable appropriately

### B.2 Employee Search & Filters
- [ ] Search by employee code (e.g., "EMP-001") — 1 result
- [ ] Search by partial code (e.g., "EMP") — all results
- [ ] Filter by department — list filtered
- [ ] Filter by designation — list filtered
- [ ] Filter by status — list filtered
- [ ] Combined search + filters work
- [ ] Clear filters — full list restored

### B.3 Create Employee (`/employees/new`)
- [ ] Form renders with all required fields
- [ ] Profile ID field accepts valid UUID
- [ ] Required fields (first_name, last_name, phone, position, status)
- [ ] Submit with empty required fields — validation error
- [ ] Submit valid form — employee created, redirected to detail
- [ ] Created employee appears in list

### B.4 Employee Detail (`/employees/[id]`)
- [ ] All employee info displayed
- [ ] Profile info displayed (name, email, phone)
- [ ] Department and designation shown as labels
- [ ] Associated projects listed
- [ ] Tasks assigned shown
- [ ] Work logs shown
- [ ] Activity timeline shown
- [ ] Back link returns to employee list

### B.5 Edit Employee (`/employees/[id]/edit`)
- [ ] Form pre-filled with existing data
- [ ] Change name, submit — name updates in profile too
- [ ] Change department, submit — department updates
- [ ] Change status, submit — status updates
- [ ] Cancel returns to detail page
- [ ] After edit, detail page shows updated values

### B.6 Delete Employee
- [ ] Delete button visible (on detail page)
- [ ] Click delete — confirm dialog? (check if exists)
- [ ] Confirm — employee removed from list
- [ ] Deleted employee does not appear in list
- [ ] Deleted employee does not appear in search

---

## Module C: Departments

### C.1 Department List (`/departments`)
- [ ] List shows all seed departments (Engineering, Design, etc.)
- [ ] Columns: Name, Description
- [ ] Click department name — maybe see detail (if implemented)

### C.2 Create Department
- [ ] "New Department" button/action available
- [ ] Form submits successfully
- [ ] New department appears in list
- [ ] Duplicate name shows error

### C.3 Update Department
- [ ] Edit action available per row
- [ ] Changes persist after save
- [ ] Name field validation works

### C.4 Delete Department
- [ ] Delete action available
- [ ] Department removed from list
- [ ] Employees in deleted department show null/no department

---

## Module D: Designations

### D.1 Designation List (`/designations`)
- [ ] List shows all seed designations
- [ ] Columns: Name, Description

### D.2 CRUD Operations
- [ ] Create designation — appears in list
- [ ] Edit designation — changes persist
- [ ] Delete designation — removed from list
- [ ] Duplicate name validation works

---

## Module E: Teams

### E.1 Team List (`/teams`)
- [ ] List shows all seed teams
- [ ] Team name, description, lead name shown
- [ ] Member count shown
- [ ] Click team — navigates to team detail

### E.2 Create Team
- [ ] Form renders with name, description, lead_id
- [ ] Required fields validated
- [ ] Created team appears in list

### E.3 Team Detail (`/teams/[id]`)
- [ ] Team info displayed
- [ ] Team members displayed with names and roles
- [ ] Lead highlighted

### E.4 Team Members
- [ ] Add member to team — appears in member list
- [ ] Remove member from team — disappears
- [ ] Add duplicate member — error

---

## Module F: Projects

### F.1 Project List (`/projects`)
- [ ] List shows all active projects (not archived)
- [ ] Columns: Name, Client, Status, Priority, Progress, Members
- [ ] Color indicator shown per project
- [ ] Status badges use correct colors
- [ ] Priority badges use correct colors

### F.2 Project Search & Filters
- [ ] Search by name
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Combined filters work

### F.3 Create Project (`/projects/new`)
- [ ] Form renders with name (required), description, client, status, priority, dates, budget
- [ ] Submit valid form — project created, redirects to list or detail
- [ ] Validation errors shown for invalid input

### F.4 Project Detail (`/projects/[id]`)
- [ ] Project info displayed
- [ ] Members list shown with roles
- [ ] Modules shown with status
- [ ] Milestones shown with status
- [ ] Task count displayed

### F.5 Edit Project (`/projects/[id]/edit`)
- [ ] Pre-filled form
- [ ] Changes persist
- [ ] Status/priority updates reflected

### F.6 Archive/Unarchive
- [ ] Archive action available
- [ ] Archived project not shown in main list
- [ ] Archive filter shows archived projects
- [ ] Unarchive restores to main list

### F.7 Delete Project
- [ ] Delete action — soft delete
- [ ] Project not shown in list
- [ ] Related tasks still exist (referential integrity)

### F.8 Project Members
- [ ] Add member to project
- [ ] Remove member from project
- [ ] Member role displayed

### F.9 Project Modules
- [ ] Create module — appears in module list
- [ ] Update module status
- [ ] Delete module
- [ ] Sort order is respected

### F.10 Milestones
- [ ] Create milestone
- [ ] Update milestone status
- [ ] Mark milestone completed
- [ ] Delete milestone

---

## Module G: Tasks

### G.1 Task List (`/tasks`)
- [ ] List shows tasks with title, status, priority, assignee, due date
- [ ] Board view (`/tasks/board`) shows Kanban columns

### G.2 Task Search & Filters
- [ ] Search by title
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Filter by assignee
- [ ] Filter by project

### G.3 Create Task (`/tasks/new`)
- [ ] Form renders with title (required), description, project, status, priority, assignee, dates
- [ ] Related entity selection works

### G.4 Task Detail (`/tasks/[id]`)
- [ ] Task info displayed
- [ ] Assignees listed
- [ ] Checklist items shown with completion toggle
- [ ] Labels shown with colors
- [ ] Watchers listed
- [ ] Dependencies shown
- [ ] Comments shown
- [ ] Activity timeline shown

### G.5 Task Assignees
- [ ] Add assignee to task
- [ ] Remove assignee from task
- [ ] Multiple assignees work

### G.6 Task Checklist
- [ ] Add checklist item — appears in list
- [ ] Toggle checklist item — completion toggles
- [ ] Delete checklist item

### G.7 Task Labels
- [ ] Create label — appears in label list
- [ ] Assign label to task
- [ ] Remove label from task
- [ ] Label color displayed

### G.8 Task Watchers
- [ ] Watch task — appears in watchers list
- [ ] Unwatch task — removed from watchers

### G.9 Task Dependencies
- [ ] Add dependency (blocked by another task)
- [ ] Remove dependency
- [ ] Blocked tasks show dependency info

### G.10 Task Comments
- [ ] Add comment to task
- [ ] Edit own comment
- [ ] Delete own comment
- [ ] Comment appears in activity timeline

---

## Module H: Work Logs

### H.1 Work Log List (`/work-logs`)
- [ ] List shows work logs with date, employee, project, hours, description
- [ ] Daily view shows logs for selected date
- [ ] Summary view (`/work-logs/summary`) shows aggregated hours

### H.2 Create Work Log
- [ ] Form renders with employee, date, hours, description, project/task
- [ ] Hours validation (positive number)
- [ ] Date validation

### H.3 Update Work Log
- [ ] Edit work log — changes persist
- [ ] Status updates (submitted, approved, rejected)

### H.4 Approve/Reject Work Log
- [ ] Approve action changes status
- [ ] Reject action changes status with reason
- [ ] Activity logged for approval/rejection

---

## Module I: Activity Timeline (`/timeline`)

- [ ] Timeline shows recent activity across all modules
- [ ] Filter by entity type (employee, project, task, lead, deal, etc.)
- [ ] Filter by date range
- [ ] Activity entries show actor, action, timestamp
- [ ] Click activity item navigates to related entity

---

## Module J: CRM Dashboard (`/crm`)

- [ ] Summary cards show: Total Leads, Active Deals, Won Deals, Companies, Contacts
- [ ] Numbers match actual data
- [ ] Quick links navigate to each section

---

## Module K: Lead Management

### K.1 Lead List (`/crm/leads`)
- [ ] List shows all non-deleted leads
- [ ] Columns: Title, Name, Company, Status, Priority, Assigned To, Created
- [ ] Status badges use correct colors (gray/green/blue/orange/purple)

### K.2 Lead Search & Filters
- [ ] Search by title, name, company
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Filter by source
- [ ] Filter by assigned_to
- [ ] Pagination works

### K.3 Create Lead (`/crm/leads/new`)
- [ ] Form renders with all fields
- [ ] Title and Name are required
- [ ] Email validation (must be valid email format)
- [ ] Website validation (must be valid URL)
- [ ] Submit — lead created, redirected to detail page

### K.4 Lead Detail (`/crm/leads/[id]`)
- [ ] All lead fields displayed
- [ ] Assigned employee shown
- [ ] CRM company linked (if associated)
- [ ] Notes section with list and add form
- [ ] Activity timeline shown

### K.5 Edit Lead (`/crm/leads/[id]/edit`)
- [ ] Pre-filled form
- [ ] Changes persist

### K.6 Lead Assignment
- [ ] Assign lead to an employee
- [ ] Assignment reflected in lead detail

### K.7 Lead Notes
- [ ] Add note to lead — appears in notes list
- [ ] Multiple notes displayed chronologically

### K.8 Lead Conversion
- [ ] Convert lead — deal created
- [ ] Lead status changes to "converted"
- [ ] Converted lead shows deal reference
- [ ] New deal appears in deal pipeline

### K.9 Delete Lead
- [ ] Soft delete — removed from list
- [ ] Deleted lead not shown

---

## Module L: CRM Companies

### L.1 Company List (`/crm/companies`)
- [ ] List shows all CRM companies
- [ ] Columns: Name, Industry, Website, Contacts

### L.2 Create Company (`/crm/companies/new`)
- [ ] Form with name, industry, website, phone, email, address, notes
- [ ] Name is required
- [ ] Created company appears in list

### L.3 Company Detail (`/crm/companies/[id]`)
- [ ] Company info displayed
- [ ] Contacts for this company shown
- [ ] Deals for this company shown

### L.4 Edit Company (`/crm/companies/[id]/edit`)
- [ ] Pre-filled form
- [ ] Changes persist

### L.5 Delete Company
- [ ] Soft delete
- [ ] Leads referencing company show null

---

## Module M: Contacts

### M.1 Contact List (`/crm/contacts`)
- [ ] List shows all contacts
- [ ] Columns: Name, Company, Email, Phone, WhatsApp

### M.2 Create Contact (`/crm/contacts/new`)
- [ ] Form with name (required), company, email, phone, whatsapp, designation
- [ ] Primary contact toggle works

### M.3 Contact Detail (`/crm/contacts/[id]`)
- [ ] Contact info displayed
- [ ] Company linked

### M.4 Edit Contact (`/crm/contacts/[id]/edit`)
- [ ] Pre-filled form
- [ ] Changes persist

### M.5 Delete Contact
- [ ] Soft delete

---

## Module N: Deal Pipeline

### N.1 Pipeline View (`/crm/deals`)
- [ ] Kanban-style view with 7 columns
- [ ] Columns: New, Contacted, Demo Scheduled, Proposal Sent, Negotiation, Won, Lost
- [ ] Card count per column
- [ ] Won deals in green, Lost in red
- [ ] Card shows: name, value, probability, owner, close date

### N.2 Create Deal (`/crm/deals/new`)
- [ ] Form renders with: name (required), value, probability, stage, close date, owner, lead, company, notes
- [ ] Created deal appears in pipeline

### N.3 Deal Detail (`/crm/deals/[id]`)
- [ ] All deal info displayed
- [ ] Stage progress/status shown
- [ ] Activities listed
- [ ] If Won: customer info displayed
- [ ] Edit/Delete actions available

### N.4 Mark Deal Won
- [ ] Click "Mark Won" — stage changes to won
- [ ] Probability set to 100%
- [ ] Actual close date recorded
- [ ] Customer record automatically created
- [ ] Customer appears in customers table
- [ ] Deal moves to Won column in pipeline

### N.5 Mark Deal Lost
- [ ] Click "Mark Lost" — stage changes to lost
- [ ] Optional lost reason/notes
- [ ] Deal moves to Lost column in pipeline

### N.6 Edit Deal (`/crm/deals/[id]/edit`)
- [ ] Pre-filled form
- [ ] Stage/value/probability changes persist

### N.7 Delete Deal
- [ ] Soft delete — removed from pipeline

---

## Module O: Activities

### O.1 Activity List (`/crm/activities`)
- [ ] List shows all activities
- [ ] Filter by type (call, meeting, email, follow_up, task)
- [ ] Filter by entity (lead, deal, contact, company)
- [ ] Filter by assigned employee
- [ ] Activities grouped chronologically

### O.2 Create Activity
- [ ] Via related entity (lead/deal/contact) — activity appears in list
- [ ] Subject and type required
- [ ] Scheduled date optional

### O.3 Update Activity
- [ ] Edit activity — changes persist

### O.4 Delete Activity
- [ ] Activity removed from list

---

## Module P: n8n Integration

### P.1 Webhook Endpoint
- [ ] `POST /api/webhooks/n8n` with valid auth receives webhook
- [ ] Invalid API key returns 401/403
- [ ] Activity logged in activity_logs on successful receipt

### P.2 Outbound Events
- [ ] Creating a lead triggers `lead.created` event
- [ ] Marking deal won triggers `deal.won` event
- [ ] Converting lead triggers `lead.converted` event
- [ ] Events appear in `domain_events` table

---

## Module Q: Navigation & Layout

### Q.1 Sidebar Navigation
- [ ] All modules accessible from sidebar
- [ ] Active module highlighted
- [ ] Collapsed sidebar still shows icons

### Q.2 Breadcrumbs
- [ ] Breadcrumbs show current location
- [ ] Click breadcrumb — navigates correctly

### Q.3 Dark Mode
- [ ] Toggle dark mode — all pages switch
- [ ] Text readable in dark mode
- [ ] Badges/colors work in dark mode

### Q.4 Responsive
- [ ] Pages render on 375px viewport (mobile)
- [ ] Pages render on 768px (tablet)
- [ ] Pages render on 1440px (desktop)
- [ ] No horizontal scroll on mobile
- [ ] Forms collapse to single column on mobile
- [ ] Tables scroll horizontally on mobile

---

## Module R: Error Handling

### R.1 404 Pages
- [ ] Navigate to `/nonexistent` — 404 page renders
- [ ] Navigate to `/employees/00000000-0000-0000-0000-000000000000` — error shown

### R.2 Network Errors
- [ ] Disconnect network, perform action — error message shown
- [ ] Reconnect — application recovers

### R.3 Concurrent Editing
- [ ] Two users edit same record — last write wins (no conflict detection)
- [ ] Verify no data corruption

---

## Module S: Data Integrity

### S.1 Soft Delete Verification
- [ ] Query DB directly: soft-deleted records have `deleted_at` set
- [ ] Query DB directly: soft-deleted records not returned by API

### S.2 Cascade Verification
- [ ] Delete a company — all related data cascade deleted
- [ ] (Cannot test easily with seed data — requires raw SQL)

### S.3 Audit Logging
- [ ] Every create/update/delete has corresponding `activity_logs` entry
- [ ] Logs show actor, action, timestamp

---

## Test Sign-off

| Tester | Date | Modules Passed | Modules Failed | Notes |
|--------|------|----------------|----------------|-------|
| | | | | |

---

*Mark each test case as ✅ Pass, ❌ Fail, or ⏭ Not Applicable. For failures, include the browser/device used and steps to reproduce.*

---

# Part 2: Nexlane ERP v2 — Test Data Guide (2026-08-03)

## App URL
- **https://nexlane-software.vercel.app** — login: `alex@nexlane.com` / `password123`
- (Purana URL `nexlane-projects-nexlane.vercel.app` bhi same build serve karta hai — naya URL use karo)

## Live Test Data (seed ho chuka hai)

| Module | Data |
|--------|------|
| Inventory | 8 products (SRV-ACC, SRV-ADS, SRV-OA, SRV-CONT, SRV-REP, SRV-SUP, PROD-TOOL, PROD-REPORT) + Main Warehouse (WH-MAIN) + per-warehouse stock (100–200 units) |
| CRM | 4 customers (Ahmed Traders, Luna Beauty PK, TechMart PK, Sunrise Exports), 5 leads, 3 deals (proposal_sent / contacted / won) |
| Sales | **SO-202608-00001** — CONFIRMED, auto-invoice **INV-202608-00001** ($1,097), stock deducted (ACC 100→98, ADS 100→99) |
| Purchase | **PO-202608-00001** — RECEIVED, stock in (REP 200→210, SUP 200→205) |
| Accounting | Invoice INV-202608-00001 + payment (bank, $1,097) + 5 journal entries |
| Projects | 3 projects (Website Redesign, Mobile App, AI Chatbot) + 4 tasks + 2 work logs |
| HR | 3 employees (alex, Moiz, wahaj), attendance entry today, 2 time-off requests (1 approved annual, 1 pending sick) |

## Test Flow (recommended order)

1. **Login** → Dashboard loads with sidebar sections (Management, Accounting, CRM, Sales & Inventory, HR, Tools)
2. **Employees** (`/employees`) → 3 rows; click name → detail page (tabs: Overview/Projects/Tasks/Work Logs/Activity); Edit → form pre-filled
3. **Projects** → 3 projects; click → detail; **Work Logs** → 2 logs
4. **CRM → Leads** → 5 leads; **Deals** → 3 deals (stage filter); **Companies** → 3; click any → detail page
5. **Inventory → Products** → 8 products with stock; **Warehouses** → WH-MAIN row; product detail → Stock Adjustment
6. **Sales Orders** → SO-202608-00001 (Confirmed); detail → items + linked invoice; **New Quotation** → create + confirm (stock deduct + invoice auto-generate hota hai)
7. **Purchase Orders** → PO-202608-00001 (Received); detail → items
8. **Accounting → Invoices** → INV-202608-00001 (Paid); **Payments** → payment row; **Reports** → GL / Balance Sheet / Cash Flow
9. **HR → Attendance** → today's entry (check-in/out); **Time Off** → 1 approved + 1 pending (approve/reject karke dekho)
10. **Notifications / Files / Settings** → render check

## Known notes
- New Quotation form: item `description` required hai
- Reports: `/accounting/reports` (sidebar link); `/reports` URL exist nahi karta
- n8n webhook events: sales/inventory/HR actions `domain_events` table + webhook URL (agar set ho) pe fire karte hain
