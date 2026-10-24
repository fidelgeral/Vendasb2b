-- Refresh tokens para renovação de sessão sem re-login
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  super_admin_id UUID REFERENCES super_admins(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked BOOLEAN DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token) WHERE revoked = false;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_employee ON refresh_tokens (employee_id) WHERE revoked = false;
