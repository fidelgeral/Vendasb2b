-- Registo de quebras de caixa (diferença entre esperado e declarado ao fechar turno)
CREATE TABLE IF NOT EXISTS cash_shortages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employee_name TEXT,
  expected NUMERIC(14,2) NOT NULL DEFAULT 0,
  declared NUMERIC(14,2) NOT NULL DEFAULT 0,
  shortage NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
