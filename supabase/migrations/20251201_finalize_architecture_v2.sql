-- ==============================================================================
-- FINALIZAÇÃO DA ARQUITETURA V2 (GLOBAL + CENÁRIO)
-- ==============================================================================
-- DATA: 2025-12-01
-- AUTOR: Equipe de Engenharia
-- DESCRIÇÃO: Script idempotente para garantir a estrutura final do banco.
--            Pode ser executado múltiplas vezes sem erro.
-- ==============================================================================

BEGIN;

DO $$ BEGIN RAISE NOTICE '=== INICIANDO AJUSTES ESTRUTURAIS (V2) ==='; END $$;

-- 1. LIMPEZA DE ENTIDADES GLOBAIS (Remover schedule_id)
--    Só remove se a coluna existir. Isso oficializa que essas tabelas são GLOBAIS.
DO $$ BEGIN RAISE NOTICE '1. Removendo colunas schedule_id (se existirem)...'; END $$;

ALTER TABLE teachers DROP COLUMN IF EXISTS schedule_id;
ALTER TABLE classes DROP COLUMN IF EXISTS schedule_id;
ALTER TABLE subjects DROP COLUMN IF EXISTS schedule_id;

-- 2. CORREÇÃO DE RELACIONAMENTO (Subjects -> Knowledge Areas)
DO $$ BEGIN RAISE NOTICE '2. Verificando coluna knowledge_area_id em subjects...'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'knowledge_area_id'
    ) THEN
        ALTER TABLE subjects ADD COLUMN knowledge_area_id UUID REFERENCES knowledge_areas(id);
        RAISE NOTICE '   -> Coluna knowledge_area_id criada.';
    ELSE
        RAISE NOTICE '   -> Coluna knowledge_area_id já existe.';
    END IF;
END $$;

-- 3. CRIAÇÃO DAS TABELAS DE CONFIGURAÇÃO (SETTINGS)
DO $$ BEGIN RAISE NOTICE '3. Verificando tabelas de configuração...'; END $$;

CREATE TABLE IF NOT EXISTS scenario_teacher_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    custom_workload INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Garante que um professor só tenha 1 configuração por cenário
    CONSTRAINT uq_scenario_teacher UNIQUE (scenario_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS scenario_class_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    turn_override TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Garante que uma turma só tenha 1 configuração por cenário
    CONSTRAINT uq_scenario_class UNIQUE (scenario_id, class_id)
);

-- 4. APLICAÇÃO DE ÍNDICES DE PERFORMANCE
DO $$ BEGIN RAISE NOTICE '4. Criando índices...'; END $$;

-- Índices para buscar settings rapidamente pelo cenário
CREATE INDEX IF NOT EXISTS idx_teacher_settings_scenario ON scenario_teacher_settings(scenario_id);
CREATE INDEX IF NOT EXISTS idx_class_settings_scenario ON scenario_class_settings(scenario_id);

-- 5. SUPORTE A SNAPSHOT
DO $$ BEGIN RAISE NOTICE '5. Verificando coluna snapshot_data em schedules...'; END $$;

ALTER TABLE schedules ADD COLUMN IF NOT EXISTS snapshot_data JSONB;

DO $$ BEGIN RAISE NOTICE '=== FINALIZAÇÃO CONCLUÍDA COM SUCESSO ==='; END $$;

COMMIT;
