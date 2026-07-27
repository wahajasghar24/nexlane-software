-- UP
-- Helper function to check if user has admin access
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

-- Helper to get user's company from JWT
CREATE OR REPLACE FUNCTION auth_company_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'company_id',
    current_setting('app.current_company_id', true)
  )::UUID;
$$ LANGUAGE SQL STABLE;

-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY companies_select ON companies FOR SELECT USING (true);
CREATE POLICY companies_insert ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY companies_update ON companies FOR UPDATE USING (is_admin(auth.uid(), id));
CREATE POLICY companies_delete ON companies FOR DELETE USING (is_admin(auth.uid(), id));

-- Company members
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY cm_select ON company_members FOR SELECT USING (company_id = auth_company_id() OR profile_id = auth.uid());
CREATE POLICY cm_insert ON company_members FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY cm_delete ON company_members FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());

-- Permissions (read-only for non-admins)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY permissions_select ON permissions FOR SELECT USING (true);

-- Roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_select ON roles FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY roles_insert ON roles FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY roles_update ON roles FOR UPDATE USING (is_admin(auth.uid(), company_id));
CREATE POLICY roles_delete ON roles FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Role permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rp_select ON role_permissions FOR SELECT USING (true);
CREATE POLICY rp_insert ON role_permissions FOR INSERT WITH CHECK (is_admin(auth.uid(), (SELECT company_id FROM roles WHERE id = role_id)));
CREATE POLICY rp_delete ON role_permissions FOR DELETE USING (is_admin(auth.uid(), (SELECT company_id FROM roles WHERE id = role_id)));

-- User roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY ur_select ON user_roles FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY ur_insert ON user_roles FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY ur_delete ON user_roles FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Feature flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY ff_select ON feature_flags FOR SELECT USING (true);
CREATE POLICY ff_insert ON feature_flags FOR INSERT WITH CHECK (is_admin(auth.uid(), auth_company_id()));
CREATE POLICY ff_update ON feature_flags FOR UPDATE USING (is_admin(auth.uid(), auth_company_id()));

ALTER TABLE company_feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY cff_select ON company_feature_flags FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY cff_insert ON company_feature_flags FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY cff_update ON company_feature_flags FOR UPDATE USING (is_admin(auth.uid(), company_id));

-- Settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY ss_select ON system_settings FOR SELECT USING (is_admin(auth.uid(), auth_company_id()));
CREATE POLICY ss_insert ON system_settings FOR INSERT WITH CHECK (is_admin(auth.uid(), auth_company_id()));

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY cs_select ON company_settings FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY cs_insert ON company_settings FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY cs_update ON company_settings FOR UPDATE USING (is_admin(auth.uid(), company_id));

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY us_select ON user_settings FOR SELECT USING (user_id = auth.uid());

-- Generic RLS for all business tables: company_id = auth_company_id()
-- Employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY emp_select ON employees FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY emp_insert ON employees FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY emp_update ON employees FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY emp_delete ON employees FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY proj_select ON projects FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY proj_insert ON projects FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY proj_update ON projects FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY proj_delete ON projects FOR DELETE USING (is_admin(auth.uid(), company_id));

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY pm_select ON project_members FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY pm_insert ON project_members FOR INSERT WITH CHECK (company_id = auth_company_id());

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY task_select ON tasks FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY task_insert ON tasks FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY task_update ON tasks FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY task_delete ON tasks FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comment_select ON comments FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY comment_insert ON comments FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY comment_update ON comments FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY comment_delete ON comments FOR DELETE USING (author_id = auth.uid() OR is_admin(auth.uid(), company_id));

-- Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY tag_select ON tags FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY tag_insert ON tags FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY tag_delete ON tags FOR DELETE USING (company_id = auth_company_id());

ALTER TABLE taggables ENABLE ROW LEVEL SECURITY;
CREATE POLICY taggable_select ON taggables FOR SELECT USING (true);
CREATE POLICY taggable_insert ON taggables FOR INSERT WITH CHECK (true);

-- Custom Fields
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY cf_select ON custom_fields FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY cf_insert ON custom_fields FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY cf_update ON custom_fields FOR UPDATE USING (is_admin(auth.uid(), company_id));

ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY cfv_select ON custom_field_values FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY cfv_insert ON custom_field_values FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY cfv_update ON custom_field_values FOR UPDATE USING (company_id = auth_company_id());

-- Activity Logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY al_select ON activity_logs FOR SELECT USING (company_id = auth_company_id());

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY cust_select ON customers FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY cust_insert ON customers FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY cust_update ON customers FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY cust_delete ON customers FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY lead_select ON leads FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY lead_insert ON leads FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY lead_update ON leads FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY lead_delete ON leads FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Spreadsheets
ALTER TABLE sheet_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY st_select ON sheet_tables FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY st_insert ON sheet_tables FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY st_update ON sheet_tables FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY st_delete ON sheet_tables FOR DELETE USING (company_id = auth_company_id());

ALTER TABLE sheet_columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY sc_select ON sheet_columns FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY sc_insert ON sheet_columns FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY sc_update ON sheet_columns FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY sc_delete ON sheet_columns FOR DELETE USING (company_id = auth_company_id());

ALTER TABLE sheet_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY sr_select ON sheet_rows FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY sr_insert ON sheet_rows FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY sr_update ON sheet_rows FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY sr_delete ON sheet_rows FOR DELETE USING (company_id = auth_company_id());

ALTER TABLE sheet_cells ENABLE ROW LEVEL SECURITY;
CREATE POLICY scell_select ON sheet_cells FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY scell_insert ON sheet_cells FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY scell_update ON sheet_cells FOR UPDATE USING (company_id = auth_company_id());

-- Accounting
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY coa_select ON chart_of_accounts FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY coa_insert ON chart_of_accounts FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));
CREATE POLICY coa_update ON chart_of_accounts FOR UPDATE USING (is_admin(auth.uid(), company_id));

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY je_select ON journal_entries FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY je_insert ON journal_entries FOR INSERT WITH CHECK (company_id = auth_company_id());

ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY jel_select ON journal_entry_lines FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY jel_insert ON journal_entry_lines FOR INSERT WITH CHECK (company_id = auth_company_id());

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY inv_select ON invoices FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY inv_insert ON invoices FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY inv_update ON invoices FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY inv_delete ON invoices FOR DELETE USING (is_admin(auth.uid(), company_id));

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY ii_select ON invoice_items FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY ii_insert ON invoice_items FOR INSERT WITH CHECK (company_id = auth_company_id());

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY pay_select ON payments FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY pay_insert ON payments FOR INSERT WITH CHECK (company_id = auth_company_id());

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY exp_select ON expenses FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY exp_insert ON expenses FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY exp_update ON expenses FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY exp_delete ON expenses FOR DELETE USING (is_admin(auth.uid(), company_id));

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notif_select ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notif_update ON notifications FOR UPDATE USING (user_id = auth.uid());

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY nt_select ON notification_templates FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY nt_insert ON notification_templates FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY np_select ON notification_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY np_insert ON notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY np_update ON notification_preferences FOR UPDATE USING (user_id = auth.uid());

-- Jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY jobs_select ON jobs FOR SELECT USING (is_admin(auth.uid(), company_id));
CREATE POLICY jobs_insert ON jobs FOR INSERT WITH CHECK (true);

ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY jl_select ON job_logs FOR SELECT USING (true);

-- Files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY files_select ON files FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY files_insert ON files FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY files_update ON files FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY files_delete ON files FOR DELETE USING (company_id = auth_company_id());

-- Domain events (admin only)
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY de_select ON domain_events FOR SELECT USING (is_admin(auth.uid(), company_id));

-- Search index
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY si_select ON search_index FOR SELECT USING (company_id = auth_company_id());

-- AI tables
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY aic_select ON ai_conversations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY aic_insert ON ai_conversations FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY aip_select ON ai_prompts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY aip_insert ON ai_prompts FOR INSERT WITH CHECK (user_id = auth.uid());

-- Observability (admin only)
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY alog_select ON app_logs FOR SELECT USING (is_admin(auth.uid(), company_id));

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY el_select ON error_logs FOR SELECT USING (is_admin(auth.uid(), company_id));

ALTER TABLE api_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY am_select ON api_metrics FOR SELECT USING (is_admin(auth.uid(), company_id));

-- Performance metrics (admin only read)
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY pm_select ON performance_metrics FOR SELECT USING (is_admin(auth.uid(), company_id));
CREATE POLICY pm_insert ON performance_metrics FOR INSERT WITH CHECK (is_admin(auth.uid(), company_id));

-- DOWN
-- Drop all policies (simplified — in production use DO block with dynamic SQL)
-- This is a placeholder; actual rollback would enumerate every policy above
