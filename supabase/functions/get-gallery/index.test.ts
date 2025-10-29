import { assertEquals } from 'https://deno.land/std@0.201.0/testing/asserts.ts';
import { createSignedSource } from './index.ts';

const createMockSupabase = (signedUrl?: string | null) => ({
  storage: {
    from: (_bucket: string) => ({
      createSignedUrl: async (_path: string, _ttl: number) => ({
        error: null,
        data: { signedUrl: signedUrl ?? null },
      }),
    }),
  },
});

Deno.test('createSignedSource returns signed URL with expiry', async () => {
  const mockSupabase = createMockSupabase('https://signed.example');
  const { signedUrl, expiresAt } = await createSignedSource(
    mockSupabase as unknown as ReturnType<typeof createMockSupabase>,
    'user-uploads/user/hash.jpg'
  );
  assertEquals(signedUrl, 'https://signed.example');
  assertEquals(typeof expiresAt, 'number');
});

Deno.test('createSignedSource returns null when signed URL missing', async () => {
  const mockSupabase = createMockSupabase(null);
  const { signedUrl, expiresAt } = await createSignedSource(
    mockSupabase as unknown as ReturnType<typeof createMockSupabase>,
    'user-uploads/user/hash.jpg'
  );
  assertEquals(signedUrl, null);
  assertEquals(expiresAt, null);
});

Deno.test('createSignedSource handles invalid storage path', async () => {
  const mockSupabase = createMockSupabase('https://signed.example');
  const { signedUrl, expiresAt } = await createSignedSource(
    mockSupabase as unknown as ReturnType<typeof createMockSupabase>,
    'invalid-path'
  );
  assertEquals(signedUrl, null);
  assertEquals(expiresAt, null);
});
