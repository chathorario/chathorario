-- Script para remover turmas duplicadas
-- Execute este script no SQL Editor do Supabase

-- 1. Ver turmas duplicadas (execute primeiro para verificar)
SELECT 
  name, 
  grade, 
  school_id,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as ids
FROM classes
GROUP BY name, grade, school_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Deletar duplicatas mantendo apenas a mais antiga (created_at mais antigo)
-- ATENÇÃO: Revise os resultados da query acima antes de executar esta!
DELETE FROM classes
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY name, grade, school_id 
             ORDER BY created_at ASC
           ) as row_num
    FROM classes
  ) t
  WHERE row_num > 1
);

-- 3. Verificar se ainda há duplicatas (deve retornar vazio)
SELECT 
  name, 
  grade, 
  school_id,
  COUNT(*) as count
FROM classes
GROUP BY name, grade, school_id
HAVING COUNT(*) > 1;
