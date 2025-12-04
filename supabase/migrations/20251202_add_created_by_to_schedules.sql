-- Migration: Create schedules table if not exists
-- Description: Creates the schedules table for managing multiple schedule scenarios

DO $$
BEGIN
    -- Create schedules table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schedules') THEN
        CREATE TABLE schedules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT false,
            created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            schedule_data JSONB,
            snapshot_data JSONB,
            fitness_score DECIMAL(5,2),
            conflicts_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Rascunho',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX idx_schedules_school_id ON schedules(school_id);
        CREATE INDEX idx_schedules_is_active ON schedules(is_active);
        CREATE INDEX idx_schedules_created_by ON schedules(created_by);

        -- Enable RLS
        ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Users can view their school schedules" ON schedules
            FOR SELECT USING (
                school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
                EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
            );

        CREATE POLICY "Users can manage their school schedules" ON schedules
            FOR ALL USING (
                school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
                EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
            );

        -- Create trigger for updated_at
        CREATE TRIGGER update_schedules_updated_at
            BEFORE UPDATE ON schedules
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Table schedules created successfully';
    ELSE
        -- Table exists, just add created_by column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedules' AND column_name = 'created_by'
        ) THEN
            ALTER TABLE schedules ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
            RAISE NOTICE 'Column created_by added to schedules table';
        ELSE
            RAISE NOTICE 'Table schedules and column created_by already exist';
        END IF;
    END IF;
END $$;
