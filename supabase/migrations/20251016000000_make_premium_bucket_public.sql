-- Make preview-cache-premium bucket public so images are accessible
-- This is required for the on-the-fly watermarking system

-- Update bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'preview-cache-premium';

-- Ensure public read access policy exists
DROP POLICY IF EXISTS "Public access to clean previews" ON storage.objects;

CREATE POLICY "Public access to clean previews"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'preview-cache-premium');
