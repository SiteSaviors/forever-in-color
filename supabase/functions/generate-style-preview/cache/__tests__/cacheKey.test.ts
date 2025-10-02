import { assertEquals, assertNotEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildCacheKey, createImageDigest, parseCacheKey } from "../cacheKey.ts";

Deno.test('createImageDigest produces deterministic output', async () => {
  const image = 'data:image/png;base64,AAAABBBB';
  const digest1 = await createImageDigest(image);
  const digest2 = await createImageDigest(image);
  assertEquals(digest1, digest2);
});

Deno.test('createImageDigest differentiates distinct inputs', async () => {
  const digest1 = await createImageDigest('data:image/png;base64,AAAABBBB');
  const digest2 = await createImageDigest('data:image/png;base64,AAAACCCC');
  assertNotEquals(digest1, digest2);
});

Deno.test('buildCacheKey composes expected structure and round-trips', () => {
  const cacheKey = buildCacheKey({
    imageDigest: 'digest',
    styleId: 5,
    styleVersion: '12345',
    aspectRatio: '3:2',
    quality: 'HIGH',
    watermark: false
  });

  assertEquals(cacheKey, 'preview:v1:5:12345:3:2:high:no-watermark:digest');

  const parsed = parseCacheKey(cacheKey);
  if (!parsed) {
    throw new Error('Failed to parse cache key');
  }

  assertEquals(parsed.styleId, 5);
  assertEquals(parsed.styleVersion, '12345');
  assertEquals(parsed.aspectRatio, '3:2');
  assertEquals(parsed.quality, 'high');
  assertEquals(parsed.watermark, false);
  assertEquals(parsed.imageDigest, 'digest');
});
