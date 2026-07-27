-- UP
CREATE TABLE sheet_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sheet_table_id UUID NOT NULL REFERENCES sheet_tables(id) ON DELETE CASCADE,
  position INTEGER,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_sheet_rows_table ON sheet_rows(sheet_table_id, position);

CREATE TABLE sheet_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sheet_row_id UUID NOT NULL REFERENCES sheet_rows(id) ON DELETE CASCADE,
  sheet_column_id UUID NOT NULL REFERENCES sheet_columns(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sheet_row_id, sheet_column_id)
);

-- DOWN
DROP TABLE IF EXISTS sheet_cells;
DROP TABLE IF EXISTS sheet_rows;
