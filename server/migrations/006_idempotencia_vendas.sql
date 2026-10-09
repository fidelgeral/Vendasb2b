-- Idempotência das vendas: cada venda leva um identificador único gerado pelo
-- cliente (clientSaleId). Se a mesma venda for enviada mais do que uma vez
-- (p. ex. sincronização offline a partir de dois separadores, ou a resposta do
-- servidor perdeu-se na rede), o servidor reconhece-a e NÃO cria um duplicado.
ALTER TABLE sales ADD COLUMN IF NOT EXISTS client_sale_id text;

CREATE UNIQUE INDEX IF NOT EXISTS sales_business_client_sale_uid
  ON sales (business_id, client_sale_id)
  WHERE client_sale_id IS NOT NULL;
