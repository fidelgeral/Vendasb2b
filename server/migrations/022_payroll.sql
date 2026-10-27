CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(200) NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  salario_base NUMERIC(14,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(14,2) NOT NULL DEFAULT 0,
  descontos NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  notas TEXT,
  pago BOOLEAN NOT NULL DEFAULT false,
  pago_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(200)
);
CREATE INDEX IF NOT EXISTS idx_payroll_business ON payroll(business_id, ano, mes);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
