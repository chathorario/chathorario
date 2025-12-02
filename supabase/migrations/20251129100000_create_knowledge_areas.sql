-- Create knowledge_areas table
CREATE TABLE IF NOT EXISTS knowledge_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6', -- Default blue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE knowledge_areas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view knowledge areas from their school" ON knowledge_areas
    FOR SELECT
    USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert knowledge areas for their school" ON knowledge_areas
    FOR INSERT
    WITH CHECK (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update knowledge areas from their school" ON knowledge_areas
    FOR UPDATE
    USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete knowledge areas from their school" ON knowledge_areas
    FOR DELETE
    USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- Add knowledge_area_id to subjects
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS knowledge_area_id UUID REFERENCES knowledge_areas(id) ON DELETE SET NULL;
