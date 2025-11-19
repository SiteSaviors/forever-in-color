import { emitStockModalClosed } from '@/utils/stockLibrary/telemetry';
import type { StockLibrarySliceCreator } from '@/store/founder/slices/stockLibrary/types';

export const createStockLibraryModalSlice: StockLibrarySliceCreator = (set, get) => ({
  stockLibraryModalOpen: false,
  currentView: 'category-selector',
  modalOpenedAt: null,
  viewedImageIds: new Set(),
  openStockLibrary: () =>
    set({
      stockLibraryModalOpen: true,
      currentView: 'category-selector',
      modalOpenedAt: Date.now(),
      viewedImageIds: new Set(),
    }),
  closeStockLibrary: () => {
    get().closeStockLibraryWithReason('dismiss');
  },
  closeStockLibraryWithReason: (reason) => {
    const state = get();
    const durationMs = state.modalOpenedAt ? Date.now() - state.modalOpenedAt : 0;

    emitStockModalClosed({
      reason,
      durationMs,
      imagesViewed: state.viewedImageIds.size,
      imageApplied: !!state.appliedStockImageId,
      category: state.selectedCategory,
    });

    set({
      stockLibraryModalOpen: false,
      currentView: 'category-selector',
      appliedStockImageId: null,
      appliedStockImage: null,
      modalOpenedAt: null,
      viewedImageIds: new Set(),
    });
  },
  setView: (view) =>
    set({
      currentView: view,
    }),
  markImageViewed: (imageId) =>
    set((state) => {
      const nextViewedIds = new Set(state.viewedImageIds);
      nextViewedIds.add(imageId);
      return {
        viewedImageIds: nextViewedIds,
      };
    }),
});
