-- Controlo de acesso por filial: funcionario pode ser restrito a filiais especificas
ALTER TABLE employees ADD COLUMN IF NOT EXISTS allowed_filiais UUID[] DEFAULT NULL;
-- NULL = acesso a todas (comportamento actual para donos/gerentes)
-- Array de business_ids = acesso apenas a essas filiais
