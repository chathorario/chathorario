-- Seed: Complete Curriculum Matrix from Tocantins School Image
-- Based on: ESTRUTURA CURRICULAR PARA O ENSINO MÉDIO-CURSO MÉDIO BÁSICO EM REGIME DE TEMPO INTEGRAL

-- Insert the main curriculum matrix with modality
INSERT INTO curriculum_matrices (
    name,
    education_level,
    modality,
    regime,
    total_workload,
    school_days,
    weekly_hours,
    daily_hours,
    total_daily_hours,
    shift,
    entry_time,
    validity_year,
    observations
) VALUES (
    'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral',
    'medio',
    'integral',
    'anual',
    5400,
    200,
    40,
    50,
    6,
    'diurno',
    '07:00',
    2018,
    'Vigência: a partir de 2018. Turno: Diurno. Entrada: 7h. Saída: 18h'
);

-- Get the matrix ID for reference
DO $$
DECLARE
    v_matrix_id UUID;
BEGIN
    SELECT id INTO v_matrix_id 
    FROM curriculum_matrices 
    WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' 
    LIMIT 1;

    -- LINGUAGENS
    INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order, is_diversified) VALUES
    (v_matrix_id, 'Linguagens', 'Língua Portuguesa', 6, 6, 6, 240, 240, 240, 1, FALSE),
    (v_matrix_id, 'Linguagens', 'Arte', 1, 1, 1, 40, 40, 40, 2, FALSE),
    (v_matrix_id, 'Linguagens', 'Educação Física', 2, 2, 2, 80, 80, 80, 3, FALSE);

    -- MATEMÁTICA
    INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order, is_diversified) VALUES
    (v_matrix_id, 'Matemática', 'Matemática', 6, 6, 6, 240, 240, 240, 4, FALSE);

    -- CIÊNCIAS HUMANAS
    INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order, is_diversified) VALUES
    (v_matrix_id, 'Ciências Humanas', 'História', 2, 2, 2, 80, 80, 80, 5, FALSE),
    (v_matrix_id, 'Ciências Humanas', 'Geografia', 2, 2, 2, 80, 80, 80, 6, FALSE),
    (v_matrix_id, 'Ciências Humanas', 'Filosofia', 1, 1, 1, 40, 40, 40, 7, FALSE),
    (v_matrix_id, 'Ciências Humanas', 'Sociologia', 1, 1, 1, 40, 40, 40, 8, FALSE);

    -- CIÊNCIAS DA NATUREZA
    INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order, is_diversified) VALUES
    (v_matrix_id, 'Ciências da Natureza', 'Biologia', 3, 3, 3, 120, 120, 120, 9, FALSE),
    (v_matrix_id, 'Ciências da Natureza', 'Física', 3, 3, 3, 120, 120, 120, 10, FALSE),
    (v_matrix_id, 'Ciências da Natureza', 'Química', 3, 3, 3, 120, 120, 120, 11, FALSE);

    -- PARTE DIVERSIFICADA
    INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order, is_diversified) VALUES
    (v_matrix_id, 'Parte Diversificada', 'Redação', 1, 1, 1, 40, 40, 40, 12, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'L.E.M - Inglês', 2, 2, 2, 80, 80, 80, 13, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'Disciplinas Eletivas', 2, 2, 2, 80, 80, 80, 14, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'Práticas Experimentais - Matemática', 1, 1, 1, 40, 40, 40, 15, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'Práticas Experimentais - Biologia', 1, 1, 1, 40, 40, 40, 16, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'Práticas Experimentais - Física', 1, 1, 1, 40, 40, 40, 17, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'Práticas Experimentais - Química', 1, 1, 1, 40, 40, 40, 18, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'Estudo Orientado', 2, 2, 2, 80, 80, 80, 19, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'Preparação Pós-Médio', 2, 2, 2, 80, 80, 80, 20, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'Avaliação Semanal', 2, 2, 2, 80, 80, 80, 21, TRUE),
    (v_matrix_id, 'Parte Diversificada', 'Projeto de Vida', 2, 2, 2, 80, 80, 80, 22, TRUE);

    -- Verify totals
    RAISE NOTICE 'Matriz curricular criada com sucesso!';
    RAISE NOTICE 'Total de componentes: %', (SELECT COUNT(*) FROM curriculum_components WHERE matrix_id = v_matrix_id);
    RAISE NOTICE 'Carga horária semanal 1ª série: %', (SELECT SUM(weekly_hours_1st) FROM curriculum_components WHERE matrix_id = v_matrix_id);
    RAISE NOTICE 'Carga horária anual 1ª série: %', (SELECT SUM(annual_hours_1st) FROM curriculum_components WHERE matrix_id = v_matrix_id);
END $$;
