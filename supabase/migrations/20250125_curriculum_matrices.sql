-- Migration: Create Curriculum Matrix Tables
-- Description: Tables for managing curriculum matrices (Matrizes Curriculares)

-- Table: curriculum_matrices
-- Stores the main curriculum matrix information
CREATE TABLE IF NOT EXISTS curriculum_matrices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    education_level VARCHAR(100) NOT NULL, -- 'fundamental', 'medio', 'superior'
    modality VARCHAR(100), -- 'regular', 'integral', 'eja', 'especial', 'profissional', 'ead', 'campo', 'indigena', 'quilombola'
    network VARCHAR(50), -- 'publica', 'privada'
    network_type VARCHAR(50), -- 'estadual', 'distrital', 'municipal', 'federal' (apenas se network = 'publica')
    regime VARCHAR(50) NOT NULL, -- 'anual', 'semestral', 'modular'
    total_workload INTEGER NOT NULL, -- Total carga horária (ex: 5400)
    school_days INTEGER, -- Dias letivos anuais (ex: 200)
    weekly_hours INTEGER, -- Semanas letivas anuais (ex: 40)
    daily_hours INTEGER, -- Duração da hora-aula em minutos (ex: 50)
    total_daily_hours INTEGER, -- Total de horas-aula diárias (ex: 6)
    shift VARCHAR(50), -- 'diurno', 'noturno', 'integral'
    entry_time TIME, -- Horário de entrada (ex: 07:00)
    validity_year INTEGER, -- Ano de vigência (ex: 2018)
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: curriculum_components
-- Stores the curriculum components (subjects) for each matrix
CREATE TABLE IF NOT EXISTS curriculum_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_id UUID REFERENCES curriculum_matrices(id) ON DELETE CASCADE,
    knowledge_area VARCHAR(100) NOT NULL, -- 'Linguagens', 'Matemática', 'Ciências Humanas', etc.
    component_name VARCHAR(255) NOT NULL, -- 'Língua Portuguesa', 'Matemática', etc.
    
    -- Carga horária semanal por série/ano
    weekly_hours_1st INTEGER DEFAULT 0,
    weekly_hours_2nd INTEGER DEFAULT 0,
    weekly_hours_3rd INTEGER DEFAULT 0,
    
    -- Carga horária anual por série/ano
    annual_hours_1st INTEGER DEFAULT 0,
    annual_hours_2nd INTEGER DEFAULT 0,
    annual_hours_3rd INTEGER DEFAULT 0,
    
    -- Ordem de exibição
    display_order INTEGER DEFAULT 0,
    
    -- Flags
    is_elective BOOLEAN DEFAULT FALSE, -- Disciplina eletiva
    is_diversified BOOLEAN DEFAULT FALSE, -- Parte diversificada
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_curriculum_matrices_school ON curriculum_matrices(school_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_components_matrix ON curriculum_components(matrix_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_components_area ON curriculum_components(knowledge_area);

-- Enable Row Level Security
ALTER TABLE curriculum_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_components ENABLE ROW LEVEL SECURITY;

-- RLS Policies for curriculum_matrices
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

-- RLS Policies for curriculum_components
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_curriculum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_curriculum_matrices_updated_at
    BEFORE UPDATE ON curriculum_matrices
    FOR EACH ROW
    EXECUTE FUNCTION update_curriculum_updated_at();

CREATE TRIGGER update_curriculum_components_updated_at
    BEFORE UPDATE ON curriculum_components
    FOR EACH ROW
    EXECUTE FUNCTION update_curriculum_updated_at();
