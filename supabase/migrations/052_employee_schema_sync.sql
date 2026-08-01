-- 052_employee_schema_sync.sql
-- Fix live DB drift: employees table missing columns the app code requires.
-- Root cause: live table was created from an old schema state; the INSERT path
-- (employeeService) writes full_name/email/salary/emergency_contact.
-- Applied directly to live DB via Management API on 2026-07-31 (QA audit).

ALTER TABLE employees ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary DECIMAL(12,2);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact JSONB;

-- Keep employees.full_name in sync with profiles.full_name
DROP TRIGGER IF EXISTS sync_employee_full_name_from_profile ON employees;
CREATE TRIGGER sync_employee_full_name_from_profile
AFTER INSERT OR UPDATE OF full_name ON employees
FOR EACH ROW EXECUTE FUNCTION sync_employee_full_name();
