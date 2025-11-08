import type { StateCreator } from 'zustand';
import type { FounderState, GallerySlice } from './storeTypes';

export const createGallerySlice: StateCreator<FounderState, [], [], GallerySlice> = (set) => ({
  galleryItems: [],
  galleryStatus: 'idle',
  galleryError: null,
  lastFetchedAt: null,
  galleryRequiresWatermark: null,
  setGalleryItems: (items, requiresWatermark) =>
    set({
      galleryItems: items,
      galleryStatus: 'ready',
      galleryError: null,
      lastFetchedAt: Date.now(),
      galleryRequiresWatermark: typeof requiresWatermark === 'boolean' ? requiresWatermark : null,
    }),
  setGalleryStatus: (status) =>
    set({
      galleryStatus: status,
      ...(status === 'loading' ? { galleryError: null } : null),
    }),
  setGalleryError: (error) =>
    set({
      galleryError: error,
      galleryStatus: 'error',
      galleryItems: [],
      galleryRequiresWatermark: null,
      lastFetchedAt: Date.now(),
    }),
  touchGalleryFetchedAt: () =>
    set({
      lastFetchedAt: Date.now(),
    }),
  clearGallery: () =>
    set({
      galleryItems: [],
      galleryStatus: 'idle',
      galleryError: null,
      lastFetchedAt: null,
      galleryRequiresWatermark: null,
    }),
  invalidateGallery: () =>
    set({
      galleryStatus: 'idle',
      lastFetchedAt: null,
    }),
  setGalleryRequiresWatermark: (requires) =>
    set({
      galleryRequiresWatermark: requires,
    }),
  removeGalleryItem: (id) =>
    set((state) => {
      if (!state.galleryItems.length) {
        return state;
      }

      const nextItems = state.galleryItems.filter((item) => item.id !== id);
      if (nextItems.length === state.galleryItems.length) {
        return state;
      }

      const reindexed = nextItems.map((item, index) => ({
        ...item,
        position: index,
      }));

      return {
        galleryItems: reindexed,
        lastFetchedAt: Date.now(),
        galleryStatus: reindexed.length ? state.galleryStatus : 'idle',
      };
    }),
});
