import { assertEquals, assertThrows } from 'https://deno.land/std@0.201.0/testing/asserts.ts';
import { parseDataUrl, persistOriginalImage, type SupabaseClientLike } from './index.ts';

const sampleJpeg =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcU' +
  'FhYaHSUfGhsjHBYWICwgIyYnKSopGR8tPT0tIygtLisBCgoKDg0OGhAQGi0fHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0t' +
  'LS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAXAAEBAQEAAAAAAAAAAAAAAAAAAQID/8QAFhABAQEAAAAAAAAAAAAAAAAA' +
  'AAEC/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCfAE//2Q==';

Deno.test('parseDataUrl decodes JPEG payload', () => {
  const parsed = parseDataUrl(sampleJpeg);
  assertEquals(parsed.mimeType, 'image/jpeg');
  assertEquals(parsed.bytes instanceof Uint8Array, true);
  assertEquals(parsed.bytes.length > 0, true);
});

Deno.test('parseDataUrl rejects invalid payload', () => {
  assertThrows(() => parseDataUrl('not-a-data-url'));
});

type UploadBehavior = {
  error?: { message: string };
  signedUrl?: string;
};

const createMockSupabase = (behavior: UploadBehavior = {}): SupabaseClientLike => ({
  storage: {
    from: (_bucket: string) => ({
      upload: async () => ({ error: behavior.error ?? null }),
      createSignedUrl: async () => ({
        error: null,
        data: {
          signedUrl: behavior.signedUrl ?? 'https://signed-url.test',
        },
      }),
    }),
  },
});

Deno.test('persistOriginalImage uploads and returns metadata', async () => {
  const supabase = createMockSupabase();
  const result = await persistOriginalImage(supabase, 'user-123', {
    dataUrl: sampleJpeg,
    width: 100,
    height: 50,
  });
  if (!result.ok) {
    throw new Error(`Expected ok result, received: ${JSON.stringify(result)}`);
  }
  assertEquals(result.bucket, 'user-uploads');
  assertEquals(result.wasUploaded, true);
  assertEquals(result.width, 100);
  assertEquals(result.height, 50);
  assertEquals(result.signedUrl?.includes('https://'), true);
});

Deno.test('persistOriginalImage tolerates duplicate uploads', async () => {
  const supabase = createMockSupabase({
    error: { message: 'The resource already exists' },
  });
  const result = await persistOriginalImage(supabase, 'user-123', {
    dataUrl: sampleJpeg,
  });
  if (!result.ok) {
    throw new Error(`Expected ok result, received: ${JSON.stringify(result)}`);
  }
  assertEquals(result.wasUploaded, false);
});

Deno.test('persistOriginalImage returns error for storage failure', async () => {
  const supabase = createMockSupabase({
    error: { message: 'network unreachable' },
  });
  const result = await persistOriginalImage(supabase, 'user-123', {
    dataUrl: sampleJpeg,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, 'storage_upload_failed');
  }
});

Deno.test('persistOriginalImage rejects unsupported content type', async () => {
  const supabase = createMockSupabase();
  const pngDataUrl = sampleJpeg.replace('image/jpeg', 'image/png');
  const result = await persistOriginalImage(supabase, 'user-123', {
    dataUrl: pngDataUrl,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, 'unsupported_content_type');
  }
});
