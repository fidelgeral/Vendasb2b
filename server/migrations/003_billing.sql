-- Mensalidades / assinatura das lojas (pagas ao super-admin por M-Pesa/e-Mola,
-- confirmadas e suspensas manualmente, pois não há API de pagamento).

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'Gratuito';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'ativo'; -- ativo | pendente | suspenso
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS next_due_date DATE;

CREATE TABLE IF NOT EXISTS payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  method TEXT NOT NULL,          -- mpesa | emola
  reference TEXT,                -- nº da transacção / observação do lojista
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente | confirmado | rejeitado
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_business ON payment_submissions(business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_status ON payment_submissions(status);
