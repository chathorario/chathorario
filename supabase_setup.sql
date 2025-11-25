-- 1. Create table if not exists (with base columns)
CREATE TABLE IF NOT EXISTS schedule_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Concluído',
    is_validated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.1 Ensure profiles table has necessary columns (Fix for 400 Error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'school_name') THEN
        ALTER TABLE profiles ADD COLUMN school_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'responsible') THEN
        ALTER TABLE profiles ADD COLUMN responsible TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'academic_year') THEN
        ALTER TABLE profiles ADD COLUMN academic_year TEXT DEFAULT '2025';
    END IF;
END $$;

-- 2. Add new columns if they don't exist (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedule_scenarios' AND column_name = 'schedule_data') THEN
        ALTER TABLE schedule_scenarios ADD COLUMN schedule_data JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedule_scenarios' AND column_name = 'school_id') THEN
        ALTER TABLE schedule_scenarios ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Create index
CREATE INDEX IF NOT EXISTS idx_schedule_scenarios_school_id ON schedule_scenarios(school_id);

-- 4. Enable RLS
ALTER TABLE schedule_scenarios ENABLE ROW LEVEL SECURITY;

-- 5. Update Policies (Drop existing to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON schedule_scenarios;
DROP POLICY IF EXISTS "Allow all operations for anon" ON schedule_scenarios;
DROP POLICY IF EXISTS "Users can view their school's schedules" ON schedule_scenarios;
DROP POLICY IF EXISTS "Users can insert schedules for their school" ON schedule_scenarios;
DROP POLICY IF EXISTS "Users can update their school's schedules" ON schedule_scenarios;
DROP POLICY IF EXISTS "Users can delete their school's schedules" ON schedule_scenarios;

-- Create new policies
CREATE POLICY "Users can view their school's schedules" ON schedule_scenarios
    FOR SELECT
    USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert schedules for their school" ON schedule_scenarios
    FOR INSERT
    WITH CHECK (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their school's schedules" ON schedule_scenarios
    FOR UPDATE
    USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their school's schedules" ON schedule_scenarios
    FOR DELETE
    USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
