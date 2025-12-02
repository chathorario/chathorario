-- TEST: Verify clone_schedule is working correctly
-- Run this AFTER executing UPDATE_CLONE_SCHEDULE_FUNCTION.sql

-- Step 1: Check current schedules
SELECT id, name, created_at, 
  (SELECT COUNT(*) FROM teachers WHERE schedule_id = schedules.id) as teachers,
  (SELECT COUNT(*) FROM subjects WHERE schedule_id = schedules.id) as subjects,
  (SELECT COUNT(*) FROM classes WHERE schedule_id = schedules.id) as classes,
  (SELECT COUNT(*) FROM teacher_availability WHERE schedule_id = schedules.id) as availability,
  (SELECT COUNT(*) FROM workloads WHERE schedule_id = schedules.id) as workloads,
  (SELECT COUNT(*) FROM fixed_lessons WHERE schedule_id = schedules.id) as fixed_lessons
FROM schedules
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Test cloning (replace 'YOUR-SCHEDULE-ID' with an actual schedule ID)
-- SELECT clone_schedule('YOUR-SCHEDULE-ID', 'Teste Clone', 'Testando clonagem');

-- Step 3: After cloning, run Step 1 again to verify the new schedule has all data
