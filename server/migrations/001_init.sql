-- VENDASB2B — schema inicial
-- Uma tabela por entidade, isolamento por business_id.
-- Nomes de colunas em inglês/snake_case por convenção SQL; as rotas da API
-- traduzem para os nomes exactos que o frontend espera (alguns em português,
-- herdados do protótipo original) através de aliases nas queries.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  doc_id TEXT,
  role TEXT NOT NULL DEFAULT 'caixa', -- dono | gerente | caixa | cozinha
  password_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, email)
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE (business_id, name)
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contacto TEXT,
  phone TEXT,
  email TEXT,
  nuit TEXT,
  endereco TEXT,
  prazo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_suppliers_business ON suppliers(business_id);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'simples', -- simples | variacao | composicao
  venda_directa BOOLEAN NOT NULL DEFAULT true,
  codigo TEXT,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'un',
  qtd_itens INTEGER NOT NULL DEFAULT 1,
  iva_taxa NUMERIC(5,2),
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  min_stock NUMERIC(14,3) NOT NULL DEFAULT 0,
  prazo_reembolso INTEGER NOT NULL DEFAULT 0,
  foto TEXT,
  stock NUMERIC(14,3) NOT NULL DEFAULT 0, -- só usado quando tipo=simples sem lotes
  parent_id UUID REFERENCES products(id) ON DELETE SET NULL, -- tipo=variacao
  consumo NUMERIC(14,3) NOT NULL DEFAULT 1, -- tipo=variacao
  fornecedor_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_business ON products(business_id);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  stock NUMERIC(14,3) NOT NULL DEFAULT 0
);
CREATE INDEX idx_variants_product ON product_variants(product_id);

CREATE TABLE product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty NUMERIC(14,3) NOT NULL DEFAULT 0,
  expiry_date DATE
);
CREATE INDEX idx_batches_product ON product_batches(product_id);

CREATE TABLE product_combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  qty NUMERIC(14,3) NOT NULL DEFAULT 0
);
CREATE INDEX idx_combo_product ON product_combo_items(product_id);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Particular',
  phone TEXT,
  email TEXT,
  nuit TEXT,
  endereco TEXT,
  cidade TEXT,
  credit_limit NUMERIC(14,2) NOT NULL DEFAULT 0,
  notas TEXT,
  points NUMERIC(14,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clients_business ON clients(business_id);

CREATE TABLE client_debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sale_id UUID,
  amount NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_debts_client ON client_debts(client_id);

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  qty NUMERIC(14,3) NOT NULL,
  cost NUMERIC(14,2) NOT NULL,
  total NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_purchases_business ON purchases(business_id);

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 4
);
CREATE INDEX idx_tables_business ON tables(business_id);

CREATE TABLE comandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  service_charge_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comandas_business ON comandas(business_id);

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  opened_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  closed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  opening_cash NUMERIC(14,2) NOT NULL DEFAULT 0,
  closing_cash NUMERIC(14,2),
  expected_cash NUMERIC(14,2),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);
CREATE INDEX idx_shifts_business ON shifts(business_id);
CREATE INDEX idx_shifts_business_open ON shifts(business_id) WHERE closed_at IS NULL;

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  numero TEXT,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount NUMERIC(14,2) NOT NULL DEFAULT 0,
  payments JSONB NOT NULL DEFAULT '[]'::jsonb,
  pontos_usados NUMERIC(14,2) NOT NULL DEFAULT 0,
  pontos_ganhos NUMERIC(14,2) NOT NULL DEFAULT 0,
  voided BOOLEAN NOT NULL DEFAULT false,
  void_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sales_business ON sales(business_id);
CREATE INDEX idx_sales_business_created ON sales(business_id, created_at);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID,
  name_snapshot TEXT NOT NULL,
  qty NUMERIC(14,3) NOT NULL,
  price NUMERIC(14,2) NOT NULL,
  cost NUMERIC(14,2) NOT NULL DEFAULT 0
);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);

CREATE TABLE parked_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  cart JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_parked_business ON parked_sales(business_id);

CREATE TABLE quebras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID,
  qty NUMERIC(14,3) NOT NULL,
  motivo TEXT,
  custo_impacto NUMERIC(14,2) NOT NULL DEFAULT 0,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quebras_business ON quebras(business_id);

CREATE TABLE movimentos_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL, -- entrada | saida
  categoria TEXT,
  amount NUMERIC(14,2) NOT NULL,
  descricao TEXT,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_movimentos_business ON movimentos_caixa(business_id);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employee_name TEXT,
  acao TEXT NOT NULL,
  detalhe TEXT,
  valor NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_business ON audit_log(business_id, created_at);
