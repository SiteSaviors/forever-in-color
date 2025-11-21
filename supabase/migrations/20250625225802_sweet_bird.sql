-- Check if user_id columns already exist before adding them
-- Skip if tables don't exist (legacy migration for old schema)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Photos') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Photos' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE public."Photos"
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Previews') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Previews' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE public."Previews"
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Create profiles table for user data if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security on all tables (skip if tables don't exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Photos') THEN
    ALTER TABLE public."Photos" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Previews') THEN
    ALTER TABLE public."Previews" ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own photos" ON public."Photos";
DROP POLICY IF EXISTS "Users can create their own photos" ON public."Photos";
DROP POLICY IF EXISTS "Users can update their own photos" ON public."Photos";
DROP POLICY IF EXISTS "Users can delete their own photos" ON public."Photos";

DROP POLICY IF EXISTS "Users can view their own previews" ON public."Previews";
DROP POLICY IF EXISTS "Users can create their own previews" ON public."Previews";
DROP POLICY IF EXISTS "Users can update their own previews" ON public."Previews";
DROP POLICY IF EXISTS "Users can delete their own previews" ON public."Previews";

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create RLS policies for Photos table (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Photos') THEN
    EXECUTE 'CREATE POLICY "Users can view their own photos" ON public."Photos" FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create their own photos" ON public."Photos" FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update their own photos" ON public."Photos" FOR UPDATE USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete their own photos" ON public."Photos" FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create RLS policies for Previews table (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Previews') THEN
    EXECUTE 'CREATE POLICY "Users can view their own previews" ON public."Previews" FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create their own previews" ON public."Previews" FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update their own previews" ON public."Previews" FOR UPDATE USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete their own previews" ON public."Previews" FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user profile creation if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  RETURN new;
END;
$$;

-- Drop the trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();