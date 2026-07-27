-- UP
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(127),
  size_bytes BIGINT,
  storage_path TEXT NOT NULL,
  bucket VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_files_entity ON files(company_id, entity_type, entity_id);
CREATE INDEX idx_files_uploader ON files(company_id, uploaded_by);

-- DOWN
DROP TABLE IF EXISTS files;
