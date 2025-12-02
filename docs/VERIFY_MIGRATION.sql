-- =====================================================
-- SCRIPT DE VERIFICAÇÃO PÓS-MIGRAÇÃO
-- =====================================================

DO $$
DECLARE
    v_global_teachers INTEGER;
    v_scenario_settings INTEGER;
    v_schedules_count INTEGER;
BEGIN
    RAISE NOTICE '=== INICIANDO VERIFICAÇÃO ===';

    -- 1. Verificar Tabelas Novas
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scenario_teacher_settings') THEN
        RAISE NOTICE '✅ Tabela scenario_teacher_settings existe.';
    ELSE
        RAISE NOTICE '❌ ERRO: Tabela scenario_teacher_settings NÃO existe.';
    END IF;

    -- 2. Verificar Professores Globais (schedule_id IS NULL)
    SELECT COUNT(*) INTO v_global_teachers FROM teachers WHERE schedule_id IS NULL;
    RAISE NOTICE '📊 Professores Globais (schedule_id NULL): %', v_global_teachers;
    
    IF v_global_teachers > 0 THEN
        RAISE NOTICE '✅ Existem professores globais.';
    ELSE
        RAISE NOTICE '⚠️ AVISO: Nenhum professor global encontrado. A migração rodou?';
    END IF;

    -- 3. Verificar Configurações de Cenário
    SELECT COUNT(*) INTO v_scenario_settings FROM scenario_teacher_settings;
    RAISE NOTICE '📊 Configurações de Professores criadas: %', v_scenario_settings;

    -- 4. Verificar Cenários
    SELECT COUNT(*) INTO v_schedules_count FROM schedules;
    RAISE NOTICE '📊 Total de Cenários: %', v_schedules_count;

    -- 5. Teste de Integridade (Exemplo)
    -- Verificar se há professores em settings que não existem na tabela teachers
    IF EXISTS (
        SELECT 1 FROM scenario_teacher_settings sts 
        LEFT JOIN teachers t ON sts.teacher_id = t.id 
        WHERE t.id IS NULL
    ) THEN
        RAISE NOTICE '❌ ERRO CRÍTICO: Existem settings apontando para professores inexistentes!';
    ELSE
        RAISE NOTICE '✅ Integridade Referencial OK (Settings -> Teachers)';
    END IF;

    RAISE NOTICE '=== VERIFICAÇÃO CONCLUÍDA ===';
END $$;

-- 6. Listar amostra de dados para inspeção visual
SELECT 'Amostra de Professores Globais' as info;
SELECT id, name, school_id, schedule_id FROM teachers WHERE schedule_id IS NULL LIMIT 5;

SELECT 'Amostra de Settings' as info;
SELECT sts.scenario_id, t.name, sts.custom_workload 
FROM scenario_teacher_settings sts
JOIN teachers t ON sts.teacher_id = t.id
LIMIT 5;
