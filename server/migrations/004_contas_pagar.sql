-- Contas a pagar (despesas futuras: fornecedores, renda, salários, etc.)
CREATE TABLE IF NOT EXISTS contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  categoria TEXT,
  valor NUMERIC(14,2) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  vencimento DATE,
  estado TEXT NOT NULL DEFAULT 'aberta', -- aberta | paga
  paga_em DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_business ON contas_pagar(business_id, estado);
