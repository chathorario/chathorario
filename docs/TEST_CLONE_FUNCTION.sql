-- =====================================================
-- TESTE DA FUNÇÃO clone_schedule_scenario
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- PASSO 1: Ver cenários existentes
SELECT 
    id,
    name,
    status,
    is_active,
    created_at,
    (SELECT COUNT(*) FROM teachers WHERE schedule_id = s.id) as teachers_count,
    (SELECT COUNT(*) FROM subjects WHERE schedule_id = s.id) as subjects_count,
    (SELECT COUNT(*) FROM classes WHERE schedule_id = s.id) as classes_count,
    (SELECT COUNT(*) FROM workloads WHERE schedule_id = s.id) as workloads_count
FROM schedules s
ORDER BY created_at DESC;

-- =====================================================
-- PASSO 2: Clonar o cenário ativo
-- =====================================================
-- Substitua o UUID abaixo pelo ID do cenário que você quer clonar
-- (copie da query acima)

DO $$
DECLARE
    v_original_id UUID;
    v_result RECORD;
BEGIN
    -- Pegar o cenário ativo (ou o mais recente)
    SELECT id INTO v_original_id
    FROM schedules
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não houver ativo, pegar o mais recente
    IF v_original_id IS NULL THEN
        SELECT id INTO v_original_id
        FROM schedules
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;
    
    IF v_original_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum cenário encontrado para clonar';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Clonando cenário: %', v_original_id;
    RAISE NOTICE '========================================';
    
    -- Executar a clonagem
    SELECT * INTO v_result
    FROM clone_schedule_scenario(
        v_original_id,
        'Cenário Clonado - ' || to_char(NOW(), 'DD/MM/YYYY HH24:MI'),
        'Teste de clonagem automática'
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ CLONAGEM CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE 'Novo Cenário ID: %', v_result.new_schedule_id;
    RAISE NOTICE 'Professores clonados: %', v_result.teachers_cloned;
    RAISE NOTICE 'Disciplinas clonadas: %', v_result.subjects_cloned;
    RAISE NOTICE 'Turmas clonadas: %', v_result.classes_cloned;
    RAISE NOTICE 'Workloads clonados: %', v_result.workloads_cloned;
    RAISE NOTICE 'Disponibilidades clonadas: %', v_result.availability_cloned;
    RAISE NOTICE 'Aulas fixas clonadas: %', v_result.fixed_lessons_cloned;
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- PASSO 3: Verificar resultado
-- =====================================================
-- Ver todos os cenários agora (incluindo o clonado)
SELECT 
    name,
    status,
    created_at,
    (SELECT COUNT(*) FROM teachers WHERE schedule_id = s.id) as teachers,
    (SELECT COUNT(*) FROM subjects WHERE schedule_id = s.id) as subjects,
    (SELECT COUNT(*) FROM classes WHERE schedule_id = s.id) as classes,
    (SELECT COUNT(*) FROM workloads WHERE schedule_id = s.id) as workloads
FROM schedules s
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- PASSO 4: Comparar Original vs Clonado
-- =====================================================
WITH latest_two AS (
    SELECT id, name, created_at
    FROM schedules
    ORDER BY created_at DESC
    LIMIT 2
)
SELECT 
    s.name,
    (SELECT COUNT(*) FROM teachers WHERE schedule_id = s.id) as teachers,
    (SELECT COUNT(*) FROM subjects WHERE schedule_id = s.id) as subjects,
    (SELECT COUNT(*) FROM classes WHERE schedule_id = s.id) as classes,
    (SELECT COUNT(*) FROM workloads WHERE schedule_id = s.id) as workloads,
    (SELECT COUNT(*) FROM teacher_availability WHERE schedule_id = s.id) as availability,
    (SELECT COUNT(*) FROM fixed_lessons WHERE schedule_id = s.id) as fixed_lessons
FROM latest_two s
ORDER BY s.created_at;

-- =====================================================
-- PASSO 5: Verificar integridade dos IDs (IMPORTANTE!)
-- =====================================================
-- Verificar se todos os workloads do cenário clonado
-- apontam para IDs válidos do mesmo cenário

WITH cloned_scenario AS (
    SELECT id, name FROM schedules 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    cs.name as scenario_name,
    COUNT(*) as total_workloads,
    COUNT(*) FILTER (
        WHERE EXISTS(
            SELECT 1 FROM teachers t 
            WHERE t.id = w.teacher_id 
            AND t.schedule_id = cs.id
        )
    ) as valid_teacher_ids,
    COUNT(*) FILTER (
        WHERE EXISTS(
            SELECT 1 FROM subjects s 
            WHERE s.id = w.subject_id 
            AND s.schedule_id = cs.id
        )
    ) as valid_subject_ids,
    COUNT(*) FILTER (
        WHERE EXISTS(
            SELECT 1 FROM classes c 
            WHERE c.id = w.class_id 
            AND c.schedule_id = cs.id
        )
    ) as valid_class_ids
FROM workloads w
CROSS JOIN cloned_scenario cs
WHERE w.schedule_id = cs.id
GROUP BY cs.name;

-- Se total_workloads = valid_*_ids para todos, então está PERFEITO! ✅
