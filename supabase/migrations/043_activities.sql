-- UP
-- CRM Activities (calls, meetings, emails, follow-ups, tasks)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'deal', 'contact', 'crm_company')),
  entity_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('call', 'meeting', 'email', 'follow_up', 'task')),
  subject TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_activities_entity ON activities(company_id, entity_type, entity_id);
CREATE INDEX idx_activities_assigned ON activities(company_id, assigned_to);
CREATE INDEX idx_activities_type ON activities(company_id, type);
CREATE INDEX idx_activities_scheduled ON activities(company_id, scheduled_at);

-- DOWN
DROP INDEX IF EXISTS idx_activities_scheduled;
DROP INDEX IF EXISTS idx_activities_type;
DROP INDEX IF EXISTS idx_activities_assigned;
DROP INDEX IF EXISTS idx_activities_entity;
DROP TABLE IF EXISTS activities;
