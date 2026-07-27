-- UP
-- Deal Pipeline
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  crm_company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value DECIMAL(14,2) DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'demo_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost')),
  expected_close_date DATE,
  actual_close_date DATE,
  owner_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_deals_company ON deals(company_id);
CREATE INDEX idx_deals_stage ON deals(company_id, stage);
CREATE INDEX idx_deals_owner ON deals(company_id, owner_id);
CREATE INDEX idx_deals_lead ON deals(lead_id);

-- DOWN
DROP INDEX IF EXISTS idx_deals_lead;
DROP INDEX IF EXISTS idx_deals_owner;
DROP INDEX IF EXISTS idx_deals_stage;
DROP INDEX IF EXISTS idx_deals_company;
DROP TABLE IF EXISTS deals;
