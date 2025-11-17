-- Create stock_images table for curated royalty-free stock library
CREATE TABLE IF NOT EXISTS public.stock_images (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN (
    'all',
    'nature-outdoors',
    'animals-wildlife',
    'people-portraits',
    'food-culture',
    'abstract-texture',
    'scifi-fantasy',
    'classic-vintage'
  )),
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT NOT NULL,
  full_url TEXT NOT NULL,
  aspect_ratio NUMERIC(5,2) NOT NULL CHECK (aspect_ratio > 0),
  orientation TEXT NOT NULL CHECK (orientation IN ('horizontal', 'vertical', 'square')),
  tone_hints TEXT[] DEFAULT '{}',
  color_palette TEXT[] DEFAULT '{}',
  curated_rank INTEGER NOT NULL DEFAULT 999 CHECK (curated_rank >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_stock_images_category ON public.stock_images(category);
CREATE INDEX idx_stock_images_curated_rank ON public.stock_images(curated_rank);
CREATE INDEX idx_stock_images_orientation ON public.stock_images(orientation);

-- GIN index for tag search (array contains queries)
CREATE INDEX idx_stock_images_tags ON public.stock_images USING GIN(tags);

-- Full-text search index for title search
CREATE INDEX idx_stock_images_title_search ON public.stock_images USING GIN(to_tsvector('english', title));

-- Enable Row Level Security
ALTER TABLE public.stock_images ENABLE ROW LEVEL SECURITY;

-- Policy: Stock images are viewable by everyone (public read access)
CREATE POLICY "Stock images viewable by everyone"
  ON public.stock_images
  FOR SELECT
  USING (true);

-- Updated_at trigger (reuse existing function)
CREATE TRIGGER set_stock_images_updated_at
  BEFORE UPDATE ON public.stock_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data: Placeholder "Coming soon" entries for each category
-- These will be replaced with real stock images when assets are uploaded
INSERT INTO public.stock_images (id, category, title, tags, thumbnail_url, full_url, aspect_ratio, orientation, tone_hints, curated_rank) VALUES
  ('placeholder-nature-001', 'nature-outdoors', 'Coming Soon - Nature & Outdoors', ARRAY['placeholder'], '', '', 1.5, 'horizontal', ARRAY[], 999),
  ('placeholder-animals-001', 'animals-wildlife', 'Coming Soon - Animals & Wildlife', ARRAY['placeholder'], '', '', 1.0, 'square', ARRAY[], 999),
  ('placeholder-people-001', 'people-portraits', 'Coming Soon - People & Portraits', ARRAY['placeholder'], '', '', 0.67, 'vertical', ARRAY[], 999),
  ('placeholder-food-001', 'food-culture', 'Coming Soon - Food & Culture', ARRAY['placeholder'], '', '', 1.33, 'horizontal', ARRAY[], 999),
  ('placeholder-abstract-001', 'abstract-texture', 'Coming Soon - Abstract & Texture', ARRAY['placeholder'], '', '', 1.0, 'square', ARRAY[], 999),
  ('placeholder-scifi-001', 'scifi-fantasy', 'Coming Soon - Sci-Fi & Fantasy', ARRAY['placeholder'], '', '', 1.78, 'horizontal', ARRAY[], 999),
  ('placeholder-classic-001', 'classic-vintage', 'Coming Soon - Classic & Vintage', ARRAY['placeholder'], '', '', 1.5, 'horizontal', ARRAY[], 999)
ON CONFLICT (id) DO NOTHING;
