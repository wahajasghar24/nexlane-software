-- ============================================================
-- Phase 12: Warehouses + per-warehouse stock
-- Tables: warehouses, product_stock; products.default_warehouse_id
-- ============================================================

CREATE TABLE IF NOT EXISTS warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code        VARCHAR(50) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  location    VARCHAR(255),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS product_stock (
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity     NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, warehouse_id)
);

-- Default warehouse per product (NULL = first active warehouse)
ALTER TABLE products ADD COLUMN IF NOT EXISTS default_warehouse_id UUID;
-- ON DELETE SET NULL so deleting a warehouse doesn't block product cleanup
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_default_warehouse_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_default_warehouse_id_fkey
  FOREIGN KEY (default_warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS trg_warehouses_updated_at ON warehouses;
CREATE TRIGGER trg_warehouses_updated_at BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_product_stock_updated_at ON product_stock;
CREATE TRIGGER trg_product_stock_updated_at BEFORE UPDATE ON product_stock
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE warehouses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY rlsp_warehouses_select ON warehouses FOR SELECT USING (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_warehouses_insert ON warehouses FOR INSERT WITH CHECK (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_warehouses_update ON warehouses FOR UPDATE USING (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_warehouses_delete ON warehouses FOR DELETE USING (company_id IN (SELECT company_scope()));

CREATE POLICY rlsp_product_stock_select ON product_stock FOR SELECT USING (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_product_stock_insert ON product_stock FOR INSERT WITH CHECK (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_product_stock_update ON product_stock FOR UPDATE USING (company_id IN (SELECT company_scope()));
CREATE POLICY rlsp_product_stock_delete ON product_stock FOR DELETE USING (company_id IN (SELECT company_scope()));

-- Warehouse-aware stock adjust (replaces single-location adjust_product_stock).
-- Drop the old 3-arg overload first so RPC calls are unambiguous.
DROP FUNCTION IF EXISTS adjust_product_stock(uuid, uuid, numeric);
CREATE OR REPLACE FUNCTION adjust_product_stock(
  p_company_id uuid,
  p_product_id uuid,
  p_delta numeric,
  p_warehouse_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_warehouse_id uuid;
BEGIN
  -- Resolve warehouse: explicit, product default, or first active warehouse
  v_warehouse_id := COALESCE(
    p_warehouse_id,
    (SELECT default_warehouse_id FROM products WHERE id = p_product_id AND company_id = p_company_id),
    (SELECT id FROM warehouses WHERE company_id = p_company_id AND is_active ORDER BY created_at LIMIT 1)
  );

  IF v_warehouse_id IS NULL THEN
    RAISE EXCEPTION 'No warehouse found for company %', p_company_id;
  END IF;

  INSERT INTO product_stock (company_id, product_id, warehouse_id, quantity)
  VALUES (p_company_id, p_product_id, v_warehouse_id, p_delta)
  ON CONFLICT (product_id, warehouse_id)
  DO UPDATE SET quantity = product_stock.quantity + EXCLUDED.quantity;

  -- Keep company-wide total in sync
  UPDATE products
  SET stock_qty = (SELECT COALESCE(SUM(quantity), 0) FROM product_stock WHERE product_id = p_product_id)
  WHERE id = p_product_id AND company_id = p_company_id;
END;
$function$;

-- PERMISSIONS
INSERT INTO permissions (code, name, module) VALUES
  ('warehouses.list','List Warehouses','inventory'),
  ('warehouses.create','Create Warehouse','inventory'),
  ('warehouses.update','Update Warehouse','inventory'),
  ('warehouses.delete','Delete Warehouse','inventory')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Owner' AND p.code IN (
  'warehouses.list','warehouses.create','warehouses.update','warehouses.delete'
)
ON CONFLICT DO NOTHING;

-- DOWN
-- DROP TABLE IF EXISTS product_stock;
-- DROP TABLE IF EXISTS warehouses;
-- ALTER TABLE products DROP COLUMN IF EXISTS default_warehouse_id;
