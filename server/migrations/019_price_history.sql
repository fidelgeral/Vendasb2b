CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price NUMERIC(14,2),
  new_price NUMERIC(14,2),
  old_cost NUMERIC(14,2),
  new_cost NUMERIC(14,2),
  employee_name VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ph_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_ph_business ON price_history(business_id);
