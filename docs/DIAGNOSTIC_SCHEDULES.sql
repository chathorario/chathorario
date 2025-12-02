-- DIAGNOSTIC: Check what data exists in schedules
-- Run this to see what data is in each schedule

-- Replace these UUIDs with your actual schedule IDs
-- You can find them by running: SELECT id, name FROM schedules ORDER BY created_at;

DO $$
DECLARE
  schedule_rec RECORD;
BEGIN
  FOR schedule_rec IN 
    SELECT id, name, created_at FROM schedules ORDER BY created_at DESC LIMIT 5
  LOOP
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Schedule: % (ID: %)', schedule_rec.name, schedule_rec.id;
    RAISE NOTICE 'Created: %', schedule_rec.created_at;
    RAISE NOTICE '========================================';
    
    -- Count teachers
    RAISE NOTICE 'Teachers: %', (SELECT COUNT(*) FROM teachers WHERE schedule_id = schedule_rec.id);
    
    -- Count subjects
    RAISE NOTICE 'Subjects: %', (SELECT COUNT(*) FROM subjects WHERE schedule_id = schedule_rec.id);
    
    -- Count classes
    RAISE NOTICE 'Classes: %', (SELECT COUNT(*) FROM classes WHERE schedule_id = schedule_rec.id);
    
    -- Count teacher availability
    RAISE NOTICE 'Teacher Availability: %', (SELECT COUNT(*) FROM teacher_availability WHERE schedule_id = schedule_rec.id);
    
    -- Count workloads
    RAISE NOTICE 'Workloads: %', (SELECT COUNT(*) FROM workloads WHERE schedule_id = schedule_rec.id);
    
    -- Count fixed lessons
    RAISE NOTICE 'Fixed Lessons: %', (SELECT COUNT(*) FROM fixed_lessons WHERE schedule_id = schedule_rec.id);
    
    -- Show subjects with aulas_por_turma
    RAISE NOTICE 'Subjects with aulas_por_turma:';
    FOR subject_rec IN 
      SELECT name, aulas_por_turma FROM subjects WHERE schedule_id = schedule_rec.id LIMIT 3
    LOOP
      RAISE NOTICE '  - %: %', subject_rec.name, subject_rec.aulas_por_turma;
    END LOOP;
    
    RAISE NOTICE '';
  END LOOP;
END $$;
