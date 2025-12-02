-- =====================================================
-- DIAGNÓSTICO: Encontrar a tabela correta de cenários
-- =====================================================

-- 1. Verificar se a tabela schedule_scenarios existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'schedule_scenarios'
) as schedule_scenarios_exists;

-- 2. Listar todas as tabelas que contêm "schedule" no nome
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%schedule%'
ORDER BY table_name;

-- 3. Listar todas as tabelas que contêm "scenario" no nome
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%scenario%'
ORDER BY table_name;

-- 4. Listar todas as tabelas do schema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 5. Se a tabela for "schedules" (sem scenarios), verificar estrutura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'schedules'
ORDER BY ordinal_position;

-- 6. Tentar buscar dados da tabela "schedules"
SELECT id, name, created_at 
FROM schedules 
ORDER BY created_at DESC 
LIMIT 5;
