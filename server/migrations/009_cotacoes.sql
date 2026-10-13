-- Cotações (orçamentos): documento não-fiscal com os produtos selecionados e o
-- total, sem dar baixa no stock nem registar venda. Pode depois ser carregada
-- para o ecrã de Vender e convertida numa venda finalizada.
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  numero TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount NUMERIC(14,2) NOT NULL DEFAULT 0,
  iva_taxa NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'aberta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quotations_business ON quotations(business_id);
