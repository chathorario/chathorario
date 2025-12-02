-- Verificar estrutura da tabela schedules
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'schedules'
ORDER BY ordinal_position;

-- Verificar se o UUID existe
SELECT id, name, created_at
FROM schedules
WHERE id = '4891210b-12d1-46f4-97c8-1490511b6ee1';

-- Listar todos os schedules
SELECT id, name, created_at
FROM schedules
ORDER BY created_at DESC;
