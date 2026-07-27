-- UP
-- CRM Companies (distinct from SaaS tenant companies)
CREATE TABLE crm_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address JSONB,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_crm_companies_company ON crm_companies(company_id);
CREATE INDEX idx_crm_companies_name ON crm_companies(company_id, name);

-- Extend leads table with CRM fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS crm_company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_value DECIMAL(14,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_deal_id UUID;

-- Drop the old status check and re-add with expanded values
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted'));

-- Lead notes (separate from polymorphic comments for dedicated lead notes)
CREATE TABLE lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_lead_notes_lead ON lead_notes(lead_id);

-- DOWN
DROP INDEX IF EXISTS idx_lead_notes_lead;
DROP TABLE IF EXISTS lead_notes;

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted'));
ALTER TABLE leads DROP COLUMN IF EXISTS converted_to_deal_id;
ALTER TABLE leads DROP COLUMN IF EXISTS deal_value;
ALTER TABLE leads DROP COLUMN IF EXISTS industry;
ALTER TABLE leads DROP COLUMN IF EXISTS website;
ALTER TABLE leads DROP COLUMN IF EXISTS phone;
ALTER TABLE leads DROP COLUMN IF EXISTS email;
ALTER TABLE leads DROP COLUMN IF EXISTS crm_company_id;
ALTER TABLE leads DROP COLUMN IF EXISTS title;

DROP INDEX IF EXISTS idx_crm_companies_name;
DROP INDEX IF EXISTS idx_crm_companies_company;
DROP TABLE IF EXISTS crm_companies;
