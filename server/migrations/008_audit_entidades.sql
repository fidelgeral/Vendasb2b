-- Histórico por entidade: permite saber o que mudou, quem mudou e quando em
-- fornecedores, categorias, produtos (e outras entidades no futuro). Reusa a
-- tabela audit_log, acrescentando a referência à entidade.
ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_id TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log (business_id, entity_type, entity_id);
