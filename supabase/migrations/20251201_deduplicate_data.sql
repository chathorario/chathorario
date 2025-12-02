-- ==============================================================================
-- SCRIPT DE DEDUPLICAÇÃO E LIMPEZA DE DADOS (SANITIZAÇÃO)
-- ==============================================================================
-- Este script identifica e funde registros duplicados em teachers, classes e subjects.
-- Critério de duplicidade: Nome (case insensitive, trim).
-- Ação: Mantém o registro mais antigo (ou com mais vínculos) e move as referências.
-- ==============================================================================

BEGIN;

DO $$ BEGIN RAISE NOTICE '=== INICIANDO PROCESSO DE DEDUPLICAÇÃO ==='; END $$;

-- FUNÇÃO AUXILIAR PARA DEDUPLICAR UMA TABELA
CREATE OR REPLACE FUNCTION deduplicate_table(table_name text, fk_column text) RETURNS void AS $$
DECLARE
    r RECORD;
    survivor_id UUID;
    duplicate_ids UUID[];
BEGIN
    FOR r IN 
        EXECUTE format('
            SELECT lower(trim(name)) as clean_name, array_agg(id ORDER BY created_at ASC) as ids
            FROM %I
            GROUP BY lower(trim(name))
            HAVING count(*) > 1
        ', table_name)
    LOOP
        -- O primeiro ID é o sobrevivente (mais antigo)
        survivor_id := r.ids[1];
        duplicate_ids := r.ids[2:array_length(r.ids, 1)];
        
        RAISE NOTICE 'Deduplicando "%": Mantendo % e removendo %', r.clean_name, survivor_id, duplicate_ids;

        -- 1. Atualizar WORKLOADS
        UPDATE workloads 
        SET teacher_id = survivor_id 
        WHERE teacher_id = ANY(duplicate_ids) AND table_name = 'teachers';

        UPDATE workloads 
        SET class_id = survivor_id 
        WHERE class_id = ANY(duplicate_ids) AND table_name = 'classes';

        UPDATE workloads 
        SET subject_id = survivor_id 
        WHERE subject_id = ANY(duplicate_ids) AND table_name = 'subjects';

        -- 2. Atualizar FIXED_LESSONS
        UPDATE fixed_lessons 
        SET teacher_id = survivor_id 
        WHERE teacher_id = ANY(duplicate_ids) AND table_name = 'teachers';

        UPDATE fixed_lessons 
        SET class_id = survivor_id 
        WHERE class_id = ANY(duplicate_ids) AND table_name = 'classes';

        UPDATE fixed_lessons 
        SET subject_id = survivor_id 
        WHERE subject_id = ANY(duplicate_ids) AND table_name = 'subjects';

        -- 3. Atualizar SETTINGS (Scenario Settings)
        IF table_name = 'teachers' THEN
            -- Cuidado com conflito de unique constraint. Se já existe config para o survivor, deletamos a do duplicate.
            DELETE FROM scenario_teacher_settings 
            WHERE teacher_id = ANY(duplicate_ids) 
            AND scenario_id IN (SELECT scenario_id FROM scenario_teacher_settings WHERE teacher_id = survivor_id);

            -- Se não existe conflito, movemos.
            UPDATE scenario_teacher_settings 
            SET teacher_id = survivor_id 
            WHERE teacher_id = ANY(duplicate_ids);
        END IF;

        IF table_name = 'classes' THEN
            DELETE FROM scenario_class_settings 
            WHERE class_id = ANY(duplicate_ids) 
            AND scenario_id IN (SELECT scenario_id FROM scenario_class_settings WHERE class_id = survivor_id);

            UPDATE scenario_class_settings 
            SET class_id = survivor_id 
            WHERE class_id = ANY(duplicate_ids);
        END IF;

        -- 4. Deletar os duplicados
        EXECUTE format('DELETE FROM %I WHERE id = ANY($1)', table_name) USING duplicate_ids;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar para cada tabela
DO $$ BEGIN RAISE NOTICE '--- Processando DISCIPLINAS ---'; END $$;
SELECT deduplicate_table('subjects', 'subject_id');

DO $$ BEGIN RAISE NOTICE '--- Processando PROFESSORES ---'; END $$;
SELECT deduplicate_table('teachers', 'teacher_id');

DO $$ BEGIN RAISE NOTICE '--- Processando TURMAS ---'; END $$;
SELECT deduplicate_table('classes', 'class_id');

-- Limpar a função auxiliar
DROP FUNCTION deduplicate_table;

DO $$ BEGIN RAISE NOTICE '=== DEDUPLICAÇÃO CONCLUÍDA ==='; END $$;

COMMIT;
