
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own photos" ON public."Photos";
DROP POLICY IF EXISTS "Users can create their own photos" ON public."Photos";
DROP POLICY IF EXISTS "Users can update their own photos" ON public."Photos";
DROP POLICY IF EXISTS "Users can delete their own photos" ON public."Photos";

DROP POLICY IF EXISTS "Users can view their own previews" ON public."Previews";
DROP POLICY IF EXISTS "Users can create their own previews" ON public."Previews";
DROP POLICY IF EXISTS "Users can update their own previews" ON public."Previews";
DROP POLICY IF EXISTS "Users can delete their own previews" ON public."Previews";

-- Clean up any orphaned records with NULL user_id
DELETE FROM public."Photos" WHERE user_id IS NULL;
DELETE FROM public."Previews" WHERE user_id IS NULL;

-- Make user_id columns NOT NULL to prevent future security issues
ALTER TABLE public."Photos" 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public."Previews" 
ALTER COLUMN user_id SET NOT NULL;

-- Add proper RLS policies for Photos table
CREATE POLICY "Users can view their own photos" 
  ON public."Photos" 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own photos" 
  ON public."Photos" 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" 
  ON public."Photos" 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" 
  ON public."Photos" 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add proper RLS policies for Previews table  
CREATE POLICY "Users can view their own previews" 
  ON public."Previews" 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own previews" 
  ON public."Previews" 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own previews" 
  ON public."Previews" 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own previews" 
  ON public."Previews" 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add foreign key constraints to ensure data integrity (only if they don't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'photos_user_id_fkey'
    ) THEN
        ALTER TABLE public."Photos" 
        ADD CONSTRAINT photos_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'previews_user_id_fkey'
    ) THEN
        ALTER TABLE public."Previews" 
        ADD CONSTRAINT previews_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure RLS is enabled on both tables
ALTER TABLE public."Photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Previews" ENABLE ROW LEVEL SECURITY;
