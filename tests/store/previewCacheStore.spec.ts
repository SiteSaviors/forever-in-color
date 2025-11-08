import { beforeEach, describe, expect, it } from 'vitest';
import {
  cachePreviewEntry,
  getCachedPreviewEntry,
  deletePreviewCacheEntries,
  clearPreviewCache,
} from '@/store/previewCacheStore';
import type { StylePreviewCacheEntry } from '@/store/founder/storeTypes';

const buildEntry = (orientation: StylePreviewCacheEntry['orientation']): StylePreviewCacheEntry => ({
  url: `https://example.com/${orientation}`,
  orientation,
  generatedAt: Date.now(),
});

describe('previewCacheStore deleteEntriesForStyle', () => {
  beforeEach(() => {
    clearPreviewCache();
  });

  it('removes all cached entries for a specific style id', () => {
    cachePreviewEntry('style-1', buildEntry('square'));
    cachePreviewEntry('style-1', buildEntry('horizontal'));
    cachePreviewEntry('style-2', buildEntry('square'));

    expect(getCachedPreviewEntry('style-1', 'square')).toBeDefined();
    expect(getCachedPreviewEntry('style-1', 'horizontal')).toBeDefined();

    deletePreviewCacheEntries('style-1');

    expect(getCachedPreviewEntry('style-1', 'square')).toBeUndefined();
    expect(getCachedPreviewEntry('style-1', 'horizontal')).toBeUndefined();
    expect(getCachedPreviewEntry('style-2', 'square')).toBeDefined();
  });

  it('is a no-op when style id is null or unknown', () => {
    cachePreviewEntry('style-3', buildEntry('square'));

    deletePreviewCacheEntries(null);
    deletePreviewCacheEntries('missing');

    expect(getCachedPreviewEntry('style-3', 'square')).toBeDefined();
  });
});
