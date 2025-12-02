-- FINAL FIX: Clone schedule with proper availability cloning
-- This version correctly clones teacher availability records

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
  old_aulas_por_turma JSONB;
  new_aulas_por_turma JSONB;
  class_key TEXT;
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

  -- Clone Subjects with remapped aulas_por_turma
  FOR old_subject_id IN 
    SELECT id FROM subjects WHERE schedule_id = original_schedule_id
  LOOP
    -- Get the old aulas_por_turma
    SELECT aulas_por_turma INTO old_aulas_por_turma
    FROM subjects WHERE id = old_subject_id;
    
    -- Remap the class IDs in aulas_por_turma
    new_aulas_por_turma := '{}';
    
    IF old_aulas_por_turma IS NOT NULL AND jsonb_typeof(old_aulas_por_turma) = 'object' THEN
      FOR class_key IN SELECT jsonb_object_keys(old_aulas_por_turma)
      LOOP
        -- Check if this class_id exists in our mapping
        IF class_mapping ? class_key THEN
          -- Add the entry with the new class ID
          new_aulas_por_turma := jsonb_set(
            new_aulas_por_turma,
            ARRAY[(class_mapping->>class_key)],
            old_aulas_por_turma->class_key
          );
        END IF;
      END LOOP;
    END IF;
    
    -- Insert subject with remapped aulas_por_turma
    INSERT INTO subjects (school_id, name, aulas_por_turma, schedule_id)
    SELECT school_id, name, new_aulas_por_turma, new_schedule_id
    FROM subjects WHERE id = old_subject_id
    RETURNING id INTO new_subject_id;
    
    subject_mapping := jsonb_set(subject_mapping, ARRAY[old_subject_id::text], to_jsonb(new_subject_id));
  END LOOP;

  -- Clone Teacher Availability with new teacher IDs
  -- We need to iterate through each availability record and remap the teacher_id
  FOR old_teacher_id IN 
    SELECT DISTINCT teacher_id FROM teacher_availability WHERE schedule_id = original_schedule_id
  LOOP
    -- Only clone if this teacher exists in our mapping
    IF teacher_mapping ? old_teacher_id::text THEN
      INSERT INTO teacher_availability (school_id, teacher_id, day_of_week, time_slot_index, status, schedule_id)
      SELECT 
        school_id, 
        (teacher_mapping->>old_teacher_id::text)::UUID,
        day_of_week, 
        time_slot_index, 
        status, 
        new_schedule_id
      FROM teacher_availability
      WHERE schedule_id = original_schedule_id
        AND teacher_id = old_teacher_id;
    END IF;
  END LOOP;

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
    AND teacher_mapping ? teacher_id::text
    AND subject_mapping ? subject_id::text
    AND class_mapping ? class_id::text;

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
    AND teacher_mapping ? teacher_id::text
    AND subject_mapping ? subject_id::text
    AND class_mapping ? class_id::text;

  RETURN new_schedule_id;
END;
$$ LANGUAGE plpgsql;
