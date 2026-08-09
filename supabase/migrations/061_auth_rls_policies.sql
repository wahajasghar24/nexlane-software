-- ============================================================
-- 061_auth: RLS policies for bank/payroll/tax tables
-- Fix: bank_accounts etc had auth_company_id() policies that
-- returned NULL (JWT claim not set) → INSERT/SELECT blocked.
-- Standard pattern: company_isolation ALL (get_current_company_id())
-- + inline company_members subquery (same as chart_of_accounts).
-- ============================================================

-- Bank Reconciliation (058)
CREATE POLICY IF NOT EXISTS bank_accounts_isolation ON bank_accounts FOR ALL USING (company_id = get_current_company_id());
CREATE POLICY IF NOT EXISTS bank_tx_isolation ON bank_transactions FOR ALL USING (company_id = get_current_company_id());
CREATE POLICY IF NOT EXISTS recon_isolation ON reconciliation_sessions FOR ALL USING (company_id = get_current_company_id());

-- Fallback inline policies (mirror rlsp_* pattern on chart_of_accounts)
CREATE POLICY IF NOT EXISTS bank_accounts_member_insert ON bank_accounts FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS bank_accounts_member_update ON bank_accounts FOR UPDATE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS bank_accounts_member_delete ON bank_accounts FOR DELETE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS bank_tx_member_insert ON bank_transactions FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS bank_tx_member_update ON bank_transactions FOR UPDATE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS bank_tx_member_delete ON bank_transactions FOR DELETE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS recon_member_insert ON reconciliation_sessions FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS recon_member_update ON reconciliation_sessions FOR UPDATE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS recon_member_delete ON reconciliation_sessions FOR DELETE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));

-- Payroll (059)
CREATE POLICY IF NOT EXISTS payroll_struct_isolation ON payroll_structures FOR ALL USING (company_id = get_current_company_id());
CREATE POLICY IF NOT EXISTS payslips_isolation ON payslips FOR ALL USING (company_id = get_current_company_id());
CREATE POLICY IF NOT EXISTS payroll_struct_member_insert ON payroll_structures FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS payroll_struct_member_update ON payroll_structures FOR UPDATE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS payroll_struct_member_delete ON payroll_structures FOR DELETE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS payslips_member_insert ON payslips FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS payslips_member_update ON payslips FOR UPDATE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS payslips_member_delete ON payslips FOR DELETE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));

-- Tax (059_tax)
CREATE POLICY IF NOT EXISTS tax_returns_member_insert ON tax_returns FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS tax_returns_member_update ON tax_returns FOR UPDATE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));
CREATE POLICY IF NOT EXISTS tax_returns_member_delete ON tax_returns FOR DELETE USING (company_id IN (SELECT company_id FROM company_members WHERE profile_id = auth.uid()));