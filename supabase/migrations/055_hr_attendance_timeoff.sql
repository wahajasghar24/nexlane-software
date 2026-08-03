-- ============================================================
-- Phase 11: HR — Attendance + Time Off
-- Tables: attendance, time_off_requests
-- Pattern: company_members RLS (same as all other tables)
-- ============================================================

-- Company scope helper (idempotent — present in 054 for fresh DBs, missing on live)
CREATE OR REPLACE FUNCTION company_scope()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
AS $function$
  SELECT company_members.company_id
  FROM company_members
  WHERE company_members.profile_id = auth.uid();
$function$;

CREATE TABLE IF NOT EXISTS attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in    TIMESTAMPTZ,
  check_out   TIMESTAMPTZ,
  status      VARCHAR(20) NOT NULL DEFAULT 'present'
              CHECK (status IN ('present', 'half_day', 'absent')),
  notes       TEXT,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, employee_id, work_date)
);

CREATE TABLE IF NOT EXISTS time_off_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type        VARCHAR(20) NOT NULL CHECK (type IN ('annual', 'sick', 'unpaid')),
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  days        NUMERIC(5,1) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reason      TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_company ON attendance(company_id, work_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeoff_company   ON time_off_requests(company_id, status);

-- UPDATED_AT TRIGGERS
DROP TRIGGER IF EXISTS trg_attendance_updated_at ON attendance;
CREATE TRIGGER trg_attendance_updated_at BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_timeoff_updated_at ON time_off_requests;
CREATE TRIGGER trg_timeoff_updated_at BEFORE UPDATE ON time_off_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE attendance        ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY rlsp_attendance_select ON attendance FOR SELECT USING (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_attendance_insert ON attendance FOR INSERT WITH CHECK (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_attendance_update ON attendance FOR UPDATE USING (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_attendance_delete ON attendance FOR DELETE USING (company_id IN (SELECT company_scope()));

CREATE POLICY rlsp_timeoff_select ON time_off_requests FOR SELECT USING (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_timeoff_insert ON time_off_requests FOR INSERT WITH CHECK (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_timeoff_update ON time_off_requests FOR UPDATE USING (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_timeoff_delete ON time_off_requests FOR DELETE USING (company_id IN (SELECT company_scope()));

-- PERMISSIONS — Owner gets all
INSERT INTO permissions (code, name, module) VALUES
  ('attendance.list','List Attendance','hr'),
  ('attendance.checkin','Clock In','hr'),
  ('attendance.checkout','Clock Out','hr'),
  ('timeoff.list','List Time Off','hr'),
  ('timeoff.create','Request Time Off','hr'),
  ('timeoff.approve','Approve Time Off','hr'),
  ('timeoff.delete','Delete Time Off','hr')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Owner' AND p.code IN (
  'attendance.list','attendance.checkin','attendance.checkout',
  'timeoff.list','timeoff.create','timeoff.approve','timeoff.delete'
)
ON CONFLICT DO NOTHING;

-- DOWN
-- DROP TABLE IF EXISTS time_off_requests;
-- DROP TABLE IF EXISTS attendance;
