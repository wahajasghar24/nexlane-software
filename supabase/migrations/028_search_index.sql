-- UP
CREATE TABLE search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  title VARCHAR(255),
  content TSVECTOR,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, entity_type, entity_id)
);

CREATE INDEX idx_search_entity ON search_index(company_id, entity_type);
CREATE INDEX idx_search_content ON search_index USING GIN(content);

-- DOWN
DROP TABLE IF EXISTS search_index;
