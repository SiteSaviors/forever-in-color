import { assertEquals, assertStrictEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { LruMemoryCache } from "../memoryCache.ts";

Deno.test('LRU cache respects capacity and recency', () => {
  const cache = new LruMemoryCache<string>(2);
  cache.set('a', 'A', 1000);
  cache.set('b', 'B', 1000);
  assertEquals(cache.get('a'), 'A');
  cache.set('c', 'C', 1000);
  assertStrictEquals(cache.get('b'), null);
  assertEquals(cache.get('a'), 'A');
  assertEquals(cache.get('c'), 'C');
});

Deno.test('LRU cache expires entries based on ttl', async () => {
  const cache = new LruMemoryCache<string>(2);
  cache.set('temp', 'VALUE', 10);
  await new Promise((resolve) => setTimeout(resolve, 20));
  assertStrictEquals(cache.get('temp'), null);
});
