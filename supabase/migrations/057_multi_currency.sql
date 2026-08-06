-- ============================================================
-- Phase 13: Multi-currency (PKR/USD/AED/QAR)
-- enum + per-transaction currency & fx_rate; base currency in company_settings
-- ============================================================

DO $$ BEGIN
  CREATE TYPE currency_code AS ENUM ('PKR', 'USD', 'AED', 'QAR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- invoices: text -> enum (existing rows are all 'USD', safe cast)
ALTER TABLE invoices ALTER COLUMN currency DROP DEFAULT;
ALTER TABLE invoices ALTER COLUMN currency TYPE currency_code
  USING currency::currency_code;
ALTER TABLE invoices ALTER COLUMN currency SET DEFAULT 'USD';

-- journal_entries: per-entry currency + fx rate (rate at transaction time)
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS currency currency_code NOT NULL DEFAULT 'USD';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS fx_rate NUMERIC NOT NULL DEFAULT 1;

-- payments: per-payment currency
ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency currency_code NOT NULL DEFAULT 'USD';

-- Base/reporting currency per company (existing settings table, jsonb value)
INSERT INTO company_settings (company_id, key, value, category)
VALUES ('00000000-0000-0000-0000-000000000001', 'base_currency', '"AED"', 'accounting')
ON CONFLICT (company_id, key) DO NOTHING;
