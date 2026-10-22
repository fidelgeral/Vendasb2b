-- Campos extra do funcionário (perfil): género, foto (data URL) e se é
-- garçom/empregado de mesa (para restaurante/bar).
ALTER TABLE employees ADD COLUMN IF NOT EXISTS genero TEXT NOT NULL DEFAULT '';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS foto TEXT NOT NULL DEFAULT '';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS garcom BOOLEAN NOT NULL DEFAULT false;
