-- ============================================================
-- Phase 6: Accounting Module
-- Tables: chart_of_accounts, accounting_periods,
--         journal_entries, journal_entry_lines,
--         invoices, invoice_items, payments
-- ============================================================

-- 1. CHART OF ACCOUNTS
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
  category      TEXT,
  parent_id     UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
  is_active     BOOLEAN DEFAULT true,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- 2. ACCOUNTING PERIODS
CREATE TABLE IF NOT EXISTS accounting_periods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  is_closed     BOOLEAN DEFAULT false,
  closed_at     TIMESTAMPTZ,
  closed_by     UUID REFERENCES company_members(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, name)
);

-- 3. JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS journal_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period_id     UUID REFERENCES accounting_periods(id),
  entry_number  TEXT NOT NULL,
  entry_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  description   TEXT NOT NULL,
  reference     TEXT,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted','voided')),
  created_by    UUID REFERENCES company_members(id),
  posted_at     TIMESTAMPTZ,
  posted_by     UUID REFERENCES company_members(id),
  voided_at     TIMESTAMPTZ,
  voided_by     UUID REFERENCES company_members(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, entry_number)
);

-- 4. JOURNAL ENTRY LINES
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id  UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id        UUID NOT NULL REFERENCES chart_of_accounts(id),
  description       TEXT,
  debit             NUMERIC(15,2) DEFAULT 0,
  credit            NUMERIC(15,2) DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 5. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  customer_id   UUID REFERENCES crm_companies(id),
  contact_id    UUID REFERENCES contacts(id),
  invoice_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date      DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  subtotal      NUMERIC(15,2) DEFAULT 0,
  tax_amount    NUMERIC(15,2) DEFAULT 0,
  discount      NUMERIC(15,2) DEFAULT 0,
  total         NUMERIC(15,2) DEFAULT 0,
  currency      TEXT DEFAULT 'USD',
  notes         TEXT,
  terms         TEXT,
  created_by    UUID REFERENCES company_members(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, invoice_number)
);

-- 6. INVOICE ITEMS
CREATE TABLE IF NOT EXISTS invoice_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  quantity      NUMERIC(15,2) DEFAULT 1,
  unit_price    NUMERIC(15,2) DEFAULT 0,
  amount        NUMERIC(15,2) DEFAULT 0,
  tax_rate      NUMERIC(5,2) DEFAULT 0,
  tax_amount    NUMERIC(15,2) DEFAULT 0,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id    UUID REFERENCES invoices(id),
  customer_id   UUID REFERENCES crm_companies(id),
  amount        NUMERIC(15,2) NOT NULL,
  payment_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  method        TEXT NOT NULL DEFAULT 'bank' CHECK (method IN ('cash','bank','check','credit_card','other')),
  reference     TEXT,
  status        TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','refunded')),
  notes         TEXT,
  created_by    UUID REFERENCES company_members(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_coa_company ON chart_of_accounts(company_id);
CREATE INDEX idx_coa_parent ON chart_of_accounts(parent_id);
CREATE INDEX idx_periods_company ON accounting_periods(company_id);
CREATE INDEX idx_je_company ON journal_entries(company_id);
CREATE INDEX idx_je_period ON journal_entries(period_id);
CREATE INDEX idx_je_status ON journal_entries(status);
CREATE INDEX idx_jel_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_jel_account ON journal_entry_lines(account_id);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Company-isolation policies
CREATE POLICY "company_isolation" ON chart_of_accounts FOR ALL USING (company_id = get_current_company_id());
CREATE POLICY "company_isolation" ON accounting_periods FOR ALL USING (company_id = get_current_company_id());
CREATE POLICY "company_isolation" ON journal_entries FOR ALL USING (company_id = get_current_company_id());
CREATE POLICY "company_isolation" ON journal_entry_lines FOR ALL USING (journal_entry_id IN (SELECT id FROM journal_entries WHERE company_id = get_current_company_id()));
CREATE POLICY "company_isolation" ON invoices FOR ALL USING (company_id = get_current_company_id());
CREATE POLICY "company_isolation" ON invoice_items FOR ALL USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = get_current_company_id()));
CREATE POLICY "company_isolation" ON payments FOR ALL USING (company_id = get_current_company_id());
