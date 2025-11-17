-- Add required_tier column for premium stock gating
ALTER TABLE public.stock_images
  ADD COLUMN IF NOT EXISTS required_tier text DEFAULT 'free';

ALTER TABLE public.stock_images
  ADD CONSTRAINT stock_images_required_tier_check
    CHECK (required_tier IN ('free', 'creator', 'plus', 'pro'));

UPDATE public.stock_images
  SET required_tier = 'free'
  WHERE required_tier IS NULL;
