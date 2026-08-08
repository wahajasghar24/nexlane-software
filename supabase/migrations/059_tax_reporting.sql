-- ============================================================
-- Phase 6 ext: Tax Reporting (VAT/GST)
-- Table: tax_returns
-- ============================================================

CREATE TABLE IF NOT EXISTS tax_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  output_tax NUMERIC(15,2) NOT NULL DEFAULT 0,
  input_tax NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_tax NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_sales NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_purchases NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'AED',
  tax_rate NUMERIC(5,2) DEFAULT 5.00,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'filed', 'paid')),
  filed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tax_returns ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tax_returns_company ON tax_returns(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_returns_period ON tax_returns(company_id, period_start, period_end);

CREATE POLICY "company_isolation" ON tax_returns FOR ALL USING (company_id = get_current_company_id());
