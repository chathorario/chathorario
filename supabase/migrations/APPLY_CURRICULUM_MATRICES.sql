-- ============================================
-- SCRIPT DE MIGRAÇÃO: Matrizes Curriculares
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar tabelas (se não existirem)
CREATE TABLE IF NOT EXISTS curriculum_matrices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    education_level VARCHAR(100) NOT NULL,
    modality VARCHAR(100),
    network VARCHAR(50),
    network_type VARCHAR(50),
    regime VARCHAR(50) NOT NULL,
    total_workload INTEGER NOT NULL,
    school_days INTEGER,
    weekly_hours INTEGER,
    daily_hours INTEGER,
    total_daily_hours INTEGER,
    shift VARCHAR(50),
    entry_time TIME,
    validity_year INTEGER,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curriculum_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_id UUID REFERENCES curriculum_matrices(id) ON DELETE CASCADE,
    knowledge_area VARCHAR(100) NOT NULL,
    component_name VARCHAR(255) NOT NULL,
    weekly_hours_1st INTEGER DEFAULT 0,
    weekly_hours_2nd INTEGER DEFAULT 0,
    weekly_hours_3rd INTEGER DEFAULT 0,
    annual_hours_1st INTEGER DEFAULT 0,
    annual_hours_2nd INTEGER DEFAULT 0,
    annual_hours_3rd INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_elective BOOLEAN DEFAULT FALSE,
    is_diversified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar campos se não existirem (para bancos existentes)
DO $$ 
BEGIN
    -- Adicionar modality se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'curriculum_matrices' AND column_name = 'modality'
    ) THEN
        ALTER TABLE curriculum_matrices ADD COLUMN modality VARCHAR(100);
    END IF;

    -- Adicionar network se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'curriculum_matrices' AND column_name = 'network'
    ) THEN
        ALTER TABLE curriculum_matrices ADD COLUMN network VARCHAR(50);
    END IF;

    -- Adicionar network_type se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'curriculum_matrices' AND column_name = 'network_type'
    ) THEN
        ALTER TABLE curriculum_matrices ADD COLUMN network_type VARCHAR(50);
    END IF;
END $$;

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_curriculum_matrices_school ON curriculum_matrices(school_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_components_matrix ON curriculum_components(matrix_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_components_area ON curriculum_components(knowledge_area);

-- 4. Habilitar RLS
ALTER TABLE curriculum_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_components ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view curriculum matrices from their school" ON curriculum_matrices;
DROP POLICY IF EXISTS "Staff can insert curriculum matrices" ON curriculum_matrices;
DROP POLICY IF EXISTS "Staff can update curriculum matrices" ON curriculum_matrices;
DROP POLICY IF EXISTS "Staff can delete curriculum matrices" ON curriculum_matrices;
DROP POLICY IF EXISTS "Users can view curriculum components" ON curriculum_components;
DROP POLICY IF EXISTS "Staff can insert curriculum components" ON curriculum_components;
DROP POLICY IF EXISTS "Staff can update curriculum components" ON curriculum_components;
DROP POLICY IF EXISTS "Staff can delete curriculum components" ON curriculum_components;

-- 6. Criar políticas RLS para curriculum_matrices
CREATE POLICY "Users can view curriculum matrices from their school"
    ON curriculum_matrices FOR SELECT
    USING (
        school_id IN (
            SELECT school_id FROM user_schools WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can insert curriculum matrices"
    ON curriculum_matrices FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_schools
            WHERE user_id = auth.uid()
            AND school_id = curriculum_matrices.school_id
            AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Staff can update curriculum matrices"
    ON curriculum_matrices FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_schools
            WHERE user_id = auth.uid()
            AND school_id = curriculum_matrices.school_id
            AND role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Staff can delete curriculum matrices"
    ON curriculum_matrices FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_schools
            WHERE user_id = auth.uid()
            AND school_id = curriculum_matrices.school_id
            AND role IN ('staff', 'admin')
        )
    );

-- 7. Criar políticas RLS para curriculum_components
CREATE POLICY "Users can view curriculum components"
    ON curriculum_components FOR SELECT
    USING (
        matrix_id IN (
            SELECT id FROM curriculum_matrices
            WHERE school_id IN (
                SELECT school_id FROM user_schools WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Staff can insert curriculum components"
    ON curriculum_components FOR INSERT
    WITH CHECK (
        matrix_id IN (
            SELECT cm.id FROM curriculum_matrices cm
            INNER JOIN user_schools us ON cm.school_id = us.school_id
            WHERE us.user_id = auth.uid() AND us.role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Staff can update curriculum components"
    ON curriculum_components FOR UPDATE
    USING (
        matrix_id IN (
            SELECT cm.id FROM curriculum_matrices cm
            INNER JOIN user_schools us ON cm.school_id = us.school_id
            WHERE us.user_id = auth.uid() AND us.role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Staff can delete curriculum components"
    ON curriculum_components FOR DELETE
    USING (
        matrix_id IN (
            SELECT cm.id FROM curriculum_matrices cm
            INNER JOIN user_schools us ON cm.school_id = us.school_id
            WHERE us.user_id = auth.uid() AND us.role IN ('staff', 'admin')
        )
    );

-- 8. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_curriculum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar triggers
DROP TRIGGER IF EXISTS update_curriculum_matrices_updated_at ON curriculum_matrices;
DROP TRIGGER IF EXISTS update_curriculum_components_updated_at ON curriculum_components;

CREATE TRIGGER update_curriculum_matrices_updated_at
    BEFORE UPDATE ON curriculum_matrices
    FOR EACH ROW
    EXECUTE FUNCTION update_curriculum_updated_at();

CREATE TRIGGER update_curriculum_components_updated_at
    BEFORE UPDATE ON curriculum_components
    FOR EACH ROW
    EXECUTE FUNCTION update_curriculum_updated_at();

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
-- Verifique se as tabelas foram criadas:
-- SELECT * FROM curriculum_matrices;
-- SELECT * FROM curriculum_components;
