import { beforeEach, describe, expect, it } from 'vitest';
import { useFounderStore } from '@/store/useFounderStore';
import { cachePreviewEntry, clearPreviewCache, hasCachedPreviewEntry } from '@/store/previewCacheStore';

const getSampleStyleId = () => {
  const state = useFounderStore.getState();
  const style = state.styles.find((item) => item.id !== 'original-image');
  if (!style) {
    throw new Error('Expected at least one non original-image style in store');
  }
  return style.id;
};

describe('sessionSlice', () => {
  beforeEach(() => {
    useFounderStore.getState().resetPreviews();
    clearPreviewCache();
    useFounderStore.setState({
      sessionUser: null,
      sessionHydrated: false,
      accessToken: null,
    });
  });

  it('clears preview state and cache when signing out', () => {
    const styleId = getSampleStyleId();
    const store = useFounderStore.getState();
    const orientation = store.orientation;
    const previewUrl = 'https://cdn.example.com/preview.jpg';

    useFounderStore.setState((state) => ({
      previews: {
        ...state.previews,
        [styleId]: {
          status: 'ready',
          data: {
            previewUrl,
            watermarkApplied: false,
            startedAt: Date.now() - 100,
            completedAt: Date.now(),
            storageUrl: null,
            storagePath: null,
            sourceStoragePath: null,
            sourceDisplayUrl: null,
            previewLogId: null,
            cropConfig: null,
          },
          orientation,
        },
      },
      sessionUser: { id: 'user-123', email: 'test@example.com' },
      sessionHydrated: true,
      accessToken: 'token',
    }));

    cachePreviewEntry(styleId, {
      url: previewUrl,
      orientation,
      generatedAt: Date.now(),
      storageUrl: null,
      storagePath: null,
      sourceStoragePath: null,
      sourceDisplayUrl: null,
      previewLogId: null,
      cropConfig: null,
    });

    expect(useFounderStore.getState().previews[styleId].status).toBe('ready');
    expect(hasCachedPreviewEntry(styleId, orientation)).toBe(true);

    const { setSession } = useFounderStore.getState();
    setSession(null, null);

    const nextState = useFounderStore.getState();
    expect(nextState.previews[styleId].status).toBe('idle');
    expect(nextState.previews[styleId].data).toBeUndefined();
    expect(hasCachedPreviewEntry(styleId, orientation)).toBe(false);
    expect(nextState.sessionUser).toBeNull();
  });
});
