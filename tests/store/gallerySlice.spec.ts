import { beforeEach, describe, expect, it } from 'vitest';
import { useFounderStore } from '@/store/useFounderStore';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';

const resetGalleryState = () => {
  useFounderStore.setState({
    galleryItems: [],
    galleryStatus: 'idle',
    galleryError: null,
    galleryRequiresWatermark: null,
    lastFetchedAt: null,
  });
};

const sampleItem = (overrides: Partial<GalleryQuickviewItem> = {}): GalleryQuickviewItem => ({
  id: 'item-1',
  styleId: 'style-1',
  styleName: 'Watercolor Dreams',
  orientation: 'square',
  thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
  imageUrl: 'https://cdn.example.com/image.jpg',
  displayUrl: 'https://cdn.example.com/display.jpg',
  storagePath: 'preview-cache-public/path.jpg',
  previewLogId: 'log-1',
  sourceStoragePath: 'user_uploads/user/photo.jpg',
  sourceDisplayUrl: 'https://cdn.example.com/source.jpg',
  cropConfig: { x: 0, y: 0, width: 100, height: 100 },
  savedAt: '2025-01-01T00:00:00.000Z',
  position: 0,
  ...overrides,
});

describe('gallerySlice', () => {
  beforeEach(() => {
    resetGalleryState();
  });

  it('stores gallery items and metadata', () => {
    const { setGalleryItems } = useFounderStore.getState();
    const items = [sampleItem(), sampleItem({ id: 'item-2', position: 1 })];
    setGalleryItems(items, true);

    const state = useFounderStore.getState();
    expect(state.galleryItems).toEqual(items);
    expect(state.galleryStatus).toBe('ready');
    expect(state.galleryError).toBeNull();
    expect(state.galleryRequiresWatermark).toBe(true);
    expect(typeof state.lastFetchedAt).toBe('number');
  });

  it('marks error state and clears items', () => {
    const { setGalleryItems, setGalleryError } = useFounderStore.getState();
    setGalleryItems([sampleItem()], false);
    setGalleryError('Network error');

    const state = useFounderStore.getState();
    expect(state.galleryStatus).toBe('error');
    expect(state.galleryItems).toHaveLength(0);
    expect(state.galleryRequiresWatermark).toBeNull();
    expect(state.galleryError).toBe('Network error');
  });

  it('invalidates gallery state for refresh', () => {
    const { setGalleryItems, invalidateGallery } = useFounderStore.getState();
    setGalleryItems([sampleItem()], false);
    invalidateGallery();

    const state = useFounderStore.getState();
    expect(state.galleryStatus).toBe('idle');
    expect(state.lastFetchedAt).toBeNull();
  });

  it('removes a gallery item and reindexes remaining positions', () => {
    const { setGalleryItems, removeGalleryItem } = useFounderStore.getState();
    const items = [
      sampleItem({ id: 'item-1', position: 0 }),
      sampleItem({ id: 'item-2', position: 1 }),
      sampleItem({ id: 'item-3', position: 2 }),
    ];
    setGalleryItems(items, false);
    const previousFetchedAt = useFounderStore.getState().lastFetchedAt ?? 0;

    removeGalleryItem('item-2');

    const state = useFounderStore.getState();
    expect(state.galleryItems).toHaveLength(2);
    expect(state.galleryItems.map((item) => item.id)).toEqual(['item-1', 'item-3']);
    expect(state.galleryItems.map((item) => item.position)).toEqual([0, 1]);
    expect(state.lastFetchedAt ?? 0).toBeGreaterThanOrEqual(previousFetchedAt);
    expect(state.galleryStatus).toBe('ready');
  });

  it('sets gallery status to idle when last item is removed', () => {
    const { setGalleryItems, removeGalleryItem } = useFounderStore.getState();
    setGalleryItems([sampleItem()], false);
    removeGalleryItem('item-1');

    const state = useFounderStore.getState();
    expect(state.galleryItems).toHaveLength(0);
    expect(state.galleryStatus).toBe('idle');
  });
});
