-- UP
CREATE TABLE sheet_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  UNIQUE(company_id, name)
);

CREATE TABLE sheet_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sheet_table_id UUID NOT NULL REFERENCES sheet_tables(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  options JSONB,
  position INTEGER NOT NULL,
  width INTEGER DEFAULT 200,
  required BOOLEAN DEFAULT false,
  default_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sheet_table_id, key)
);

-- DOWN
DROP TABLE IF EXISTS sheet_columns;
DROP TABLE IF EXISTS sheet_tables;
