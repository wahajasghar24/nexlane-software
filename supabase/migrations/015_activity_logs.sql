-- UP
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  previous_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_entity ON activity_logs(company_id, entity_type, entity_id);
CREATE INDEX idx_activity_actor ON activity_logs(company_id, actor_id);
CREATE INDEX idx_activity_created ON activity_logs(company_id, created_at DESC);

-- DOWN
DROP TABLE IF EXISTS activity_logs;
