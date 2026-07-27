-- UP
-- Critical fix: Enable RLS on all Phase 1 and Phase 2 tables
-- These were created in migrations 034-043 but never had RLS policies added

-- ====== PHASE 1 TABLES ======

-- Departments (034)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY dept_select ON departments FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY dept_insert ON departments FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY dept_update ON departments FOR UPDATE USING (is_admin(auth.uid(), company_id));
CREATE POLICY dept_delete ON departments FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Designations (034)
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
CREATE POLICY desig_select ON designations FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY desig_insert ON designations FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY desig_update ON designations FOR UPDATE USING (is_admin(auth.uid(), company_id));
CREATE POLICY desig_delete ON designations FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Teams (034)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_select ON teams FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY team_insert ON teams FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY team_update ON teams FOR UPDATE USING (is_admin(auth.uid(), company_id));
CREATE POLICY team_delete ON teams FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Team Members (034)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY tm_select ON team_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM teams WHERE id = team_id AND company_id = auth_company_id())
);
CREATE POLICY tm_insert ON team_members FOR INSERT WITH CHECK (
  is_admin(auth.uid(), (SELECT company_id FROM teams WHERE id = team_id))
);
CREATE POLICY tm_delete ON team_members FOR DELETE USING (
  is_admin(auth.uid(), (SELECT company_id FROM teams WHERE id = team_id))
);

-- Employee Skills (034)
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY es_select ON employee_skills FOR SELECT USING (
  EXISTS (SELECT 1 FROM employees WHERE id = employee_id AND company_id = auth_company_id())
);
CREATE POLICY es_insert ON employee_skills FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM employees WHERE id = employee_id AND company_id = auth_company_id())
);
CREATE POLICY es_delete ON employee_skills FOR DELETE USING (
  EXISTS (SELECT 1 FROM employees WHERE id = employee_id AND company_id = auth_company_id())
);

-- Project Modules (035)
ALTER TABLE project_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY pm_select ON project_modules FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY pm_insert ON project_modules FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY pm_update ON project_modules FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY pm_delete ON project_modules FOR DELETE USING (company_id = auth_company_id());

-- Milestones (035)
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY ms_select ON milestones FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY ms_insert ON milestones FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY ms_update ON milestones FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY ms_delete ON milestones FOR DELETE USING (company_id = auth_company_id());

-- Task Assignees (036)
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY ta_select ON task_assignees FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY ta_insert ON task_assignees FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY ta_delete ON task_assignees FOR DELETE USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);

-- Task Labels (036)
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY tl_select ON task_labels FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY tl_insert ON task_labels FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY tl_update ON task_labels FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY tl_delete ON task_labels FOR DELETE USING (company_id = auth_company_id());

-- Task Label Mappings (036)
ALTER TABLE task_label_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tlm_select ON task_label_mappings FOR SELECT USING (true);
CREATE POLICY tlm_insert ON task_label_mappings FOR INSERT WITH CHECK (true);
CREATE POLICY tlm_delete ON task_label_mappings FOR DELETE USING (true);

-- Task Checklist Items (036)
ALTER TABLE task_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tci_select ON task_checklist_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY tci_insert ON task_checklist_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY tci_update ON task_checklist_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY tci_delete ON task_checklist_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);

-- Task Watchers (036)
ALTER TABLE task_watchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tw_select ON task_watchers FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY tw_insert ON task_watchers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY tw_delete ON task_watchers FOR DELETE USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);

-- Task Dependencies (036)
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY td_select ON task_dependencies FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY td_insert ON task_dependencies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY td_delete ON task_dependencies FOR DELETE USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);

-- Work Logs (037)
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY wl_select ON work_logs FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY wl_insert ON work_logs FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY wl_update ON work_logs FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY wl_delete ON work_logs FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Task Attachments (039)
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY ta2_select ON task_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY ta2_insert ON task_attachments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);
CREATE POLICY ta2_delete ON task_attachments FOR DELETE USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND company_id = auth_company_id())
);

-- ====== PHASE 2 TABLES ======

-- CRM Companies (040)
ALTER TABLE crm_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY cc_select ON crm_companies FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY cc_insert ON crm_companies FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY cc_update ON crm_companies FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY cc_delete ON crm_companies FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Lead Notes (040)
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY ln_select ON lead_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND company_id = auth_company_id())
);
CREATE POLICY ln_insert ON lead_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND company_id = auth_company_id())
);
CREATE POLICY ln_update ON lead_notes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND company_id = auth_company_id())
);
CREATE POLICY ln_delete ON lead_notes FOR DELETE USING (
  EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND company_id = auth_company_id())
);

-- Contacts (041)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY cont_select ON contacts FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY cont_insert ON contacts FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY cont_update ON contacts FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY cont_delete ON contacts FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Deals (042)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY deal_select ON deals FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY deal_insert ON deals FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY deal_update ON deals FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY deal_delete ON deals FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Activities (043)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY act_select ON activities FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY act_insert ON activities FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY act_update ON activities FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY act_delete ON activities FOR DELETE USING (is_admin(auth.uid(), company_id));

-- ====== Additional Indexes for Phase 2 tables ======
CREATE INDEX IF NOT EXISTS idx_lead_notes_company ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_stage ON deals(company_id, stage);
CREATE INDEX IF NOT EXISTS idx_activities_company_type ON activities(company_id, entity_type, entity_id);

-- ====== Helper function for auth_company_id used in policies ======
-- Ensure the helper function is accessible
-- (already defined in 031_rls_policies.sql, but ensure it exists)
CREATE OR REPLACE FUNCTION auth_company_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'company_id',
    current_setting('app.current_company_id', true)
  )::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID, company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1
      AND ur.company_id = $2
      AND r.name IN ('Owner', 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DOWN
-- Drop all newly created policies (simplified — in production use DO block)
DROP POLICY IF EXISTS dept_select ON departments; DROP POLICY IF EXISTS dept_insert ON departments; DROP POLICY IF EXISTS dept_update ON departments; DROP POLICY IF EXISTS dept_delete ON departments;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS desig_select ON designations; DROP POLICY IF EXISTS desig_insert ON designations; DROP POLICY IF EXISTS desig_update ON designations; DROP POLICY IF EXISTS desig_delete ON designations;
ALTER TABLE designations DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS team_select ON teams; DROP POLICY IF EXISTS team_insert ON teams; DROP POLICY IF EXISTS team_update ON teams; DROP POLICY IF EXISTS team_delete ON teams;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tm_select ON team_members; DROP POLICY IF EXISTS tm_insert ON team_members; DROP POLICY IF EXISTS tm_delete ON team_members;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS es_select ON employee_skills; DROP POLICY IF EXISTS es_insert ON employee_skills; DROP POLICY IF EXISTS es_delete ON employee_skills;
ALTER TABLE employee_skills DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pm_select ON project_modules; DROP POLICY IF EXISTS pm_insert ON project_modules; DROP POLICY IF EXISTS pm_update ON project_modules; DROP POLICY IF EXISTS pm_delete ON project_modules;
ALTER TABLE project_modules DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ms_select ON milestones; DROP POLICY IF EXISTS ms_insert ON milestones; DROP POLICY IF EXISTS ms_update ON milestones; DROP POLICY IF EXISTS ms_delete ON milestones;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ta_select ON task_assignees; DROP POLICY IF EXISTS ta_insert ON task_assignees; DROP POLICY IF EXISTS ta_delete ON task_assignees;
ALTER TABLE task_assignees DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tl_select ON task_labels; DROP POLICY IF EXISTS tl_insert ON task_labels; DROP POLICY IF EXISTS tl_update ON task_labels; DROP POLICY IF EXISTS tl_delete ON task_labels;
ALTER TABLE task_labels DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tlm_select ON task_label_mappings; DROP POLICY IF EXISTS tlm_insert ON task_label_mappings; DROP POLICY IF EXISTS tlm_delete ON task_label_mappings;
ALTER TABLE task_label_mappings DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tci_select ON task_checklist_items; DROP POLICY IF EXISTS tci_insert ON task_checklist_items; DROP POLICY IF EXISTS tci_update ON task_checklist_items; DROP POLICY IF EXISTS tci_delete ON task_checklist_items;
ALTER TABLE task_checklist_items DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tw_select ON task_watchers; DROP POLICY IF EXISTS tw_insert ON task_watchers; DROP POLICY IF EXISTS tw_delete ON task_watchers;
ALTER TABLE task_watchers DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS td_select ON task_dependencies; DROP POLICY IF EXISTS td_insert ON task_dependencies; DROP POLICY IF EXISTS td_delete ON task_dependencies;
ALTER TABLE task_dependencies DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wl_select ON work_logs; DROP POLICY IF EXISTS wl_insert ON work_logs; DROP POLICY IF EXISTS wl_update ON work_logs; DROP POLICY IF EXISTS wl_delete ON work_logs;
ALTER TABLE work_logs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ta2_select ON task_attachments; DROP POLICY IF EXISTS ta2_insert ON task_attachments; DROP POLICY IF EXISTS ta2_delete ON task_attachments;
ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cc_select ON crm_companies; DROP POLICY IF EXISTS cc_insert ON crm_companies; DROP POLICY IF EXISTS cc_update ON crm_companies; DROP POLICY IF EXISTS cc_delete ON crm_companies;
ALTER TABLE crm_companies DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ln_select ON lead_notes; DROP POLICY IF EXISTS ln_insert ON lead_notes; DROP POLICY IF EXISTS ln_update ON lead_notes; DROP POLICY IF EXISTS ln_delete ON lead_notes;
ALTER TABLE lead_notes DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cont_select ON contacts; DROP POLICY IF EXISTS cont_insert ON contacts; DROP POLICY IF EXISTS cont_update ON contacts; DROP POLICY IF EXISTS cont_delete ON contacts;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deal_select ON deals; DROP POLICY IF EXISTS deal_insert ON deals; DROP POLICY IF EXISTS deal_update ON deals; DROP POLICY IF EXISTS deal_delete ON deals;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS act_select ON activities; DROP POLICY IF EXISTS act_insert ON activities; DROP POLICY IF EXISTS act_update ON activities; DROP POLICY IF EXISTS act_delete ON activities;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

DROP INDEX IF EXISTS idx_lead_notes_company;
DROP INDEX IF EXISTS idx_contacts_company_id;
DROP INDEX IF EXISTS idx_deals_company_stage;
DROP INDEX IF EXISTS idx_activities_company_type;
