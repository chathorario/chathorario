-- Drop existing restrictive policies on the 'classes' table
DROP POLICY IF EXISTS "Admins and staff insert classes" ON public.classes;
DROP POLICY IF EXISTS "Admins and staff update classes" ON public.classes;
DROP POLICY IF EXISTS "Admins and staff delete classes" ON public.classes;

-- Recreate policies to be more inclusive
CREATE POLICY "Allow authenticated users to insert classes"
ON public.classes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.school_id = classes.school_id AND profiles.role IN ('admin', 'staff', 'teacher')
  )
);

CREATE POLICY "Allow authenticated users to update classes"
ON public.classes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.school_id = classes.school_id AND profiles.role IN ('admin', 'staff', 'teacher')
  )
);

CREATE POLICY "Allow authenticated users to delete classes"
ON public.classes
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.school_id = classes.school_id AND profiles.role IN ('admin', 'staff', 'teacher')
  )
);
