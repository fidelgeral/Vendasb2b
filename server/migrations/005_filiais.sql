-- Multi-loja (filiais): cada filial é uma linha normal em businesses (reutiliza
-- todo o isolamento existente). parent_business_id agrupa as filiais do mesmo
-- dono; NULL = negócio independente / sede.
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS parent_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_parent ON businesses(parent_business_id);
