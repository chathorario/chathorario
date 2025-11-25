-- Drop existing policies to redefine them
DROP POLICY IF EXISTS "Allow staff to read their own school configs" ON public.school_configs;
DROP POLICY IF EXISTS "Allow staff to insert their own school configs" ON public.school_configs;
DROP POLICY IF EXISTS "Allow staff to update their own school configs" ON public.school_configs;

-- Recreate policies to include the 'teacher' role
CREATE POLICY "Allow authenticated users to read their own school configs"
ON public.school_configs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.school_id = school_configs.school_id AND profiles.role IN ('staff', 'admin', 'teacher')
  )
);

CREATE POLICY "Allow authenticated users to insert their own school configs"
ON public.school_configs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.school_id = school_configs.school_id AND profiles.role IN ('staff', 'admin', 'teacher')
  )
);

CREATE POLICY "Allow authenticated users to update their own school configs"
ON public.school_configs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.school_id = school_configs.school_id AND profiles.role IN ('staff', 'admin', 'teacher')
  )
);
