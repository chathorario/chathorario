-- Adiciona coluna bell_schedule na tabela classes
-- Esta coluna armazena a configuração de horários e intervalos específica de cada série

ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS bell_schedule JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN classes.bell_schedule IS 'Configuração de horários do sino: array de slots com type (lesson/break) e duration em minutos. Ex: [{"type":"lesson","duration":50},{"type":"break","duration":20}]';

-- Índice para consultas mais rápidas
CREATE INDEX IF NOT EXISTS idx_classes_bell_schedule ON classes USING GIN (bell_schedule);
