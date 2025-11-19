import { fetchStockImages as fetchStockImagesApi } from '@/utils/stockLibraryApi';
import { emitStockScrolled, emitStockSearchPerformed } from '@/utils/stockLibrary/telemetry';
import type { StockLibrarySliceCreator } from '@/store/founder/slices/stockLibrary/types';

export const createStockLibraryPaginationSlice: StockLibrarySliceCreator = (set, get) => ({
  stockImages: [],
  hasNextPage: false,
  nextCursor: null,
  currentPage: 0,
  stockStatus: 'idle',
  stockError: null,
  appendStockImages: (images, nextCursor) =>
    set((state) => ({
      stockImages: [...state.stockImages, ...images],
      hasNextPage: !!nextCursor,
      nextCursor,
      currentPage: state.currentPage + 1,
      stockStatus: 'ready',
      stockError: null,
    })),
  resetStockImages: () =>
    set({
      stockImages: [],
      hasNextPage: false,
      nextCursor: null,
      currentPage: 0,
      stockStatus: 'idle',
      stockError: null,
    }),
  setStockStatus: (status) =>
    set(() => ({
      stockStatus: status,
      ...(status === 'loading' ? { stockError: null } : {}),
      ...(status === 'error'
        ? { stockImages: [], hasNextPage: false, nextCursor: null, currentPage: 0 }
        : {}),
    })),
  setStockError: (error) =>
    set({
      stockError: error,
      stockStatus: 'error',
      stockImages: [],
      hasNextPage: false,
      nextCursor: null,
      currentPage: 0,
    }),
  fetchStockImages: async () => {
    const state = get();
    set({ stockStatus: 'loading', stockError: null });

    try {
      const result = await fetchStockImagesApi({
        category: state.selectedCategory,
        search: state.searchQuery.trim() || undefined,
        sort: state.sortMode,
        limit: 20,
      });

      if ('error' in result) {
        set({
          stockStatus: 'error',
          stockError: result.error,
          stockImages: [],
          hasNextPage: false,
          nextCursor: null,
          currentPage: 0,
        });
        return;
      }

      set({
        stockImages: result.images,
        hasNextPage: result.hasNextPage,
        nextCursor: result.nextCursor ?? null,
        currentPage: 1,
        stockStatus: 'ready',
        stockError: null,
      });

      if (state.searchQuery.trim()) {
        emitStockSearchPerformed({
          query: state.searchQuery.trim(),
          resultCount: result.images.length,
          category: state.selectedCategory,
        });
      }
    } catch (error) {
      console.error('[stockLibrarySlice] fetchStockImages error:', error);
      set({
        stockStatus: 'error',
        stockError: error instanceof Error ? error.message : 'Failed to load images',
        stockImages: [],
        hasNextPage: false,
        nextCursor: null,
        currentPage: 0,
      });
    }
  },
  fetchNextPage: async () => {
    const state = get();
    if (state.stockStatus === 'loading' || !state.hasNextPage || !state.nextCursor) {
      return;
    }

    set({ stockStatus: 'loading' });

    try {
      const result = await fetchStockImagesApi({
        category: state.selectedCategory,
        search: state.searchQuery.trim() || undefined,
        sort: state.sortMode,
        limit: 20,
        cursor: state.nextCursor,
      });

      if ('error' in result) {
        set({
          stockStatus: 'error',
          stockError: result.error,
        });
        return;
      }

      set({
        stockImages: [...state.stockImages, ...result.images],
        hasNextPage: result.hasNextPage,
        nextCursor: result.nextCursor ?? null,
        currentPage: state.currentPage + 1,
        stockStatus: 'ready',
        stockError: null,
      });

      emitStockScrolled({
        page: state.currentPage + 1,
        imagesLoaded: state.stockImages.length + result.images.length,
      });
    } catch (error) {
      console.error('[stockLibrarySlice] fetchNextPage error:', error);
      set({
        stockStatus: 'error',
        stockError: error instanceof Error ? error.message : 'Failed to load more images',
      });
    }
  },
  retryFetch: async () => {
    get().fetchStockImages();
  },
});
