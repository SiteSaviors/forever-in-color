import { useCallback } from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { createLazySliceAccessor } from '@/store/utils/createLazySliceAccessor';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';

const gallerySelectionAccessor = createLazySliceAccessor(() =>
  import('@/store/optional/galleryQuickviewSelectionEngine')
);

export const useGalleryQuickviewSelection = () => {
  return useCallback(
    async (item: GalleryQuickviewItem, requiresWatermark: boolean | null, position: number) => {
      const store = useFounderStore.getState();
      try {
        const module = await gallerySelectionAccessor.load();
        await module.handleGalleryQuickviewSelection(store, item, requiresWatermark, position);
      } catch (error) {
        console.error('[useGalleryQuickviewSelection] Failed to handle gallery selection', error);
      }
    },
    []
  );
};
