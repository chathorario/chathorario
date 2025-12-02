-- ==============================================================================
-- FUNÇÃO DE SNAPSHOT (CONGELAMENTO DE CENÁRIO)
-- ==============================================================================
-- DATA: 2025-12-01
-- AUTOR: Especialista em Backend e Banco de Dados
-- DESCRIÇÃO: Função para gerar um JSON estático contendo todos os dados legíveis
--            de um cenário no momento da finalização/publicação.
--            Este snapshot preserva nomes literais (não IDs) para auditoria jurídica.
-- ==============================================================================

-- ==============================================================================
-- FUNÇÃO: generate_schedule_snapshot
-- ==============================================================================
-- Gera um snapshot completo de um cenário de horário
-- 
-- PARÂMETROS:
--   p_schedule_id UUID - ID do cenário (schedule) a ser congelado
--
-- RETORNO:
--   JSONB - Objeto JSON contendo:
--     - frozen_at: timestamp ISO do momento do congelamento
--     - stats: estatísticas agregadas (total_classes, total_teachers)
--     - allocations_dump: array de alocações desnormalizadas com nomes literais
--
-- EXEMPLO DE USO:
--   SELECT generate_schedule_snapshot('uuid-do-cenario');
--
-- ==============================================================================

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
BEGIN
    -- Capturar o timestamp atual
    v_frozen_at := NOW();
    
    -- Calcular estatísticas agregadas
    -- Total de turmas únicas neste cenário
    SELECT COUNT(DISTINCT w.class_id)
    INTO v_total_classes
    FROM workloads w
    WHERE w.school_id IN (
        SELECT school_id FROM schedules WHERE id = p_schedule_id
    );
    
    -- Total de professores únicos neste cenário
    SELECT COUNT(DISTINCT w.teacher_id)
    INTO v_total_teachers
    FROM workloads w
    WHERE w.school_id IN (
        SELECT school_id FROM schedules WHERE id = p_schedule_id
    );
    
    -- Construir o dump de alocações com nomes literais (desnormalização)
    -- Isso preserva os nomes atuais mesmo se forem alterados no futuro
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
    WHERE w.school_id IN (
        SELECT school_id FROM schedules WHERE id = p_schedule_id
    );
    
    -- Se não houver alocações, retornar array vazio ao invés de NULL
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

-- ==============================================================================
-- FUNÇÃO: freeze_schedule_snapshot
-- ==============================================================================
-- Gera e salva o snapshot na coluna snapshot_data da tabela schedules
-- 
-- PARÂMETROS:
--   p_schedule_id UUID - ID do cenário a ser congelado
--
-- RETORNO:
--   BOOLEAN - true se o snapshot foi gerado e salvo com sucesso
--
-- EXEMPLO DE USO:
--   SELECT freeze_schedule_snapshot('uuid-do-cenario');
--
-- ==============================================================================

CREATE OR REPLACE FUNCTION freeze_schedule_snapshot(p_schedule_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_snapshot JSONB;
BEGIN
    -- Verificar se o cenário existe
    IF NOT EXISTS (SELECT 1 FROM schedules WHERE id = p_schedule_id) THEN
        RAISE EXCEPTION 'Cenário com ID % não encontrado', p_schedule_id;
    END IF;
    
    -- Gerar o snapshot
    v_snapshot := generate_schedule_snapshot(p_schedule_id);
    
    -- Salvar o snapshot na coluna snapshot_data
    UPDATE schedules
    SET snapshot_data = v_snapshot,
        updated_at = NOW()
    WHERE id = p_schedule_id;
    
    -- Registrar no log de auditoria (se a tabela existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO audit_logs (
            user_id,
            school_id,
            action,
            entity_type,
            entity_id,
            new_values
        )
        SELECT 
            auth.uid(),
            s.school_id,
            'SNAPSHOT_CREATED',
            'schedule',
            p_schedule_id,
            jsonb_build_object('snapshot_size', jsonb_array_length(v_snapshot->'allocations_dump'))
        FROM schedules s
        WHERE s.id = p_schedule_id;
    END IF;
    
    RETURN true;
END;
$$;

-- ==============================================================================
-- TRIGGER AUTOMÁTICO (OPCIONAL)
-- ==============================================================================
-- Cria um trigger que gera automaticamente o snapshot quando o status
-- do cenário muda para 'Publicado' ou 'Finalizado'
-- 
-- NOTA: Este trigger está comentado por padrão. Descomente se desejar
--       que o snapshot seja gerado automaticamente.
-- ==============================================================================

/*
CREATE OR REPLACE FUNCTION auto_freeze_schedule_on_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar se o status mudou para 'Publicado' ou 'Finalizado'
    IF (NEW.status IN ('Publicado', 'Finalizado', 'Concluído')) 
       AND (OLD.status IS NULL OR OLD.status != NEW.status)
       AND NEW.snapshot_data IS NULL THEN
        
        -- Gerar o snapshot automaticamente
        NEW.snapshot_data := generate_schedule_snapshot(NEW.id);
        
        RAISE NOTICE 'Snapshot gerado automaticamente para cenário %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_auto_freeze_schedule ON schedules;
CREATE TRIGGER trigger_auto_freeze_schedule
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION auto_freeze_schedule_on_publish();
*/

-- ==============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ==============================================================================

COMMENT ON FUNCTION generate_schedule_snapshot(UUID) IS 
'Gera um snapshot JSON contendo todos os dados legíveis de um cenário no momento atual. Preserva nomes literais para auditoria jurídica.';

COMMENT ON FUNCTION freeze_schedule_snapshot(UUID) IS 
'Gera e salva o snapshot na coluna snapshot_data da tabela schedules. Retorna true se bem-sucedido.';

-- ==============================================================================
-- EXEMPLOS DE USO
-- ==============================================================================

-- 1. Gerar snapshot sem salvar (apenas visualizar):
--    SELECT generate_schedule_snapshot('uuid-do-cenario');

-- 2. Gerar e salvar snapshot:
--    SELECT freeze_schedule_snapshot('uuid-do-cenario');

-- 3. Consultar snapshot salvo:
--    SELECT snapshot_data FROM schedules WHERE id = 'uuid-do-cenario';

-- 4. Consultar apenas estatísticas do snapshot:
--    SELECT snapshot_data->'stats' FROM schedules WHERE id = 'uuid-do-cenario';

-- 5. Consultar alocações do snapshot:
--    SELECT jsonb_pretty(snapshot_data->'allocations_dump') 
--    FROM schedules WHERE id = 'uuid-do-cenario';

-- ==============================================================================
-- FIM DO SCRIPT
-- ==============================================================================
