-- Enable Row Level Security on style_prompts table
ALTER TABLE public.style_prompts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to style prompts
-- These are style templates that should be accessible to all users
CREATE POLICY "Style prompts are publicly readable" 
ON public.style_prompts 
FOR SELECT 
USING (true);