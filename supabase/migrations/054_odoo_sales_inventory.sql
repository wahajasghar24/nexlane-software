-- ============================================================
-- Phase 10: Odoo-style Sales & Inventory
-- Tables: products, stock_movements, sales_orders (+items),
--         purchase_orders (+items)
-- Cross-module: SO confirm -> stock out + invoice link;
--               PO receive -> stock in
-- ============================================================

-- 1. PRODUCTS (inventory master)
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sku            TEXT NOT NULL,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  unit           TEXT NOT NULL DEFAULT 'pcs',
  purchase_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  sale_price     NUMERIC(14,2) NOT NULL DEFAULT 0,
  stock_qty      NUMERIC(14,2) NOT NULL DEFAULT 0,
  min_stock      NUMERIC(14,2) NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_by     UUID REFERENCES profiles(id),
  updated_by     UUID REFERENCES profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ,
  deleted_by     UUID REFERENCES profiles(id),
  UNIQUE(company_id, sku)
);

-- 2. STOCK MOVEMENTS (inventory ledger — Odoo stock.move)
CREATE TABLE IF NOT EXISTS stock_movements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity       NUMERIC(14,2) NOT NULL, -- signed: + in / - out
  movement_type  TEXT NOT NULL CHECK (movement_type IN ('initial','purchase_receipt','sale_delivery','adjustment')),
  reference_type TEXT, -- 'sales_order' | 'purchase_order' | NULL (adjustment)
  reference_id   UUID,
  note           TEXT,
  created_by     UUID REFERENCES profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SALES ORDERS (quotation flow: draft = quotation -> confirmed -> delivered)
CREATE TABLE IF NOT EXISTS sales_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_number  TEXT NOT NULL, -- SO-2026-0001 (app-layer generated)
  customer_id   UUID REFERENCES crm_companies(id),
  contact_id    UUID REFERENCES contacts(id),
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','confirmed','delivered','cancelled')),
  order_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until   DATE,
  notes         TEXT,
  subtotal      NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
  total         NUMERIC(15,2) NOT NULL DEFAULT 0,
  invoice_id    UUID REFERENCES invoices(id), -- cross-module link (auto-created on confirm)
  created_by    UUID REFERENCES profiles(id),
  updated_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID REFERENCES profiles(id),
  UNIQUE(company_id, order_number)
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id    UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id),
  description TEXT NOT NULL,
  quantity    NUMERIC(14,2) NOT NULL DEFAULT 1,
  unit_price  NUMERIC(14,2) NOT NULL DEFAULT 0,
  total       NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_number  TEXT NOT NULL, -- PO-2026-0001
  vendor_id     UUID REFERENCES crm_companies(id),
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','confirmed','received','cancelled')),
  order_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  notes         TEXT,
  subtotal      NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
  total         NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_by    UUID REFERENCES profiles(id),
  updated_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID REFERENCES profiles(id),
  UNIQUE(company_id, order_number)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id    UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id),
  description TEXT NOT NULL,
  quantity    NUMERIC(14,2) NOT NULL DEFAULT 1,
  unit_price  NUMERIC(14,2) NOT NULL DEFAULT 0,
  total       NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_company     ON products(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_stock_movements_prod ON stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_company ON sales_orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_items_order    ON sales_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_comp ON purchase_orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_items_order ON purchase_order_items(order_id);

-- UPDATED_AT TRIGGERS
-- Note: set_updated_at() was missing in live DB (schema drift from 033) —
-- recreate idempotently so triggers below work.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_sales_orders_updated_at ON sales_orders;
CREATE TRIGGER trg_sales_orders_updated_at BEFORE UPDATE ON sales_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RLS (company-scoped, same pattern as all other tables)
-- ============================================================
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_select ON products FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY products_insert ON products FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY products_update ON products FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY products_delete ON products FOR DELETE USING (company_id = auth_company_id());

CREATE POLICY stock_movements_select ON stock_movements FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY stock_movements_insert ON stock_movements FOR INSERT WITH CHECK (company_id = auth_company_id());

CREATE POLICY sales_orders_select ON sales_orders FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY sales_orders_insert ON sales_orders FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY sales_orders_update ON sales_orders FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY sales_orders_delete ON sales_orders FOR DELETE USING (company_id = auth_company_id());

CREATE POLICY sales_items_select ON sales_order_items FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY sales_items_insert ON sales_order_items FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY sales_items_delete ON sales_order_items FOR DELETE USING (company_id = auth_company_id());

CREATE POLICY purchase_orders_select ON purchase_orders FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY purchase_orders_insert ON purchase_orders FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY purchase_orders_update ON purchase_orders FOR UPDATE USING (company_id = auth_company_id());
CREATE POLICY purchase_orders_delete ON purchase_orders FOR DELETE USING (company_id = auth_company_id());

CREATE POLICY purchase_items_select ON purchase_order_items FOR SELECT USING (company_id = auth_company_id());
CREATE POLICY purchase_items_insert ON purchase_order_items FOR INSERT WITH CHECK (company_id = auth_company_id());
CREATE POLICY purchase_items_delete ON purchase_order_items FOR DELETE USING (company_id = auth_company_id());

-- ============================================================
-- PERMISSIONS (inventory / sales / purchase) — Owner gets all
-- ============================================================
INSERT INTO permissions (code, name, module) VALUES
  ('products.list','List Products','inventory'),
  ('products.read','View Products','inventory'),
  ('products.create','Create Products','inventory'),
  ('products.update','Update Products','inventory'),
  ('products.delete','Delete Products','inventory'),
  ('sales_orders.list','List Sales Orders','sales'),
  ('sales_orders.read','View Sales Orders','sales'),
  ('sales_orders.create','Create Sales Orders','sales'),
  ('sales_orders.update','Update Sales Orders','sales'),
  ('sales_orders.confirm','Confirm Sales Orders','sales'),
  ('sales_orders.delete','Delete Sales Orders','sales'),
  ('purchase_orders.list','List Purchase Orders','purchase'),
  ('purchase_orders.read','View Purchase Orders','purchase'),
  ('purchase_orders.create','Create Purchase Orders','purchase'),
  ('purchase_orders.update','Update Purchase Orders','purchase'),
  ('purchase_orders.receive','Receive Purchase Orders','purchase'),
  ('purchase_orders.delete','Delete Purchase Orders','purchase')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Owner' AND p.code IN (
  'products.list','products.read','products.create','products.update','products.delete',
  'sales_orders.list','sales_orders.read','sales_orders.create','sales_orders.update','sales_orders.confirm','sales_orders.delete',
  'purchase_orders.list','purchase_orders.read','purchase_orders.create','purchase_orders.update','purchase_orders.receive','purchase_orders.delete'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STOCK HELPER (atomic, company-scoped)
-- ============================================================
CREATE OR REPLACE FUNCTION adjust_product_stock(
  p_company_id UUID, p_product_id UUID, p_delta NUMERIC
) RETURNS void AS $$
  UPDATE products
  SET stock_qty = stock_qty + p_delta, updated_at = now()
  WHERE id = p_product_id AND company_id = p_company_id;
$$ LANGUAGE sql SECURITY DEFINER;
