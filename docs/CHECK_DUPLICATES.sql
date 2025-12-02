-- Verificação de Duplicatas em Entidades Globais
-- Execute este script no Supabase SQL Editor

SELECT 'DUPLICATAS EM DISCIPLINAS' as check_type;
SELECT name, count(*) as qtd, array_agg(id) as ids
FROM subjects 
GROUP BY name 
HAVING count(*) > 1;

SELECT 'DUPLICATAS EM PROFESSORES' as check_type;
SELECT name, count(*) as qtd, array_agg(id) as ids
FROM teachers 
GROUP BY name 
HAVING count(*) > 1;

SELECT 'DUPLICATAS EM TURMAS' as check_type;
SELECT name, count(*) as qtd, array_agg(id) as ids
FROM classes 
GROUP BY name 
HAVING count(*) > 1;
