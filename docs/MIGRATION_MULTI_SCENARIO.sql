-- MIGRATION: Multi-Scenario Architecture
-- Description: Introduces the 'schedules' table and links workloads and fixed_lessons to it.
-- Includes data migration for existing records and a cloning function.

-- 1. Create Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL, -- References schools(id) if exists, otherwise just UUID
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for schedules (assuming standard RLS setup)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedules for their school" ON schedules
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM profiles WHERE school_id = schedules.school_id
  ));

CREATE POLICY "Users can insert schedules for their school" ON schedules
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE school_id = schedules.school_id
  ));

CREATE POLICY "Users can update schedules for their school" ON schedules
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM profiles WHERE school_id = schedules.school_id
  ));

CREATE POLICY "Users can delete schedules for their school" ON schedules
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM profiles WHERE school_id = schedules.school_id
  ));

-- 2. Add schedule_id to Workloads (Allocations)
ALTER TABLE workloads 
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE;

-- 3. Add schedule_id to Fixed Lessons
ALTER TABLE fixed_lessons 
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE;

-- 4. DATA MIGRATION: Handle Orphan Records
-- This block finds schools that have workloads or fixed_lessons without a schedule_id
-- and creates a default "Cenário Original" for them.

DO $$
DECLARE
  school_rec RECORD;
  new_schedule_id UUID;
BEGIN
  -- Iterate over distinct schools found in workloads or fixed_lessons that have NULL schedule_id
  FOR school_rec IN 
    SELECT DISTINCT school_id FROM workloads WHERE schedule_id IS NULL
    UNION
    SELECT DISTINCT school_id FROM fixed_lessons WHERE schedule_id IS NULL
  LOOP
    -- Create a new default schedule for this school
    INSERT INTO schedules (school_id, name, description, is_active)
    VALUES (school_rec.school_id, 'Cenário Original', 'Migrado automaticamente dos dados existentes.', true)
    RETURNING id INTO new_schedule_id;

    RAISE NOTICE 'Created migration schedule % for school %', new_schedule_id, school_rec.school_id;

    -- Update Workloads
    UPDATE workloads 
    SET schedule_id = new_schedule_id 
    WHERE school_id = school_rec.school_id AND schedule_id IS NULL;

    -- Update Fixed Lessons
    UPDATE fixed_lessons 
    SET schedule_id = new_schedule_id 
    WHERE school_id = school_rec.school_id AND schedule_id IS NULL;
    
  END LOOP;
END $$;

-- 5. RPC Function: Clone Schedule
-- This function allows deep cloning of a scenario (Allocations + Fixed Lessons)
CREATE OR REPLACE FUNCTION clone_schedule(
  original_schedule_id UUID,
  new_name TEXT,
  new_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_schedule_id UUID;
  origin_school_id UUID;
BEGIN
  -- Get school_id from original
  SELECT school_id INTO origin_school_id FROM schedules WHERE id = original_schedule_id;
  
  IF origin_school_id IS NULL THEN
    RAISE EXCEPTION 'Original schedule not found';
  END IF;

  -- Create new schedule
  INSERT INTO schedules (school_id, name, description, is_active)
  VALUES (origin_school_id, new_name, COALESCE(new_description, 'Clonado de ' || original_schedule_id), false)
  RETURNING id INTO new_schedule_id;

  -- Clone Workloads
  INSERT INTO workloads (school_id, teacher_id, subject_id, class_id, hours, schedule_id)
  SELECT school_id, teacher_id, subject_id, class_id, hours, new_schedule_id
  FROM workloads
  WHERE schedule_id = original_schedule_id;

  -- Clone Fixed Lessons
  INSERT INTO fixed_lessons (school_id, teacher_id, subject_id, class_id, day_of_week, slot_number, schedule_id)
  SELECT school_id, teacher_id, subject_id, class_id, day_of_week, slot_number, new_schedule_id
  FROM fixed_lessons
  WHERE schedule_id = original_schedule_id;

  RETURN new_schedule_id;
END;
$$ LANGUAGE plpgsql;
