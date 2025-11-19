import { loadPersistedFilters, persistFilters } from '@/utils/stockLibrary/filterPersistence';
import type { StockLibrarySliceCreator } from '@/store/founder/slices/stockLibrary/types';

const persistedFilters = loadPersistedFilters();

export const createStockLibraryFiltersSlice: StockLibrarySliceCreator = (set, get) => ({
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
  setCategory: (category) =>
    set((state) => {
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
  setSearchQuery: (query) =>
    set((state) => {
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
  setSortMode: (mode) =>
    set((state) => {
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
  hasActiveFilters: () => {
    const state = get();
    const accessChanged = Object.values(state.accessFilters).some((value) => !value);
    const orientationChanged = Object.values(state.orientationFilters).some((value) => !value);
    return accessChanged || orientationChanged;
  },
  getActiveFilterCount: () => {
    const state = get();
    const accessCount = Object.values(state.accessFilters).filter(Boolean).length;
    const orientationCount = Object.values(state.orientationFilters).filter(Boolean).length;
    return accessCount + orientationCount;
  },
});
