/**
 * Stock Library Slice
 *
 * Manages state for the stock library modal, including:
 * - Modal open/close state
 * - View switching (category selector ↔ grid browser)
 * - Category selection and search
 * - Pagination with cursor-based loading
 * - Applied image tracking
 * - Session analytics (modal opened at, images viewed)
 */

import type { StateCreator } from 'zustand';
import type { FounderState, StockLibrarySlice } from './storeTypes';
import { trackStockModalClosed, trackStockScrolled, trackStockSearchPerformed } from '@/utils/stockLibraryTelemetry';
import { fetchStockImages as fetchStockImagesApi } from '@/utils/stockLibraryApi';
import { persistOriginalUpload } from '@/utils/sourceUploadApi';
import { getImageDimensions } from '@/utils/imageUtils';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';

const FILTER_STORAGE_KEY = 'stock_library_filters';

const loadPersistedFilters = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      accessFilters?: { free: boolean; premium: boolean };
      orientationFilters?: { horizontal: boolean; vertical: boolean; square: boolean };
    };
    return parsed ?? null;
  } catch {
    return null;
  }
};

const persistFilters = (
  accessFilters: { free: boolean; premium: boolean },
  orientationFilters: { horizontal: boolean; vertical: boolean; square: boolean }
) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ accessFilters, orientationFilters })
    );
  } catch {
    // ignore write errors (storage disabled/private browsing)
  }
};

const persistedFilters = loadPersistedFilters();

const fetchImageAsDataUrl = async (url: string): Promise<{ dataUrl: string; width: number; height: number }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download stock image (${response.status})`);
  }
  const blob = await response.blob();

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read stock image'));
    reader.readAsDataURL(blob);
  });

  const { width, height } = await getImageDimensions(dataUrl);
  return { dataUrl, width, height };
};

export const createStockLibrarySlice: StateCreator<FounderState, [], [], StockLibrarySlice> = (
  set,
  get
) => ({
  // Modal state
  stockLibraryModalOpen: false,
  currentView: 'category-selector',

  // Category/filter state
  selectedCategory: 'all',
  searchQuery: '',
  sortMode: 'recommended',
  accessFilters: persistedFilters?.accessFilters ?? {
    free: true,
    premium: true,
  },
  orientationFilters: persistedFilters?.orientationFilters ?? {
    horizontal: true,
    vertical: true,
    square: true,
  },

  // Pagination state
  stockImages: [],
  hasNextPage: false,
  nextCursor: null,
  currentPage: 0,

  // Loading/error state
  stockStatus: 'idle',
  stockError: null,

  // Applied image tracking
  appliedStockImageId: null,
  appliedStockImage: null,

  // Modal session tracking
  modalOpenedAt: null,
  viewedImageIds: new Set(),

  // Actions

  /**
   * Open stock library modal
   * Resets to category selector view
   */
  openStockLibrary: () =>
    set({
      stockLibraryModalOpen: true,
      currentView: 'category-selector',
      modalOpenedAt: Date.now(),
      viewedImageIds: new Set(),
    }),

  /**
   * Close stock library modal
   * Fires telemetry event with session data
   */
  closeStockLibrary: () => {
    get().closeStockLibraryWithReason('dismiss');
  },

  closeStockLibraryWithReason: (reason) => {
    const state = get();
    const durationMs = state.modalOpenedAt ? Date.now() - state.modalOpenedAt : 0;

    // Fire telemetry (reason will be set by caller)
    trackStockModalClosed({
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

  /**
   * Switch between category selector and grid browser views
   */
  setView: (view) =>
    set({
      currentView: view,
    }),

  /**
   * Set selected category
   * Resets images and pagination when category changes
   */
  setCategory: (category) =>
    set((state) => {
      // Don't reset if selecting the same category
      if (state.selectedCategory === category) {
        return state;
      }

      return {
        selectedCategory: category,
        stockImages: [],
        hasNextPage: false,
        nextCursor: null,
        currentPage: 0,
        stockStatus: 'idle',
        stockError: null,
      };
    }),

  /**
   * Set search query
   * Resets images and pagination when search changes
   */
  setSearchQuery: (query) =>
    set((state) => {
      // Don't reset if search hasn't changed
      if (state.searchQuery === query) {
        return state;
      }

      return {
        searchQuery: query,
        stockImages: [],
        hasNextPage: false,
        nextCursor: null,
        currentPage: 0,
        stockStatus: 'idle',
        stockError: null,
      };
    }),

  /**
   * Set sort mode (recommended | popular)
   */
  setSortMode: (mode) =>
    set((state) => {
      // Don't reset if mode hasn't changed
      if (state.sortMode === mode) {
        return state;
      }

      return {
        sortMode: mode,
        stockImages: [],
        hasNextPage: false,
        nextCursor: null,
        currentPage: 0,
        stockStatus: 'idle',
        stockError: null,
      };
    }),
  toggleAccessFilter: (tier) =>
    set((state) => {
      const nextFilters = {
        ...state.accessFilters,
        [tier]: !state.accessFilters[tier],
      };
      persistFilters(nextFilters, state.orientationFilters);
      return {
        accessFilters: nextFilters,
        stockImages: [],
        hasNextPage: false,
        nextCursor: null,
        currentPage: 0,
        stockStatus: 'idle',
        stockError: null,
      };
    }),
  toggleOrientationFilter: (orientation) =>
    set((state) => {
      const nextOrientations = {
        ...state.orientationFilters,
        [orientation]: !state.orientationFilters[orientation],
      };
      persistFilters(state.accessFilters, nextOrientations);
      return {
        orientationFilters: nextOrientations,
        stockImages: [],
        hasNextPage: false,
        nextCursor: null,
        currentPage: 0,
        stockStatus: 'idle',
        stockError: null,
      };
    }),
  resetFilters: () =>
    set(() => {
      const resetAccess = { free: true, premium: true };
      const resetOrientation = { horizontal: true, vertical: true, square: true };
      persistFilters(resetAccess, resetOrientation);
      return {
        accessFilters: resetAccess,
        orientationFilters: resetOrientation,
      };
    }),

  /**
   * Append stock images from pagination
   * Used for infinite scroll
   */
  appendStockImages: (images, nextCursor) =>
    set((state) => ({
      stockImages: [...state.stockImages, ...images],
      hasNextPage: !!nextCursor,
      nextCursor,
      currentPage: state.currentPage + 1,
      stockStatus: 'ready',
      stockError: null,
    })),

  /**
   * Reset stock images
   * Clears all images and pagination state
   */
  resetStockImages: () =>
    set({
      stockImages: [],
      hasNextPage: false,
      nextCursor: null,
      currentPage: 0,
      stockStatus: 'idle',
      stockError: null,
    }),

  /**
   * Set stock loading/error status
   */
  setStockStatus: (status) =>
    set(() => ({
      stockStatus: status,
      // Clear error when loading
      ...(status === 'loading' ? { stockError: null } : {}),
      // Clear images on error
      ...(status === 'error'
        ? { stockImages: [], hasNextPage: false, nextCursor: null, currentPage: 0 }
        : {}),
    })),

  /**
   * Set stock error message
   */
  setStockError: (error) =>
    set({
      stockError: error,
      stockStatus: 'error',
      stockImages: [],
      hasNextPage: false,
      nextCursor: null,
      currentPage: 0,
    }),

  /**
   * Apply a stock image
   * Only one image can be applied at a time
   */
  applyStockImage: (image) =>
    set({
      appliedStockImageId: image.id,
      appliedStockImage: image,
    }),

  /**
   * Clear applied stock image
   */
  clearAppliedStockImage: () =>
    set({
      appliedStockImageId: null,
      appliedStockImage: null,
    }),

  /**
   * Continue with applied stock image
   * Sets the stock image as the uploaded image and closes modal
   * This integrates with the existing preview pipeline
   */
  continueWithStockImage: async () => {
    const state = get();
    const { appliedStockImage } = state;

    if (!appliedStockImage) {
      console.warn('[stockLibrarySlice] continueWithStockImage called with no applied image');
      return;
    }

    try {
      const { dataUrl, width, height } = await fetchImageAsDataUrl(appliedStockImage.fullUrl);

      get().setOriginalImage(dataUrl);
      get().setOriginalImageDimensions({ width, height });
      get().setUploadedImage(dataUrl);
      get().setCroppedImage(dataUrl);
      get().setOrientation(appliedStockImage.orientation);
      get().setOrientationTip(ORIENTATION_PRESETS[appliedStockImage.orientation]?.description ?? null);
      get().markCropReady();
      get().resetPreviews();

      get().setPreviewState('original-image', {
        status: 'ready',
        data: {
          previewUrl: dataUrl,
          watermarkApplied: false,
          startedAt: Date.now(),
          completedAt: Date.now(),
        },
        orientation: appliedStockImage.orientation,
      });

      const accessToken = get().getSessionAccessToken ? get().getSessionAccessToken() : null;
      const persistResult = await persistOriginalUpload({ dataUrl, width, height, accessToken });

      if (persistResult.ok) {
        get().setOriginalImageSource({
          storagePath: persistResult.storagePath,
          publicUrl: persistResult.publicUrl,
          signedUrl: persistResult.signedUrl,
          signedUrlExpiresAt: persistResult.signedUrlExpiresAt,
          hash: persistResult.hash,
          bytes: persistResult.bytes,
        });
        get().setCurrentImageHash(persistResult.hash);
      } else {
        console.warn('[stockLibrarySlice] Failed to persist stock image', persistResult.error);
      }

      await get().generatePreviews(undefined, { force: true });
    } catch (error) {
      console.error('[stockLibrarySlice] Unable to apply stock image', error);
      return;
    }

    // Fire telemetry before closing
    const durationMs = state.modalOpenedAt ? Date.now() - state.modalOpenedAt : 0;
    trackStockModalClosed({
      reason: 'continue',
      durationMs,
      imagesViewed: state.viewedImageIds.size,
      imageApplied: true,
      category: state.selectedCategory,
    });

    // Close modal and reset state
    set({
      stockLibraryModalOpen: false,
      currentView: 'category-selector',
      appliedStockImageId: null,
      appliedStockImage: null,
      modalOpenedAt: null,
      viewedImageIds: new Set(),
    });
  },

  /**
   * Mark an image as viewed (for analytics)
   */
  markImageViewed: (imageId) =>
    set((state) => {
      const nextViewedIds = new Set(state.viewedImageIds);
      nextViewedIds.add(imageId);
      return {
        viewedImageIds: nextViewedIds,
      };
    }),

  /**
   * Fetch stock images (initial fetch or refresh)
   * Resets pagination and loads first page
   */
  fetchStockImages: async () => {
    const state = get();

    // Set loading state
    set({ stockStatus: 'loading', stockError: null });

    try {
      const result = await fetchStockImagesApi({
        category: state.selectedCategory,
        search: state.searchQuery.trim() || undefined,
        sort: state.sortMode,
        limit: 20,
      });

      // Handle error response
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

      // Success - set images
      set({
        stockImages: result.images,
        hasNextPage: result.hasNextPage,
        nextCursor: result.nextCursor ?? null,
        currentPage: 1,
        stockStatus: 'ready',
        stockError: null,
      });

      if (state.searchQuery.trim()) {
        trackStockSearchPerformed({
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

  /**
   * Fetch next page (infinite scroll)
   * Appends images to existing list
   */
  fetchNextPage: async () => {
    const state = get();

    // Guard: don't fetch if already loading or no next page
    if (state.stockStatus === 'loading' || !state.hasNextPage || !state.nextCursor) {
      return;
    }

    // Set loading state
    set({ stockStatus: 'loading' });

    try {
      const result = await fetchStockImagesApi({
        category: state.selectedCategory,
        search: state.searchQuery.trim() || undefined,
        sort: state.sortMode,
        limit: 20,
        cursor: state.nextCursor,
      });

      // Handle error response
      if ('error' in result) {
        set({
          stockStatus: 'error',
          stockError: result.error,
        });
        return;
      }

      // Success - append images
      set({
        stockImages: [...state.stockImages, ...result.images],
        hasNextPage: result.hasNextPage,
        nextCursor: result.nextCursor ?? null,
        currentPage: state.currentPage + 1,
        stockStatus: 'ready',
        stockError: null,
      });

      trackStockScrolled({
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

  /**
   * Retry fetch after error
   * Resets and fetches first page
   */
  retryFetch: async () => {
    get().fetchStockImages();
  },
  getActiveFilterCount: () => {
    const state = get();
    const accessCount = Object.values(state.accessFilters).filter(Boolean).length;
    const orientationCount = Object.values(state.orientationFilters).filter(Boolean).length;
    return accessCount + orientationCount;
  },
  hasActiveFilters: () => {
    const state = get();
    const accessChanged = Object.values(state.accessFilters).some((value) => !value);
    const orientationChanged = Object.values(state.orientationFilters).some((value) => !value);
    return accessChanged || orientationChanged;
  },
});
