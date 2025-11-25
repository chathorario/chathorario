-- Add schedule_data column to store the complete schedule JSON
ALTER TABLE schedule_scenarios 
ADD COLUMN IF NOT EXISTS schedule_data JSONB;

-- Add school_id for multi-tenancy
ALTER TABLE schedule_scenarios 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_schedule_scenarios_school_id 
ON schedule_scenarios(school_id);

-- Update RLS policies to filter by school_id
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON schedule_scenarios;
DROP POLICY IF EXISTS "Allow all operations for anon" ON schedule_scenarios;

CREATE POLICY "Users can view their school's schedules" ON schedule_scenarios
    FOR SELECT
    USING (
        school_id IN (
            SELECT school_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert schedules for their school" ON schedule_scenarios
    FOR INSERT
    WITH CHECK (
        school_id IN (
            SELECT school_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their school's schedules" ON schedule_scenarios
    FOR UPDATE
    USING (
        school_id IN (
            SELECT school_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their school's schedules" ON schedule_scenarios
    FOR DELETE
    USING (
        school_id IN (
            SELECT school_id FROM profiles WHERE id = auth.uid()
        )
    );
