-- UP
-- Performance indexes to prevent N+1 and optimize query patterns

-- Employees: designation_id lookup (used in employee list filter)
CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation_id);

-- DOWN
DROP INDEX IF EXISTS idx_employees_designation;
