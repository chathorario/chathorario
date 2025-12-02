-- Script to remove duplicate classes from the database
-- This will keep only the most recent version of each class (by name and shift)

-- Step 1: View current duplicates
SELECT 
    name,
    grade as shift,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as ids,
    STRING_AGG(created_at::text, ', ') as created_dates
FROM classes
WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  AND schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1)
GROUP BY name, grade
HAVING COUNT(*) > 1
ORDER BY name, grade;

-- Step 2: Delete duplicates, keeping only the most recent one
WITH duplicates AS (
    SELECT 
        id,
        name,
        grade,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY name, grade ORDER BY created_at DESC) as rn
    FROM classes
    WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      AND schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1)
)
DELETE FROM classes
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Step 3: Verify remaining classes
SELECT 
    id,
    name,
    grade as shift,
    aulas_diarias,
    created_at
FROM classes
WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
  AND schedule_id = (SELECT id FROM schedule_scenarios WHERE school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()) AND is_active = true LIMIT 1)
ORDER BY name, grade;
