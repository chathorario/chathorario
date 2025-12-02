-- Seed: Curriculum Matrix from Tocantins School
-- Based on the image provided - Ensino Médio structure

-- Insert the main curriculum matrix
INSERT INTO curriculum_matrices (
    name,
    education_level,
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
    'anual',
    5400,
    200,
    40,
    50,
    6,
    'diurno',
    '07:00',
    2018,
    'Vigência: a partir de 2018. Turno: Diurno. Saída: 18h'
) RETURNING id;

-- Note: You'll need to get the matrix_id from the above insert to use in the components below
-- For this seed, we'll assume the matrix_id is stored in a variable

-- Insert curriculum components
-- LINGUAGENS
INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order) VALUES
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Linguagens', 'Língua Portuguesa', 6, 6, 6, 240, 240, 240, 1),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Linguagens', 'Arte', 1, 1, 1, 40, 40, 40, 2),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Linguagens', 'Educação Física', 2, 2, 2, 80, 80, 80, 3);

-- MATEMÁTICA
INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order) VALUES
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Matemática', 'Matemática', 6, 6, 6, 240, 240, 240, 4);

-- CIÊNCIAS HUMANAS
INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order) VALUES
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Ciências Humanas', 'História', 2, 2, 2, 80, 80, 80, 5),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Ciências Humanas', 'Geografia', 2, 2, 2, 80, 80, 80, 6),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Ciências Humanas', 'Filosofia', 1, 1, 1, 40, 40, 40, 7),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Ciências Humanas', 'Sociologia', 1, 1, 1, 40, 40, 40, 8);

-- CIÊNCIAS DA NATUREZA
INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order) VALUES
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Ciências da Natureza', 'Biologia', 3, 3, 3, 120, 120, 120, 9),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Ciências da Natureza', 'Física', 3, 3, 3, 120, 120, 120, 10),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Ciências da Natureza', 'Química', 3, 3, 3, 120, 120, 120, 11);

-- PARTE DIVERSIFICADA
INSERT INTO curriculum_components (matrix_id, knowledge_area, component_name, weekly_hours_1st, weekly_hours_2nd, weekly_hours_3rd, annual_hours_1st, annual_hours_2nd, annual_hours_3rd, display_order, is_diversified) VALUES
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Redação', 1, 1, 1, 40, 40, 40, 12, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'L.E.M - Inglês', 2, 2, 2, 80, 80, 80, 13, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Disciplinas Eletivas', 2, 2, 2, 80, 80, 80, 14, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Práticas Experimentais - Matemática', 1, 1, 1, 40, 40, 40, 15, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Práticas Experimentais - Biologia', 1, 1, 1, 40, 40, 40, 16, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Práticas Experimentais - Física', 1, 1, 1, 40, 40, 40, 17, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Práticas Experimentais - Química', 1, 1, 1, 40, 40, 40, 18, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Estudo Orientado', 2, 2, 2, 80, 80, 80, 19, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Preparação Pós-Médio', 2, 2, 2, 80, 80, 80, 20, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Avaliação Semanal', 2, 2, 2, 80, 80, 80, 21, TRUE),
((SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1), 'Parte Diversificada', 'Projeto de Vida', 2, 2, 2, 80, 80, 80, 22, TRUE);

-- Verify totals (should be 45 weekly hours and 1800 annual hours per grade)
SELECT 
    'Total Carga Horária Semanal' as description,
    SUM(weekly_hours_1st) as "1ª Série",
    SUM(weekly_hours_2nd) as "2ª Série",
    SUM(weekly_hours_3rd) as "3ª Série"
FROM curriculum_components
WHERE matrix_id = (SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1);

SELECT 
    'Total Carga Horária Anual' as description,
    SUM(annual_hours_1st) as "1ª Série",
    SUM(annual_hours_2nd) as "2ª Série",
    SUM(annual_hours_3rd) as "3ª Série"
FROM curriculum_components
WHERE matrix_id = (SELECT id FROM curriculum_matrices WHERE name = 'Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral' LIMIT 1);
