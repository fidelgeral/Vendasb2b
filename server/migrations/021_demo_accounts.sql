-- Contas demonstração (3 dias de validade)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS demo_representative VARCHAR(200);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS demo_contact_email VARCHAR(300);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS demo_contact_phone VARCHAR(50);

-- Comprovativos de pagamento de assinatura
CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  payer_name VARCHAR(200) NOT NULL,
  payer_phone VARCHAR(50),
  amount NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'mpesa',
  reference VARCHAR(200),
  notes TEXT,
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','confirmado','rejeitado')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contas de pagamento personalizáveis
CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'outro',
  numero VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
