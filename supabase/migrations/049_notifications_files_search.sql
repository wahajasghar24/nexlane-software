-- ============================================================
-- Phase 7: Notifications, Files, and Search
-- Tables: notifications, file_attachments
-- ============================================================

-- 1. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES company_members(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'info',
  title         TEXT NOT NULL,
  body          TEXT,
  link          TEXT,
  is_read       BOOLEAN DEFAULT false,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(company_id, user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notifications" ON notifications
  FOR ALL
  USING (company_id = get_current_company_id() AND user_id = get_current_member_id());

-- 2. FILE ATTACHMENTS
CREATE TABLE IF NOT EXISTS file_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by   UUID NOT NULL REFERENCES company_members(id),
  file_name     TEXT NOT NULL,
  file_size     BIGINT NOT NULL,
  mime_type     TEXT,
  storage_path  TEXT NOT NULL,
  url           TEXT,
  entity_type   TEXT,
  entity_id     UUID,
  folder        TEXT DEFAULT '/',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_files_company ON file_attachments(company_id);
CREATE INDEX idx_files_entity ON file_attachments(entity_type, entity_id);
CREATE INDEX idx_files_folder ON file_attachments(company_id, folder);

ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_files" ON file_attachments
  FOR ALL
  USING (company_id = get_current_company_id());

-- 3. Add full-text search support
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(code,'') || ' ' || coalesce(description,''))) STORED;

CREATE INDEX IF NOT EXISTS idx_coa_search ON chart_of_accounts USING GIN(search_vector);
