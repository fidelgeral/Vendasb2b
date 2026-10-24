-- Auditoria de login: regista todas as tentativas (sucesso e falha)
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip TEXT,
  user_agent TEXT,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  login_type TEXT NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_business ON login_attempts (business_id, created_at DESC);

-- Programa de fidelidade
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, client_id)
);

CREATE TABLE IF NOT EXISTS loyalty_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'ganho',
  descricao TEXT,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_business ON loyalty_points (business_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_history_client ON loyalty_history (client_id, created_at DESC);

-- Configuração de fidelidade no negócio
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS loyalty_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS loyalty_points_per_mt NUMERIC(10,2) NOT NULL DEFAULT 1;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS loyalty_mt_per_point NUMERIC(10,2) NOT NULL DEFAULT 0.1;

-- Personalização visual
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#2563eb';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Onboarding
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN NOT NULL DEFAULT false;
