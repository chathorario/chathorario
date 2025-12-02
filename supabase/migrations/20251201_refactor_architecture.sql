-- ==============================================================================
-- MIGRAÇÃO DE ARQUITETURA: DEEP CLONE -> LAYERED ARCHITECTURE (GLOBAL VS SCENARIO)
-- ==============================================================================
-- DATA: 2025-12-01
-- AUTOR: Equipe de Engenharia
-- DESCRIÇÃO: Refatora o banco para entidades globais e configurações contextuais.
-- ==============================================================================

BEGIN; -- Iniciar Transação (Tudo ou Nada)

-- 1. BACKUP DE SEGURANÇA (Just in case)
CREATE TABLE IF NOT EXISTS teachers_backup_20251201 AS SELECT * FROM teachers;
CREATE TABLE IF NOT EXISTS subjects_backup_20251201 AS SELECT * FROM subjects;
CREATE TABLE IF NOT EXISTS classes_backup_20251201 AS SELECT * FROM classes;
CREATE TABLE IF NOT EXISTS workloads_backup_20251201 AS SELECT * FROM workloads;

DO $$ BEGIN RAISE NOTICE 'Backups criados com sucesso.'; END $$;

-- 2. CRIAR TABELAS DE CONFIGURAÇÃO CONTEXTUAL
CREATE TABLE IF NOT EXISTS scenario_teacher_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    custom_workload INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scenario_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS scenario_class_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    turn_override TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scenario_id, class_id)
);

-- Adicionar coluna de snapshot na tabela de cenários
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS snapshot_data JSONB;

DO $$ BEGIN RAISE NOTICE 'Novas tabelas criadas.'; END $$;

-- 3. NORMALIZAÇÃO DE PROFESSORES (TEACHERS)
-- Estratégia: Para cada escola e nome de professor, manter o registro mais recente como "Global"
-- e remapear todos os outros para ele.

DO $$
DECLARE
    r RECORD;
    global_id UUID;
BEGIN
    RAISE NOTICE 'Iniciando normalização de Professores...';
    
    -- Para cada par (escola, nome) que tem duplicatas
    FOR r IN 
        SELECT school_id, name, COUNT(*) 
        FROM teachers 
        GROUP BY school_id, name 
        HAVING COUNT(*) > 0
    LOOP
        -- 1. Eleger o "Global ID" (o mais recente criado, ou qualquer um se datas iguais)
        SELECT id INTO global_id
        FROM teachers
        WHERE school_id = r.school_id AND name = r.name
        ORDER BY created_at DESC, id ASC
        LIMIT 1;

        -- 2. Criar Settings para cada cenário onde esse professor existia
        INSERT INTO scenario_teacher_settings (scenario_id, teacher_id, custom_workload, is_active)
        SELECT 
            t.schedule_id, 
            global_id, 
            t.workload_total, 
            true
        FROM teachers t
        WHERE t.school_id = r.school_id 
        AND t.name = r.name 
        AND t.schedule_id IS NOT NULL
        AND t.id != global_id -- Não precisa criar para o próprio global se ele já tiver schedule_id (trataremos depois)
        ON CONFLICT (scenario_id, teacher_id) DO NOTHING;
        
        -- Se o próprio global_id tinha um schedule_id, criar setting para ele também
        INSERT INTO scenario_teacher_settings (scenario_id, teacher_id, custom_workload, is_active)
        SELECT 
            schedule_id, 
            global_id, 
            workload_total, 
            true
        FROM teachers
        WHERE id = global_id AND schedule_id IS NOT NULL
        ON CONFLICT (scenario_id, teacher_id) DO NOTHING;

        -- 3. Remapear Workloads para o Global ID
        UPDATE workloads 
        SET teacher_id = global_id 
        WHERE teacher_id IN (
            SELECT id FROM teachers WHERE school_id = r.school_id AND name = r.name AND id != global_id
        );

        -- 4. Remapear Availability para o Global ID
        -- Nota: Availability tem unique constraint (teacher_id, day, slot). Pode dar conflito se merging.
        -- Vamos deletar duplicatas de availability antes de update ou usar ON CONFLICT se fosse insert.
        -- Como é UPDATE, vamos deletar as availabilities dos "antigos" se já existir no "novo".
        DELETE FROM teacher_availability
        WHERE teacher_id IN (
            SELECT id FROM teachers WHERE school_id = r.school_id AND name = r.name AND id != global_id
        )
        AND (day_of_week, time_slot_index) IN (
            SELECT day_of_week, time_slot_index FROM teacher_availability WHERE teacher_id = global_id
        );
        
        UPDATE teacher_availability
        SET teacher_id = global_id
        WHERE teacher_id IN (
            SELECT id FROM teachers WHERE school_id = r.school_id AND name = r.name AND id != global_id
        );

        -- 5. Remapear Fixed Lessons
        UPDATE fixed_lessons
        SET teacher_id = global_id
        WHERE teacher_id IN (
            SELECT id FROM teachers WHERE school_id = r.school_id AND name = r.name AND id != global_id
        );

        -- 6. Deletar os professores duplicados (exceto o global)
        DELETE FROM teachers 
        WHERE school_id = r.school_id 
        AND name = r.name 
        AND id != global_id;

        -- 7. Limpar schedule_id do Global (tornando-o oficialmente Global)
        UPDATE teachers SET schedule_id = NULL WHERE id = global_id;
        
    END LOOP;
END $$;

-- 4. NORMALIZAÇÃO DE DISCIPLINAS (SUBJECTS)
DO $$
DECLARE
    r RECORD;
    global_id UUID;
BEGIN
    RAISE NOTICE 'Iniciando normalização de Disciplinas...';
    
    FOR r IN 
        SELECT school_id, name, COUNT(*) 
        FROM subjects 
        GROUP BY school_id, name 
        HAVING COUNT(*) > 0
    LOOP
        SELECT id INTO global_id
        FROM subjects
        WHERE school_id = r.school_id AND name = r.name
        ORDER BY created_at DESC, id ASC
        LIMIT 1;

        -- Remapear Workloads
        UPDATE workloads 
        SET subject_id = global_id 
        WHERE subject_id IN (
            SELECT id FROM subjects WHERE school_id = r.school_id AND name = r.name AND id != global_id
        );

        -- Remapear Fixed Lessons
        UPDATE fixed_lessons
        SET subject_id = global_id
        WHERE subject_id IN (
            SELECT id FROM subjects WHERE school_id = r.school_id AND name = r.name AND id != global_id
        );

        -- Deletar duplicatas
        DELETE FROM subjects 
        WHERE school_id = r.school_id 
        AND name = r.name 
        AND id != global_id;

        -- Tornar Global
        UPDATE subjects SET schedule_id = NULL WHERE id = global_id;
    END LOOP;
END $$;

-- 5. NORMALIZAÇÃO DE TURMAS (CLASSES)
DO $$
DECLARE
    r RECORD;
    global_id UUID;
BEGIN
    RAISE NOTICE 'Iniciando normalização de Turmas...';
    
    FOR r IN 
        SELECT school_id, name, COUNT(*) 
        FROM classes 
        GROUP BY school_id, name 
        HAVING COUNT(*) > 0
    LOOP
        SELECT id INTO global_id
        FROM classes
        WHERE school_id = r.school_id AND name = r.name
        ORDER BY created_at DESC, id ASC
        LIMIT 1;

        -- Criar Settings
        INSERT INTO scenario_class_settings (scenario_id, class_id, turn_override, is_active)
        SELECT 
            t.schedule_id, 
            global_id, 
            t.shift, 
            true
        FROM classes t
        WHERE t.school_id = r.school_id 
        AND t.name = r.name 
        AND t.schedule_id IS NOT NULL
        AND t.id != global_id
        ON CONFLICT (scenario_id, class_id) DO NOTHING;
        
        INSERT INTO scenario_class_settings (scenario_id, class_id, turn_override, is_active)
        SELECT 
            schedule_id, 
            global_id, 
            shift, 
            true
        FROM classes
        WHERE id = global_id AND schedule_id IS NOT NULL
        ON CONFLICT (scenario_id, class_id) DO NOTHING;

        -- Remapear Workloads
        UPDATE workloads 
        SET class_id = global_id 
        WHERE class_id IN (
            SELECT id FROM classes WHERE school_id = r.school_id AND name = r.name AND id != global_id
        );

        -- Remapear Fixed Lessons
        UPDATE fixed_lessons
        SET class_id = global_id
        WHERE class_id IN (
            SELECT id FROM classes WHERE school_id = r.school_id AND name = r.name AND id != global_id
        );

        -- Deletar duplicatas
        DELETE FROM classes 
        WHERE school_id = r.school_id 
        AND name = r.name 
        AND id != global_id;

        -- Tornar Global
        UPDATE classes SET schedule_id = NULL WHERE id = global_id;
    END LOOP;
END $$;

-- 6. LIMPEZA FINAL DE SCHEMA
-- Remover colunas schedule_id das tabelas globais (agora que tudo foi migrado)
-- Nota: Comentado por segurança, execute manualmente após verificar integridade
-- ALTER TABLE teachers DROP COLUMN schedule_id;
-- ALTER TABLE subjects DROP COLUMN schedule_id;
-- ALTER TABLE classes DROP COLUMN schedule_id;

DO $$ BEGIN RAISE NOTICE 'Migração concluída com sucesso!'; END $$;

COMMIT;
