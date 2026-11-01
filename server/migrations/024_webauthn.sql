CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id SERIAL PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key BYTEA NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_name TEXT NOT NULL DEFAULT 'Dispositivo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webauthn_employee ON webauthn_credentials (employee_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_cred_id ON webauthn_credentials (credential_id);
