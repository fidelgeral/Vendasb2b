-- Lotes de stock completos (estilo vendas360).
-- Enriquece os lotes (product_batches) com nome, custo total, fornecedor,
-- quantidade inicial e data de entrada; e cria o histórico de movimentos por
-- lote (entrada / saída de venda / quebra / ajuste).
ALTER TABLE product_batches
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS cost_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS initial_qty NUMERIC(14,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS batch_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES product_batches(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL, -- entrada | saida | quebra | ajuste
  qty NUMERIC(14,3) NOT NULL,
  saldo NUMERIC(14,3) NOT NULL DEFAULT 0,
  descricao TEXT,
  employee_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_batch_mov_batch ON batch_movements(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_mov_business ON batch_movements(business_id);
