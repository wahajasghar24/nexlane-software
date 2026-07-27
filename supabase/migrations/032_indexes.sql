-- UP
-- Additional performance indexes beyond those created inline

-- Full-text search
CREATE INDEX idx_search_content_gin ON search_index USING GIN(to_tsvector('english', COALESCE(title, '')));

-- Activity logs time-range queries
CREATE INDEX idx_activity_company_date ON activity_logs(company_id, created_at DESC);

-- Notifications unread
CREATE INDEX idx_notifications_unread ON notifications(company_id, user_id) WHERE is_read = false;

-- Jobs pending processing
CREATE INDEX idx_jobs_pending ON jobs(company_id, queue, status, scheduled_at)
  WHERE status = 'pending';

-- Domain events pending
CREATE INDEX idx_events_pending ON domain_events(company_id, status, created_at)
  WHERE status = 'pending';

-- Polymorphic lookups
CREATE INDEX idx_comments_entity_id ON comments(entity_type, entity_id);
CREATE INDEX idx_files_entity_id ON files(entity_type, entity_id);
CREATE INDEX idx_custom_field_values_entity ON custom_field_values(custom_field_id, entity_id);
CREATE INDEX idx_taggables_entity_id ON taggables(taggable_type, taggable_id);

-- Recent items per company
CREATE INDEX idx_tasks_recent ON tasks(company_id, created_at DESC);
CREATE INDEX idx_projects_recent ON projects(company_id, created_at DESC);
CREATE INDEX idx_invoices_recent ON invoices(company_id, created_at DESC);
CREATE INDEX idx_leads_recent ON leads(company_id, created_at DESC);

-- DOWN
DROP INDEX IF EXISTS idx_search_content_gin;
DROP INDEX IF EXISTS idx_activity_company_date;
DROP INDEX IF EXISTS idx_notifications_unread;
DROP INDEX IF EXISTS idx_jobs_pending;
DROP INDEX IF EXISTS idx_events_pending;
DROP INDEX IF EXISTS idx_comments_entity_id;
DROP INDEX IF EXISTS idx_files_entity_id;
DROP INDEX IF EXISTS idx_custom_field_values_entity;
DROP INDEX IF EXISTS idx_taggables_entity_id;
DROP INDEX IF EXISTS idx_tasks_recent;
DROP INDEX IF EXISTS idx_projects_recent;
DROP INDEX IF EXISTS idx_invoices_recent;
DROP INDEX IF EXISTS idx_leads_recent;
