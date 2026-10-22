-- Permissões por funcionário (o que cada conta pode fazer). Guardadas como um
-- objecto { "<permissao>": true|false }. Vazio = usa o padrão do papel (role).
ALTER TABLE employees ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;
