-- Remove a política de UPDATE antiga e defeituosa da tabela 'subjects'
DROP POLICY IF EXISTS "Enable update for users based on school_id" ON public.subjects;

-- Cria uma nova política de UPDATE que verifica corretamente o school_id do usuário
CREATE POLICY "Enable update for users based on school_id"
ON public.subjects
FOR UPDATE
USING (true)
WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
