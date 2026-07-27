-- UP
-- Work logs for daily employee time tracking

CREATE TABLE work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  description TEXT,
  progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  blockers TEXT,
  next_step TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  manager_notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX idx_work_logs_employee_date ON work_logs(employee_id, log_date DESC);
CREATE INDEX idx_work_logs_company_date ON work_logs(company_id, log_date DESC);
CREATE INDEX idx_work_logs_task ON work_logs(task_id);
CREATE INDEX idx_work_logs_status ON work_logs(company_id, status);

-- Add work log stats columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS total_hours DECIMAL(10,2) NOT NULL DEFAULT 0;

-- DOWN
ALTER TABLE employees DROP COLUMN IF EXISTS total_hours;

DROP INDEX IF EXISTS idx_work_logs_status;
DROP INDEX IF EXISTS idx_work_logs_task;
DROP INDEX IF EXISTS idx_work_logs_company_date;
DROP INDEX IF EXISTS idx_work_logs_employee_date;

DROP TABLE IF EXISTS work_logs;
