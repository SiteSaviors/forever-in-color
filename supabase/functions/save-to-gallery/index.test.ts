import { assertEquals } from 'https://deno.land/std@0.201.0/testing/asserts.ts';
import { ensurePreviewLogForGallery } from './index.ts';

type MaybeSingleResult = {
  data?: Record<string, unknown> | null;
  error?: { message: string } | null;
};

const createMockSupabase = (result: MaybeSingleResult) => ({
  from: (_table: string) => ({
    select: (_columns: string) => ({
      eq: (_column: string, _value: string) => ({
        maybeSingle: async () => ({
          data: result.data ?? null,
          error: result.error ?? null,
        }),
      }),
    }),
  }),
});

Deno.test('ensurePreviewLogForGallery returns record when metadata present', async () => {
  const mockSupabase = createMockSupabase({
    data: {
      id: 'log-1',
      user_id: 'user-1',
      source_storage_path: 'user-uploads/user-1/hash.jpg',
      source_display_url: 'https://example.com',
      crop_config: { x: 1 },
    },
  });

  const result = await ensurePreviewLogForGallery(
    mockSupabase as unknown as ReturnType<typeof createMockSupabase>,
    'log-1',
    'user-1'
  );

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.record.id, 'log-1');
  }
});

Deno.test('ensurePreviewLogForGallery rejects when log missing', async () => {
  const mockSupabase = createMockSupabase({ data: null });
  const result = await ensurePreviewLogForGallery(
    mockSupabase as unknown as ReturnType<typeof createMockSupabase>,
    'missing',
    'user-1'
  );
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.status, 404);
  }
});

Deno.test('ensurePreviewLogForGallery rejects on ownership mismatch', async () => {
  const mockSupabase = createMockSupabase({
    data: {
      id: 'log-2',
      user_id: 'user-2',
      source_storage_path: 'user-uploads/user-2/hash.jpg',
      source_display_url: null,
      crop_config: null,
    },
  });
  const result = await ensurePreviewLogForGallery(
    mockSupabase as unknown as ReturnType<typeof createMockSupabase>,
    'log-2',
    'user-1'
  );
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.status, 403);
  }
});

Deno.test('ensurePreviewLogForGallery rejects when source metadata missing', async () => {
  const mockSupabase = createMockSupabase({
    data: {
      id: 'log-3',
      user_id: 'user-1',
      source_storage_path: null,
      source_display_url: null,
      crop_config: null,
    },
  });
  const result = await ensurePreviewLogForGallery(
    mockSupabase as unknown as ReturnType<typeof createMockSupabase>,
    'log-3',
    'user-1'
  );
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.status, 500);
  }
});
