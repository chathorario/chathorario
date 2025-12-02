-- =====================================================
-- FUNÇÃO: clone_schedule_scenario
-- =====================================================
-- Clona um cenário completo com remapeamento de IDs
-- Garante que todas as relações sejam preservadas
-- =====================================================

CREATE OR REPLACE FUNCTION clone_schedule_scenario(
    p_original_schedule_id UUID,
    p_new_name TEXT,
    p_new_description TEXT DEFAULT NULL,
    p_school_id UUID DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
    new_schedule_id UUID,
    teachers_cloned INTEGER,
    subjects_cloned INTEGER,
    classes_cloned INTEGER,
    workloads_cloned INTEGER,
    availability_cloned INTEGER,
    fixed_lessons_cloned INTEGER
) AS $$
DECLARE
    v_new_schedule_id UUID;
    v_school_id UUID;
    v_created_by UUID;
    v_teachers_count INTEGER := 0;
    v_subjects_count INTEGER := 0;
    v_classes_count INTEGER := 0;
    v_workloads_count INTEGER := 0;
    v_availability_count INTEGER := 0;
    v_fixed_lessons_count INTEGER := 0;
    
    -- Tabelas temporárias para mapeamento de IDs
    v_teacher_map JSONB := '{}';
    v_subject_map JSONB := '{}';
    v_class_map JSONB := '{}';
BEGIN
    -- =====================================================
    -- STEP 1: Validar cenário original
    -- =====================================================
    IF NOT EXISTS (SELECT 1 FROM schedules WHERE id = p_original_schedule_id) THEN
        RAISE EXCEPTION 'Cenário original não encontrado: %', p_original_schedule_id;
    END IF;
    
    -- Obter school_id e created_by do cenário original se não fornecidos
    SELECT 
        COALESCE(p_school_id, school_id),
        COALESCE(p_created_by, created_by)
    INTO v_school_id, v_created_by
    FROM schedules
    WHERE id = p_original_schedule_id;
    
    RAISE NOTICE 'Iniciando clonagem do cenário % para escola %', p_original_schedule_id, v_school_id;
    
    -- =====================================================
    -- STEP 2: Criar novo cenário
    -- =====================================================
    INSERT INTO schedules (
        name,
        description,
        status,
        is_validated,
        is_active,
        school_id,
        created_by,
        fitness_score,
        conflicts_count
    )
    SELECT
        p_new_name,
        COALESCE(p_new_description, 'Clonado de: ' || name),
        'Concluído',
        false,
        false,
        v_school_id,
        v_created_by,
        NULL,
        0
    FROM schedules
    WHERE id = p_original_schedule_id
    RETURNING id INTO v_new_schedule_id;
    
    RAISE NOTICE 'Novo cenário criado: %', v_new_schedule_id;
    
    -- =====================================================
    -- STEP 3: Clonar TEACHERS com mapeamento de IDs
    -- =====================================================
    WITH cloned_teachers AS (
        INSERT INTO teachers (
            name,
            school_id,
            email,
            phone,
            workload_total,
            planning_hours,
            activity_hours,
            knowledge_area,
            schedule_id
        )
        SELECT
            name,
            school_id,
            email,
            phone,
            workload_total,
            planning_hours,
            activity_hours,
            knowledge_area,
            v_new_schedule_id
        FROM teachers
        WHERE schedule_id = p_original_schedule_id
        RETURNING id, name
    ),
    original_teachers AS (
        SELECT id, name
        FROM teachers
        WHERE schedule_id = p_original_schedule_id
    )
    SELECT 
        jsonb_object_agg(ot.id::text, ct.id::text)
    INTO v_teacher_map
    FROM original_teachers ot
    JOIN cloned_teachers ct ON ot.name = ct.name;
    
    GET DIAGNOSTICS v_teachers_count = ROW_COUNT;
    RAISE NOTICE 'Professores clonados: % (Mapa: %)', v_teachers_count, v_teacher_map;
    
    -- =====================================================
    -- STEP 4: Clonar SUBJECTS com mapeamento de IDs
    -- =====================================================
    WITH cloned_subjects AS (
        INSERT INTO subjects (
            name,
            code,
            aulas_por_turma,
            knowledge_area_id,
            school_id,
            description,
            schedule_id
        )
        SELECT
            name,
            code,
            '{}', -- Será remapeado depois
            knowledge_area_id,
            school_id,
            description,
            v_new_schedule_id
        FROM subjects
        WHERE schedule_id = p_original_schedule_id
        RETURNING id, name
    ),
    original_subjects AS (
        SELECT id, name
        FROM subjects
        WHERE schedule_id = p_original_schedule_id
    )
    SELECT 
        jsonb_object_agg(os.id::text, cs.id::text)
    INTO v_subject_map
    FROM original_subjects os
    JOIN cloned_subjects cs ON os.name = cs.name;
    
    GET DIAGNOSTICS v_subjects_count = ROW_COUNT;
    RAISE NOTICE 'Disciplinas clonadas: % (Mapa: %)', v_subjects_count, v_subject_map;
    
    -- =====================================================
    -- STEP 5: Clonar CLASSES com mapeamento de IDs
    -- =====================================================
    WITH cloned_classes AS (
        INSERT INTO classes (
            name,
            grade,
            shift,
            school_id,
            aulas_diarias,
            total_students,
            classroom,
            schedule_id
        )
        SELECT
            name,
            grade,
            shift,
            school_id,
            aulas_diarias,
            total_students,
            classroom,
            v_new_schedule_id
        FROM classes
        WHERE schedule_id = p_original_schedule_id
        RETURNING id, name
    ),
    original_classes AS (
        SELECT id, name
        FROM classes
        WHERE schedule_id = p_original_schedule_id
    )
    SELECT 
        jsonb_object_agg(oc.id::text, cc.id::text)
    INTO v_class_map
    FROM original_classes oc
    JOIN cloned_classes cc ON oc.name = cc.name;
    
    GET DIAGNOSTICS v_classes_count = ROW_COUNT;
    RAISE NOTICE 'Turmas clonadas: % (Mapa: %)', v_classes_count, v_class_map;
    
    -- =====================================================
    -- STEP 6: Atualizar aulas_por_turma em SUBJECTS
    -- =====================================================
    -- Remapear os IDs de turmas no JSONB aulas_por_turma
    UPDATE subjects s
    SET aulas_por_turma = (
        SELECT jsonb_object_agg(
            (v_class_map->>key)::text,
            value::integer
        )
        FROM jsonb_each_text(os.aulas_por_turma)
        WHERE v_class_map ? key
    )
    FROM subjects os
    WHERE s.schedule_id = v_new_schedule_id
    AND os.schedule_id = p_original_schedule_id
    AND s.name = os.name
    AND os.aulas_por_turma IS NOT NULL
    AND jsonb_typeof(os.aulas_por_turma) = 'object';
    
    RAISE NOTICE 'aulas_por_turma remapeado para novas turmas';
    
    -- =====================================================
    -- STEP 7: Clonar WORKLOADS com IDs remapeados
    -- =====================================================
    INSERT INTO workloads (
        hours,
        teacher_id,
        subject_id,
        class_id,
        school_id,
        schedule_id
    )
    SELECT
        w.hours,
        (v_teacher_map->>w.teacher_id::text)::uuid,
        (v_subject_map->>w.subject_id::text)::uuid,
        (v_class_map->>w.class_id::text)::uuid,
        w.school_id,
        v_new_schedule_id
    FROM workloads w
    WHERE w.schedule_id = p_original_schedule_id
    AND v_teacher_map ? w.teacher_id::text
    AND v_subject_map ? w.subject_id::text
    AND v_class_map ? w.class_id::text;
    
    GET DIAGNOSTICS v_workloads_count = ROW_COUNT;
    RAISE NOTICE 'Workloads clonados: %', v_workloads_count;
    
    -- =====================================================
    -- STEP 8: Clonar TEACHER_AVAILABILITY com IDs remapeados
    -- =====================================================
    INSERT INTO teacher_availability (
        teacher_id,
        day_of_week,
        time_slot_index,
        status,
        school_id,
        schedule_id
    )
    SELECT
        (v_teacher_map->>ta.teacher_id::text)::uuid,
        ta.day_of_week,
        ta.time_slot_index,
        ta.status,
        ta.school_id,
        v_new_schedule_id
    FROM teacher_availability ta
    WHERE ta.schedule_id = p_original_schedule_id
    AND v_teacher_map ? ta.teacher_id::text;
    
    GET DIAGNOSTICS v_availability_count = ROW_COUNT;
    RAISE NOTICE 'Disponibilidades clonadas: %', v_availability_count;
    
    -- =====================================================
    -- STEP 9: Clonar FIXED_LESSONS com IDs remapeados
    -- =====================================================
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
        fl.school_id,
        (v_teacher_map->>fl.teacher_id::text)::uuid,
        (v_subject_map->>fl.subject_id::text)::uuid,
        (v_class_map->>fl.class_id::text)::uuid,
        fl.day_of_week,
        fl.slot_number,
        v_new_schedule_id
    FROM fixed_lessons fl
    WHERE fl.schedule_id = p_original_schedule_id
    AND v_teacher_map ? fl.teacher_id::text
    AND v_subject_map ? fl.subject_id::text
    AND v_class_map ? fl.class_id::text;
    
    GET DIAGNOSTICS v_fixed_lessons_count = ROW_COUNT;
    RAISE NOTICE 'Aulas fixas clonadas: %', v_fixed_lessons_count;
    
    -- =====================================================
    -- STEP 10: Retornar resultado
    -- =====================================================
    RETURN QUERY SELECT
        v_new_schedule_id,
        v_teachers_count,
        v_subjects_count,
        v_classes_count,
        v_workloads_count,
        v_availability_count,
        v_fixed_lessons_count;
        
    RAISE NOTICE 'Clonagem concluída com sucesso!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao clonar cenário: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIO DA FUNÇÃO
-- =====================================================
COMMENT ON FUNCTION clone_schedule_scenario IS 
'Clona um cenário completo incluindo professores, disciplinas, turmas, 
alocações, disponibilidades e aulas fixas. Todos os IDs são remapeados 
para garantir isolamento completo entre cenários.

Parâmetros:
- p_original_schedule_id: ID do cenário a ser clonado
- p_new_name: Nome do novo cenário
- p_new_description: Descrição (opcional)
- p_school_id: ID da escola (opcional, usa do original)
- p_created_by: ID do usuário criador (opcional, usa do original)

Retorna:
- new_schedule_id: ID do novo cenário criado
- teachers_cloned: Quantidade de professores clonados
- subjects_cloned: Quantidade de disciplinas clonadas
- classes_cloned: Quantidade de turmas clonadas
- workloads_cloned: Quantidade de alocações clonadas
- availability_cloned: Quantidade de disponibilidades clonadas
- fixed_lessons_cloned: Quantidade de aulas fixas clonadas

Exemplo de uso:
SELECT * FROM clone_schedule_scenario(
    ''uuid-do-cenario-original'',
    ''Meu Novo Cenário'',
    ''Descrição opcional''
);';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Permitir que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION clone_schedule_scenario TO authenticated;
