import { describe, expect, it } from 'vitest';
import type { PreviewState, StylePreviewCacheEntry } from '@/store/founder/storeTypes';
import type { Orientation } from '@/utils/imageUtils';
import { computePreviewReadiness } from '@/store/selectors/previewReadiness';

const orientation: Orientation = 'square';

const buildPreviewState = (overrides: Partial<PreviewState>): PreviewState => ({
  status: 'ready',
  data: {
    previewUrl: 'https://cdn.example.com/preview.jpg',
    watermarkApplied: false,
    startedAt: Date.now() - 50,
    completedAt: Date.now(),
    storageUrl: null,
    storagePath: null,
    sourceStoragePath: null,
    sourceDisplayUrl: null,
    previewLogId: null,
    cropConfig: null,
  },
  orientation,
  ...overrides,
});

const buildCacheEntry = (overrides: Partial<StylePreviewCacheEntry>): StylePreviewCacheEntry => ({
  url: 'https://cdn.example.com/cached.jpg',
  orientation,
  generatedAt: Date.now(),
  storageUrl: null,
  storagePath: null,
  sourceStoragePath: null,
  sourceDisplayUrl: null,
  previewLogId: null,
  cropConfig: null,
  ...overrides,
});

describe('computePreviewReadiness', () => {
  it('marks styles with live preview data as ready', () => {
    const previews: Record<string, PreviewState> = {
      'style-1': buildPreviewState({}),
    };

    const readiness = computePreviewReadiness(previews, orientation, null, false, {});

    expect(readiness['style-1'].hasPreview).toBe(true);
    expect(readiness['style-1'].source).toBe('live');
    expect(readiness['style-1'].orientationMatches).toBe(true);
    expect(readiness['style-1'].previewUrl).toBe(previews['style-1'].data?.previewUrl);
  });

  it('falls back to cached preview entries when live data is absent', () => {
    const previews: Record<string, PreviewState> = {
      'style-1': buildPreviewState({
        data: undefined,
        status: 'idle',
      }),
    };

    const cache = {
      'style-1': {
        [orientation]: buildCacheEntry({}),
      },
    };

    const readiness = computePreviewReadiness(previews, orientation, null, false, cache);

    expect(readiness['style-1'].hasPreview).toBe(true);
    expect(readiness['style-1'].source).toBe('cache');
    expect(readiness['style-1'].previewUrl).toBe(cache['style-1'][orientation]?.url ?? null);
  });

  it('preserves highlight while orientation change is pending', () => {
    const previews: Record<string, PreviewState> = {
      'style-1': buildPreviewState({
        orientation: 'horizontal',
      }),
    };

    const readiness = computePreviewReadiness(previews, 'vertical', 'style-1', true, {});

    expect(readiness['style-1'].hasPreview).toBe(true);
    expect(readiness['style-1'].orientationMatches).toBe(false);
    expect(readiness['style-1'].isOrientationPending).toBe(true);
  });

  it('retains preview when regeneration is in flight with existing data', () => {
    const previews: Record<string, PreviewState> = {
      'style-1': buildPreviewState({
        status: 'loading',
      }),
    };

    const readiness = computePreviewReadiness(previews, orientation, 'style-1', false, {});

    expect(readiness['style-1'].hasPreview).toBe(true);
    expect(readiness['style-1'].source).toBe('live');
    expect(readiness['style-1'].isRegenerating).toBe(true);
    expect(readiness['style-1'].isOrientationPending).toBe(false);
  });

  it('keeps cached preview on error state when data persists', () => {
    const previews: Record<string, PreviewState> = {
      'style-1': buildPreviewState({
        status: 'error',
      }),
    };

    const readiness = computePreviewReadiness(previews, orientation, null, false, {});

    expect(readiness['style-1'].hasPreview).toBe(true);
    expect(readiness['style-1'].source).toBe('live');
  });

  it('returns cached object reference when inputs do not change', () => {
    const previews: Record<string, PreviewState> = {
      'style-1': buildPreviewState({}),
    };

    const cache = {};

    const first = computePreviewReadiness(previews, orientation, null, false, cache);
    const second = computePreviewReadiness(previews, orientation, null, false, cache);

    expect(second).toBe(first);
  });
});
