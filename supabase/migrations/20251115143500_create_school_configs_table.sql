CREATE TABLE school_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modalidade TEXT,
    turno TEXT,
    horario_inicio TEXT,
    duracao_aula TEXT,
    intervalos JSONB,
    UNIQUE(school_id)
);

ALTER TABLE school_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow staff to read their own school configs"
ON school_configs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.school_id = school_configs.school_id AND profiles.role IN ('staff', 'admin')
  )
);

CREATE POLICY "Allow staff to insert their own school configs"
ON school_configs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.school_id = school_configs.school_id AND profiles.role IN ('staff', 'admin')
  )
);

CREATE POLICY "Allow staff to update their own school configs"
ON school_configs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.school_id = school_configs.school_id AND profiles.role IN ('staff', 'admin')
  )
);
