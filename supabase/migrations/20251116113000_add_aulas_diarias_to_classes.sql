-- Adiciona a coluna para armazenar a quantidade de aulas diárias para cada turma.
-- Definir um valor padrão (DEFAULT 5) é importante para garantir que as turmas existentes
-- continuem funcionando sem a necessidade de atualização manual.

ALTER TABLE public.classes
ADD COLUMN aulas_diarias INTEGER NOT NULL DEFAULT 5;
