-- ========================================
-- LIMPAR TURMAS DUPLICADAS DO BANCO
-- ========================================
-- Execute este script no SQL Editor do Supabase

-- 1. Ver quantas turmas você tem atualmente
SELECT 
    COUNT(*) as total_turmas,
    COUNT(DISTINCT name) as turmas_unicas
FROM classes
WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  AND schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1);

-- 2. Ver todas as turmas (para conferir antes de deletar)
SELECT 
    id,
    name,
    grade as turno,
    aulas_diarias,
    created_at
FROM classes
WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  AND schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1)
ORDER BY created_at DESC;

-- 3. DELETAR TODAS AS TURMAS DO CENÁRIO ATUAL
-- ⚠️ ATENÇÃO: Isto vai deletar TODAS as turmas!
-- Descomente a linha abaixo para executar:

/*
DELETE FROM classes
WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  AND schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1);
*/

-- 4. Verificar se foi deletado
SELECT COUNT(*) as turmas_restantes
FROM classes
WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  AND schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1);
