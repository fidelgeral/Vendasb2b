-- Tabela dedicada de transferências de stock entre filiais.
-- Permite rastrear todo o histórico de envios/recepções.
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  to_business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  qty NUMERIC(14,3) NOT NULL,
  cost_unit NUMERIC(14,2) NOT NULL DEFAULT 0,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employee_name TEXT,
  nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_from ON stock_transfers(from_business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_to ON stock_transfers(to_business_id, created_at);
