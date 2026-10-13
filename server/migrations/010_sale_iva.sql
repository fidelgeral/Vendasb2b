-- Guarda a taxa de IVA escolhida em cada venda, para o recibo/factura mostrar
-- sempre a taxa correcta (mesmo quando o negócio usa várias taxas).
ALTER TABLE sales ADD COLUMN IF NOT EXISTS iva_taxa NUMERIC(5,2);
