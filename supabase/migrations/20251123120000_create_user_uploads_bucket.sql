-- Canonical source image bucket for gallery rehydration

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  false,
  52428800, -- 50 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Service role full access (edge functions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Service role can upload canonical sources'
  ) THEN
    CREATE POLICY "Service role can upload canonical sources"
    ON storage.objects FOR INSERT
    TO service_role
    WITH CHECK (bucket_id = 'user-uploads');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Service role can update canonical sources'
  ) THEN
    CREATE POLICY "Service role can update canonical sources"
    ON storage.objects FOR UPDATE
    TO service_role
    USING (bucket_id = 'user-uploads');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Service role can delete canonical sources'
  ) THEN
    CREATE POLICY "Service role can delete canonical sources"
    ON storage.objects FOR DELETE
    TO service_role
    USING (bucket_id = 'user-uploads');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Service role can read canonical sources'
  ) THEN
    CREATE POLICY "Service role can read canonical sources"
    ON storage.objects FOR SELECT
    TO service_role
    USING (bucket_id = 'user-uploads');
  END IF;
END;
$$;
