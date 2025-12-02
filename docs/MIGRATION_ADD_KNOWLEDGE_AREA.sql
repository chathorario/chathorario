-- Adiciona a coluna knowledge_area na tabela teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS knowledge_area text;

-- Opcional: Criar um índice para melhorar a performance de consultas por área
CREATE INDEX IF NOT EXISTS idx_teachers_knowledge_area ON teachers(knowledge_area);
