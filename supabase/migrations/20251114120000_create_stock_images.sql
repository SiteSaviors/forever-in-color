-- Create helper function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create stock_images table for curated royalty-free stock library
CREATE TABLE IF NOT EXISTS public.stock_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Seed data: Skipped because table already exists with data
-- The stock_images table was created previously and may have different schema
-- Placeholder seed data removed to avoid conflicts
