-- Quick fix: Delete ALL classes for the current active scenario
-- WARNING: This will delete all classes. Make sure you want to do this!

-- First, let's see what we have:
SELECT 
    c.id,
    c.name,
    c.grade as shift,
    c.aulas_diarias,
    c.created_at,
    ss.name as scenario_name
FROM classes c
LEFT JOIN schedule_scenarios ss ON c.schedule_id = ss.id
WHERE c.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  AND c.schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1)
ORDER BY c.created_at;

-- If you want to delete ALL classes for the active scenario, uncomment and run this:
/*
DELETE FROM classes
WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  AND schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1);
*/

-- After deleting, verify:
SELECT COUNT(*) as remaining_classes
FROM classes
WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  AND schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1);
