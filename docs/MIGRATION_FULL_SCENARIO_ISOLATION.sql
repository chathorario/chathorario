-- MIGRATION: Full Scenario Isolation
-- Description: Makes Teachers, Subjects, Classes, and Teacher Availability scenario-specific
-- This allows each scenario to have completely independent data

-- 1. Add schedule_id to Teachers
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE;

-- 2. Add schedule_id to Subjects
ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE;

-- 3. Add schedule_id to Classes
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE;

-- 4. Add schedule_id to Teacher Availability
ALTER TABLE teacher_availability 
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE;

-- 5. DATA MIGRATION: Link existing data to schedules
-- For each school, find their schedules and link existing data to the first/active schedule

DO $$
DECLARE
  school_rec RECORD;
  default_schedule_id UUID;
BEGIN
  -- Iterate over schools that have schedules
  FOR school_rec IN 
    SELECT DISTINCT school_id FROM schedules
  LOOP
    -- Get the active schedule, or the first one if none is active
    SELECT id INTO default_schedule_id 
    FROM schedules 
    WHERE school_id = school_rec.school_id 
    ORDER BY is_active DESC, created_at ASC 
    LIMIT 1;

    IF default_schedule_id IS NOT NULL THEN
      RAISE NOTICE 'Linking data for school % to schedule %', school_rec.school_id, default_schedule_id;

      -- Update Teachers
      UPDATE teachers 
      SET schedule_id = default_schedule_id 
      WHERE school_id = school_rec.school_id AND schedule_id IS NULL;

      -- Update Subjects
      UPDATE subjects 
      SET schedule_id = default_schedule_id 
      WHERE school_id = school_rec.school_id AND schedule_id IS NULL;

      -- Update Classes
      UPDATE classes 
      SET schedule_id = default_schedule_id 
      WHERE school_id = school_rec.school_id AND schedule_id IS NULL;

      -- Update Teacher Availability
      UPDATE teacher_availability 
      SET schedule_id = default_schedule_id 
      WHERE school_id = school_rec.school_id AND schedule_id IS NULL;
    END IF;
  END LOOP;
END $$;

-- 6. Update clone_schedule function to clone ALL data
CREATE OR REPLACE FUNCTION clone_schedule(
  original_schedule_id UUID,
  new_name TEXT,
  new_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_schedule_id UUID;
  origin_school_id UUID;
  teacher_mapping JSONB := '{}';
  subject_mapping JSONB := '{}';
  class_mapping JSONB := '{}';
  old_teacher_id UUID;
  new_teacher_id UUID;
  old_subject_id UUID;
  new_subject_id UUID;
  old_class_id UUID;
  new_class_id UUID;
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

  -- Clone Teachers and build mapping
  FOR old_teacher_id IN 
    SELECT id FROM teachers WHERE schedule_id = original_schedule_id
  LOOP
    INSERT INTO teachers (school_id, name, workload_total, planning_hours, activity_hours, knowledge_area, schedule_id)
    SELECT school_id, name, workload_total, planning_hours, activity_hours, knowledge_area, new_schedule_id
    FROM teachers WHERE id = old_teacher_id
    RETURNING id INTO new_teacher_id;
    
    teacher_mapping := jsonb_set(teacher_mapping, ARRAY[old_teacher_id::text], to_jsonb(new_teacher_id));
  END LOOP;

  -- Clone Subjects and build mapping
  FOR old_subject_id IN 
    SELECT id FROM subjects WHERE schedule_id = original_schedule_id
  LOOP
    INSERT INTO subjects (school_id, name, aulas_por_turma, schedule_id)
    SELECT school_id, name, aulas_por_turma, new_schedule_id
    FROM subjects WHERE id = old_subject_id
    RETURNING id INTO new_subject_id;
    
    subject_mapping := jsonb_set(subject_mapping, ARRAY[old_subject_id::text], to_jsonb(new_subject_id));
  END LOOP;

  -- Clone Classes and build mapping
  FOR old_class_id IN 
    SELECT id FROM classes WHERE schedule_id = original_schedule_id
  LOOP
    INSERT INTO classes (school_id, name, grade, aulas_diarias, schedule_id)
    SELECT school_id, name, grade, aulas_diarias, new_schedule_id
    FROM classes WHERE id = old_class_id
    RETURNING id INTO new_class_id;
    
    class_mapping := jsonb_set(class_mapping, ARRAY[old_class_id::text], to_jsonb(new_class_id));
  END LOOP;

  -- Clone Teacher Availability with new teacher IDs
  INSERT INTO teacher_availability (school_id, teacher_id, day_of_week, time_slot_index, status, schedule_id)
  SELECT 
    school_id, 
    (teacher_mapping->>teacher_id::text)::UUID,
    day_of_week, 
    time_slot_index, 
    status, 
    new_schedule_id
  FROM teacher_availability
  WHERE schedule_id = original_schedule_id
    AND (teacher_mapping->>teacher_id::text) IS NOT NULL;

  -- Clone Workloads with new IDs
  INSERT INTO workloads (school_id, teacher_id, subject_id, class_id, hours, schedule_id)
  SELECT 
    school_id,
    (teacher_mapping->>teacher_id::text)::UUID,
    (subject_mapping->>subject_id::text)::UUID,
    (class_mapping->>class_id::text)::UUID,
    hours,
    new_schedule_id
  FROM workloads
  WHERE schedule_id = original_schedule_id
    AND (teacher_mapping->>teacher_id::text) IS NOT NULL
    AND (subject_mapping->>subject_id::text) IS NOT NULL
    AND (class_mapping->>class_id::text) IS NOT NULL;

  -- Clone Fixed Lessons with new IDs
  INSERT INTO fixed_lessons (school_id, teacher_id, subject_id, class_id, day_of_week, slot_number, schedule_id)
  SELECT 
    school_id,
    (teacher_mapping->>teacher_id::text)::UUID,
    (subject_mapping->>subject_id::text)::UUID,
    (class_mapping->>class_id::text)::UUID,
    day_of_week,
    slot_number,
    new_schedule_id
  FROM fixed_lessons
  WHERE schedule_id = original_schedule_id
    AND (teacher_mapping->>teacher_id::text) IS NOT NULL
    AND (subject_mapping->>subject_id::text) IS NOT NULL
    AND (class_mapping->>class_id::text) IS NOT NULL;

  RETURN new_schedule_id;
END;
$$ LANGUAGE plpgsql;
