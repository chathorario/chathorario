-- ==============================================================================
-- NOVA FUNÇÃO DE CLONAGEM: LIGHTWEIGHT (LAYERED ARCHITECTURE)
-- ==============================================================================
-- DATA: 2025-12-01
-- AUTOR: Equipe de Engenharia
-- DESCRIÇÃO: Clona apenas configurações e alocações, mantendo entidades globais.
-- ==============================================================================

DROP FUNCTION IF EXISTS clone_schedule_scenario(UUID, TEXT, TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS clone_schedule_scenario(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION clone_schedule_scenario(
    p_original_schedule_id UUID,
    p_new_name TEXT,
    p_new_description TEXT DEFAULT NULL
)
RETURNS TABLE (
    new_schedule_id UUID,
    settings_cloned INTEGER,
    workloads_cloned INTEGER,
    availability_cloned INTEGER,
    fixed_lessons_cloned INTEGER
) AS $$
DECLARE
    v_new_schedule_id UUID;
    v_school_id UUID;
    v_settings_count INTEGER := 0;
    v_workloads_count INTEGER := 0;
    v_availability_count INTEGER := 0;
    v_fixed_lessons_count INTEGER := 0;
BEGIN
    -- 1. Validar e obter dados do cenário original
    SELECT school_id INTO v_school_id
    FROM schedules
    WHERE id = p_original_schedule_id;
    
    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'Cenário original não encontrado: %', p_original_schedule_id;
    END IF;
    
    RAISE NOTICE 'Clonando cenário % (Lightweight)...', p_original_schedule_id;
    
    -- 2. Criar novo cenário
    INSERT INTO schedules (
        name,
        description,
        is_active,
        school_id,
        created_at
    )
    SELECT
        p_new_name,
        COALESCE(p_new_description, 'Clonado de: ' || name),
        false,
        school_id,
        NOW()
    FROM schedules
    WHERE id = p_original_schedule_id
    RETURNING id INTO v_new_schedule_id;
    
    -- 3. Clonar Configurações de Professores (Settings)
    INSERT INTO scenario_teacher_settings (
        scenario_id,
        teacher_id,
        custom_workload,
        is_active
    )
    SELECT
        v_new_schedule_id,
        teacher_id,
        custom_workload,
        is_active
    FROM scenario_teacher_settings
    WHERE scenario_id = p_original_schedule_id;
    
    GET DIAGNOSTICS v_settings_count = ROW_COUNT;
    
    -- 4. Clonar Configurações de Turmas (Settings)
    INSERT INTO scenario_class_settings (
        scenario_id,
        class_id,
        turn_override,
        is_active
    )
    SELECT
        v_new_schedule_id,
        class_id,
        turn_override,
        is_active
    FROM scenario_class_settings
    WHERE scenario_id = p_original_schedule_id;
    
    -- 5. Clonar Workloads (Apontando para os mesmos IDs Globais)
    INSERT INTO workloads (
        hours,
        teacher_id,
        subject_id,
        class_id,
        school_id,
        schedule_id
    )
    SELECT
        hours,
        teacher_id,
        subject_id,
        class_id,
        school_id,
        v_new_schedule_id
    FROM workloads
    WHERE schedule_id = p_original_schedule_id;
    
    GET DIAGNOSTICS v_workloads_count = ROW_COUNT;
    
    -- 6. Clonar Teacher Availability
    INSERT INTO teacher_availability (
        teacher_id,
        day_of_week,
        time_slot_index,
        status,
        school_id,
        schedule_id
    )
    SELECT
        teacher_id,
        day_of_week,
        time_slot_index,
        status,
        school_id,
        v_new_schedule_id
    FROM teacher_availability
    WHERE schedule_id = p_original_schedule_id;
    
    GET DIAGNOSTICS v_availability_count = ROW_COUNT;
    
    -- 7. Clonar Fixed Lessons
    INSERT INTO fixed_lessons (
        school_id,
        teacher_id,
        subject_id,
        class_id,
        day_of_week,
        slot_number,
        schedule_id
    )
    SELECT
        school_id,
        teacher_id,
        subject_id,
        class_id,
        day_of_week,
        slot_number,
        v_new_schedule_id
    FROM fixed_lessons
    WHERE schedule_id = p_original_schedule_id;
    
    GET DIAGNOSTICS v_fixed_lessons_count = ROW_COUNT;
    
    RAISE NOTICE 'Clonagem concluída! Novo ID: %', v_new_schedule_id;
    
    RETURN QUERY SELECT
        v_new_schedule_id,
        v_settings_count,
        v_workloads_count,
        v_availability_count,
        v_fixed_lessons_count;
        
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao clonar cenário: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION clone_schedule_scenario TO authenticated;
