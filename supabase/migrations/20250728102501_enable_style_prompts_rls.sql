-- Enable Row Level Security on style_prompts table
ALTER TABLE public.style_prompts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to style prompts
-- These are style templates that should be accessible to all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'style_prompts'
      AND policyname = 'Style prompts are publicly readable'
  ) THEN
    CREATE POLICY "Style prompts are publicly readable"
    ON public.style_prompts
    FOR SELECT
    USING (true);
  END IF;
END;
$$;
