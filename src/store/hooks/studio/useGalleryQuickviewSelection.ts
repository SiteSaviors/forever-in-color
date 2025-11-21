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
      const effectiveRequires =
        typeof requiresWatermark === 'boolean'
          ? requiresWatermark
          : !(store.entitlements.hasPremiumAccess ?? store.entitlements.tier !== 'free');
      try {
        const module = await gallerySelectionAccessor.load();
        await module.handleGalleryQuickviewSelection(store, item, effectiveRequires, position);
      } catch (error) {
        console.error('[useGalleryQuickviewSelection] Failed to handle gallery selection', error);
      }
    },
    []
  );
};
