-- ==============================================================================
-- CORREÇÃO: SNAPSHOT EM SCHEDULE_SCENARIOS
-- ==============================================================================
-- DATA: 2025-12-01
-- DESCRIÇÃO: Ajusta a funcionalidade de snapshot para usar a tabela correta
--            (schedule_scenarios) que está sendo usada em produção.
-- ==============================================================================

-- 1. Adicionar coluna na tabela correta
ALTER TABLE schedule_scenarios ADD COLUMN IF NOT EXISTS snapshot_data JSONB;

-- 2. Corrigir função de geração
CREATE OR REPLACE FUNCTION generate_schedule_snapshot(p_schedule_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_snapshot JSONB;
    v_frozen_at TIMESTAMPTZ;
    v_total_classes INTEGER;
    v_total_teachers INTEGER;
    v_allocations_dump JSONB;
    v_school_id UUID;
BEGIN
    -- Obter school_id do cenário
    SELECT school_id INTO v_school_id FROM schedule_scenarios WHERE id = p_schedule_id;
    
    IF v_school_id IS NULL THEN
        -- Tentar buscar na tabela schedules caso seja a nova arquitetura
        SELECT school_id INTO v_school_id FROM schedules WHERE id = p_schedule_id;
    END IF;

    -- Capturar o timestamp atual
    v_frozen_at := NOW();
    
    -- Calcular estatísticas agregadas (baseadas em workloads do cenário ou da escola?)
    -- NOTA: Se os workloads têm schedule_id, devemos filtrar por ele.
    -- Se são globais (nova arquitetura), filtramos por school_id e usamos as settings.
    -- Assumindo arquitetura híbrida/transição:
    
    SELECT COUNT(DISTINCT w.class_id)
    INTO v_total_classes
    FROM workloads w
    WHERE w.school_id = v_school_id
    AND (w.schedule_id = p_schedule_id OR w.schedule_id IS NULL);
    
    SELECT COUNT(DISTINCT w.teacher_id)
    INTO v_total_teachers
    FROM workloads w
    WHERE w.school_id = v_school_id
    AND (w.schedule_id = p_schedule_id OR w.schedule_id IS NULL);
    
    -- Construir o dump de alocações
    SELECT jsonb_agg(
        jsonb_build_object(
            'teacher_name', COALESCE(t.name, 'Professor Desconhecido'),
            'subject', COALESCE(s.name, s.code, 'Disciplina Desconhecida'),
            'class', COALESCE(c.name, 'Turma Desconhecida'),
            'aulas', w.hours
        )
        ORDER BY t.name, c.name, s.name
    )
    INTO v_allocations_dump
    FROM workloads w
    LEFT JOIN teachers t ON w.teacher_id = t.id
    LEFT JOIN subjects s ON w.subject_id = s.id
    LEFT JOIN classes c ON w.class_id = c.id
    WHERE w.school_id = v_school_id
    AND (w.schedule_id = p_schedule_id OR w.schedule_id IS NULL);
    
    -- Se não houver alocações, retornar array vazio
    IF v_allocations_dump IS NULL THEN
        v_allocations_dump := '[]'::JSONB;
    END IF;
    
    -- Construir o objeto JSON final
    v_snapshot := jsonb_build_object(
        'frozen_at', to_char(v_frozen_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'stats', jsonb_build_object(
            'total_classes', COALESCE(v_total_classes, 0),
            'total_teachers', COALESCE(v_total_teachers, 0)
        ),
        'allocations_dump', v_allocations_dump
    );
    
    RETURN v_snapshot;
END;
$$;

-- 3. Corrigir função de congelamento
CREATE OR REPLACE FUNCTION freeze_schedule_snapshot(p_schedule_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_snapshot JSONB;
BEGIN
    -- Verificar se o cenário existe em schedule_scenarios
    IF EXISTS (SELECT 1 FROM schedule_scenarios WHERE id = p_schedule_id) THEN
        -- Gerar o snapshot
        v_snapshot := generate_schedule_snapshot(p_schedule_id);
        
        -- Salvar o snapshot
        UPDATE schedule_scenarios
        SET snapshot_data = v_snapshot,
            updated_at = NOW()
        WHERE id = p_schedule_id;
        
        RETURN true;
    
    ELSIF EXISTS (SELECT 1 FROM schedules WHERE id = p_schedule_id) THEN
        -- Fallback para tabela schedules
        v_snapshot := generate_schedule_snapshot(p_schedule_id);
        
        UPDATE schedules
        SET snapshot_data = v_snapshot,
            updated_at = NOW()
        WHERE id = p_schedule_id;
        
        RETURN true;
    ELSE
        RAISE EXCEPTION 'Cenário com ID % não encontrado', p_schedule_id;
    END IF;
END;
$$;
