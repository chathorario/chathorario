-- Migration to update subjects table schema
-- Replace workload column with aulas_por_turma (JSONB)

-- Step 1: Add new column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'aulas_por_turma'
    ) THEN
        ALTER TABLE subjects ADD COLUMN aulas_por_turma JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Step 2: Drop old workload column if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'workload'
    ) THEN
        ALTER TABLE subjects DROP COLUMN workload;
    END IF;
END $$;

-- Step 3: Update RLS policies if needed (optional, adjust as necessary)
-- This ensures the new column is accessible with the same permissions
COMMENT ON COLUMN subjects.aulas_por_turma IS 'JSON object mapping class_id to weekly hours for each class';
