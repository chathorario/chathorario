-- =====================================================
-- EXEMPLOS PRÁTICOS: clone_schedule_scenario
-- =====================================================
-- Este arquivo contém exemplos reais de uso da função
-- de clonagem de cenários
-- =====================================================

-- =====================================================
-- EXEMPLO 1: Clonagem Simples
-- =====================================================
-- Clonar um cenário existente com nome novo

SELECT * FROM clone_schedule_scenario(
    'abc-123-original-uuid'::uuid,
    'Cenário 2025 - Versão 2'
);

-- Resultado esperado:
-- new_schedule_id          | teachers_cloned | subjects_cloned | classes_cloned | workloads_cloned | availability_cloned | fixed_lessons_cloned
-- -------------------------|-----------------|-----------------|----------------|------------------|---------------------|---------------------
-- xyz-789-new-uuid         | 42              | 22              | 24             | 156              | 84                  | 12

-- =====================================================
-- EXEMPLO 2: Clonagem com Descrição Personalizada
-- =====================================================

SELECT * FROM clone_schedule_scenario(
    (SELECT id FROM schedule_scenarios WHERE name = 'Cenário Base 2024' LIMIT 1),
    'Cenário Experimental 2025',
    'Versão experimental com ajustes de carga horária para professores de matemática'
);

-- =====================================================
-- EXEMPLO 3: Clonar para Outra Escola (Admin)
-- =====================================================
-- Útil para replicar estrutura entre escolas

SELECT * FROM clone_schedule_scenario(
    'original-uuid'::uuid,
    'Cenário Importado',
    'Importado da Escola A para Escola B',
    'school-b-uuid'::uuid,  -- Nova escola
    'admin-user-uuid'::uuid -- Admin que está fazendo a importação
);

-- =====================================================
-- EXEMPLO 4: Verificar Resultado da Clonagem
-- =====================================================

-- Após clonar, verificar se tudo foi copiado corretamente
WITH clone_result AS (
    SELECT * FROM clone_schedule_scenario(
        'original-uuid'::uuid,
        'Teste de Clonagem'
    )
)
SELECT 
    cr.new_schedule_id,
    cr.teachers_cloned,
    cr.subjects_cloned,
    cr.classes_cloned,
    cr.workloads_cloned,
    -- Verificar se os números batem com o original
    (SELECT COUNT(*) FROM teachers WHERE schedule_id = 'original-uuid') as original_teachers,
    (SELECT COUNT(*) FROM subjects WHERE schedule_id = 'original-uuid') as original_subjects,
    (SELECT COUNT(*) FROM classes WHERE schedule_id = 'original-uuid') as original_classes,
    (SELECT COUNT(*) FROM workloads WHERE schedule_id = 'original-uuid') as original_workloads
FROM clone_result cr;

-- =====================================================
-- EXEMPLO 5: Clonar e Ativar Imediatamente
-- =====================================================

DO $$
DECLARE
    v_new_id UUID;
BEGIN
    -- Clonar
    SELECT new_schedule_id INTO v_new_id
    FROM clone_schedule_scenario(
        'original-uuid'::uuid,
        'Cenário Ativo 2025'
    );
    
    -- Desativar todos os outros
    UPDATE schedule_scenarios 
    SET is_active = false 
    WHERE school_id = 'school-uuid';
    
    -- Ativar o novo
    UPDATE schedule_scenarios 
    SET is_active = true 
    WHERE id = v_new_id;
    
    RAISE NOTICE 'Cenário % ativado com sucesso', v_new_id;
END $$;

-- =====================================================
-- EXEMPLO 6: Clonar Múltiplos Cenários em Batch
-- =====================================================

-- Criar 3 variações do mesmo cenário base
DO $$
DECLARE
    v_base_id UUID := 'original-uuid';
    v_new_id UUID;
    v_variant TEXT;
BEGIN
    FOR v_variant IN SELECT unnest(ARRAY['Variante A', 'Variante B', 'Variante C'])
    LOOP
        SELECT new_schedule_id INTO v_new_id
        FROM clone_schedule_scenario(
            v_base_id,
            'Cenário 2025 - ' || v_variant,
            'Variante experimental: ' || v_variant
        );
        
        RAISE NOTICE 'Criado: % (ID: %)', v_variant, v_new_id;
    END LOOP;
END $$;

-- =====================================================
-- EXEMPLO 7: Comparar Original vs Clonado
-- =====================================================

WITH original AS (
    SELECT 
        'Original' as tipo,
        s.id,
        s.name,
        (SELECT COUNT(*) FROM teachers WHERE schedule_id = s.id) as teachers,
        (SELECT COUNT(*) FROM subjects WHERE schedule_id = s.id) as subjects,
        (SELECT COUNT(*) FROM classes WHERE schedule_id = s.id) as classes,
        (SELECT COUNT(*) FROM workloads WHERE schedule_id = s.id) as workloads
    FROM schedule_scenarios s
    WHERE s.id = 'original-uuid'
),
cloned AS (
    SELECT 
        'Clonado' as tipo,
        s.id,
        s.name,
        (SELECT COUNT(*) FROM teachers WHERE schedule_id = s.id) as teachers,
        (SELECT COUNT(*) FROM subjects WHERE schedule_id = s.id) as subjects,
        (SELECT COUNT(*) FROM classes WHERE schedule_id = s.id) as classes,
        (SELECT COUNT(*) FROM workloads WHERE schedule_id = s.id) as workloads
    FROM schedule_scenarios s
    WHERE s.name = 'Cenário Clonado'
    ORDER BY s.created_at DESC
    LIMIT 1
)
SELECT * FROM original
UNION ALL
SELECT * FROM cloned;

-- Resultado esperado (números iguais):
-- tipo     | id   | name              | teachers | subjects | classes | workloads
-- ---------|------|-------------------|----------|----------|---------|----------
-- Original | abc  | Cenário Original  | 42       | 22       | 24      | 156
-- Clonado  | xyz  | Cenário Clonado   | 42       | 22       | 24      | 156

-- =====================================================
-- EXEMPLO 8: Verificar Integridade dos IDs Remapeados
-- =====================================================

-- Verificar se todos os workloads do cenário clonado
-- apontam para IDs válidos do mesmo cenário

WITH cloned_scenario AS (
    SELECT id FROM schedule_scenarios 
    WHERE name = 'Cenário Clonado'
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    w.id as workload_id,
    w.teacher_id,
    w.subject_id,
    w.class_id,
    -- Verificar se os IDs existem no mesmo cenário
    EXISTS(SELECT 1 FROM teachers t WHERE t.id = w.teacher_id AND t.schedule_id = cs.id) as teacher_valid,
    EXISTS(SELECT 1 FROM subjects s WHERE s.id = w.subject_id AND s.schedule_id = cs.id) as subject_valid,
    EXISTS(SELECT 1 FROM classes c WHERE c.id = w.class_id AND c.schedule_id = cs.id) as class_valid
FROM workloads w
CROSS JOIN cloned_scenario cs
WHERE w.schedule_id = cs.id;

-- Todos devem retornar 'true' nas colunas *_valid

-- =====================================================
-- EXEMPLO 9: Auditoria de Clonagem
-- =====================================================

-- Ver histórico de clonagens (assumindo que você adiciona metadata)
SELECT 
    s.name,
    s.description,
    s.created_at,
    s.created_by,
    p.full_name as created_by_name,
    (SELECT COUNT(*) FROM teachers WHERE schedule_id = s.id) as total_teachers,
    (SELECT COUNT(*) FROM workloads WHERE schedule_id = s.id) as total_workloads
FROM schedule_scenarios s
LEFT JOIN profiles p ON s.created_by = p.id
WHERE s.description LIKE '%Clonado%'
ORDER BY s.created_at DESC;

-- =====================================================
-- EXEMPLO 10: Rollback de Clonagem (Deletar Clonado)
-- =====================================================

-- Se a clonagem não ficou boa, deletar o cenário clonado
-- (CASCADE vai deletar todas as entidades relacionadas)

DO $$
DECLARE
    v_scenario_id UUID;
BEGIN
    -- Encontrar o cenário clonado mais recente
    SELECT id INTO v_scenario_id
    FROM schedule_scenarios
    WHERE name = 'Cenário Clonado'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_scenario_id IS NULL THEN
        RAISE NOTICE 'Cenário não encontrado';
        RETURN;
    END IF;
    
    -- Deletar (CASCADE vai limpar tudo)
    DELETE FROM schedule_scenarios WHERE id = v_scenario_id;
    
    RAISE NOTICE 'Cenário % deletado com sucesso', v_scenario_id;
END $$;

-- =====================================================
-- EXEMPLO 11: Clonar Apenas se Não Existir
-- =====================================================

DO $$
DECLARE
    v_new_name TEXT := 'Cenário 2025 - Final';
    v_original_id UUID := 'original-uuid';
BEGIN
    -- Verificar se já existe
    IF EXISTS (SELECT 1 FROM schedule_scenarios WHERE name = v_new_name) THEN
        RAISE NOTICE 'Cenário "%" já existe, pulando clonagem', v_new_name;
        RETURN;
    END IF;
    
    -- Clonar
    PERFORM clone_schedule_scenario(v_original_id, v_new_name);
    RAISE NOTICE 'Cenário "%" criado com sucesso', v_new_name;
END $$;

-- =====================================================
-- EXEMPLO 12: Estatísticas de Clonagem
-- =====================================================

-- Ver quantos cenários foram clonados hoje
SELECT 
    COUNT(*) as scenarios_cloned_today,
    SUM((SELECT COUNT(*) FROM teachers WHERE schedule_id = s.id)) as total_teachers_cloned,
    SUM((SELECT COUNT(*) FROM workloads WHERE schedule_id = s.id)) as total_workloads_cloned
FROM schedule_scenarios s
WHERE s.created_at >= CURRENT_DATE
AND s.description LIKE '%Clonado%';

-- =====================================================
-- DICAS E BOAS PRÁTICAS
-- =====================================================

/*
1. SEMPRE verifique o resultado da clonagem:
   - Compare contagens (teachers, subjects, classes, workloads)
   - Verifique integridade dos IDs

2. Use nomes descritivos:
   - Inclua data: "Cenário 2025-01-15"
   - Inclua versão: "Cenário Base - v2"
   - Inclua propósito: "Cenário Experimental - Teste Carga"

3. Adicione descrições detalhadas:
   - O que mudou em relação ao original
   - Por que foi clonado
   - Quem solicitou

4. Monitore performance:
   - Para cenários grandes, a clonagem pode levar alguns segundos
   - Considere executar em horários de baixo uso

5. Backup antes de clonar:
   - Se for clonar para fazer alterações experimentais
   - Mantenha o original intocado

6. Limpeza periódica:
   - Delete cenários de teste antigos
   - Mantenha apenas cenários relevantes
*/
