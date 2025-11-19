import { shallow } from 'zustand/shallow';
import { useFounderStore, type FounderState } from '@/store/useFounderStore';

type StockLibraryModalSlice = Pick<
  FounderState,
  | 'stockLibraryModalOpen'
  | 'currentView'
  | 'openStockLibrary'
  | 'closeStockLibrary'
  | 'closeStockLibraryWithReason'
  | 'setView'
>;

type StockLibraryFilterSlice = Pick<
  FounderState,
  | 'selectedCategory'
  | 'searchQuery'
  | 'sortMode'
  | 'accessFilters'
  | 'orientationFilters'
  | 'setCategory'
  | 'setSearchQuery'
  | 'setSortMode'
  | 'toggleAccessFilter'
  | 'toggleOrientationFilter'
  | 'resetFilters'
  | 'hasActiveFilters'
>;

type StockLibraryPaginationSlice = Pick<
  FounderState,
  | 'stockImages'
  | 'stockStatus'
  | 'stockError'
  | 'hasNextPage'
  | 'fetchStockImages'
  | 'fetchNextPage'
  | 'retryFetch'
>;

type StockLibrarySelectionSlice = Pick<
  FounderState,
  | 'appliedStockImageId'
  | 'appliedStockImage'
  | 'applyStockImage'
  | 'clearAppliedStockImage'
  | 'continueWithStockImage'
>;

const useStockLibraryState = <Slice, Selected>(
  selector: (state: Slice) => Selected,
  equalityFn: (a: Selected, b: Selected) => boolean = shallow
) => useFounderStore((state) => selector(state as Slice), equalityFn);

export const useStockLibraryModal = () =>
  useStockLibraryState<
    StockLibraryModalSlice,
    {
      stockLibraryModalOpen: boolean;
      currentView: StockLibraryModalSlice['currentView'];
      openStockLibrary: StockLibraryModalSlice['openStockLibrary'];
      closeStockLibrary: StockLibraryModalSlice['closeStockLibrary'];
      closeStockLibraryWithReason: StockLibraryModalSlice['closeStockLibraryWithReason'];
      setView: StockLibraryModalSlice['setView'];
    }
  >((state) => ({
    stockLibraryModalOpen: state.stockLibraryModalOpen,
    currentView: state.currentView,
    openStockLibrary: state.openStockLibrary,
    closeStockLibrary: state.closeStockLibrary,
    closeStockLibraryWithReason: state.closeStockLibraryWithReason,
    setView: state.setView,
  }));

export const useStockLibraryFilters = () =>
  useStockLibraryState<
    StockLibraryFilterSlice,
    {
      selectedCategory: StockLibraryFilterSlice['selectedCategory'];
      searchQuery: StockLibraryFilterSlice['searchQuery'];
      sortMode: StockLibraryFilterSlice['sortMode'];
      accessFilters: StockLibraryFilterSlice['accessFilters'];
      orientationFilters: StockLibraryFilterSlice['orientationFilters'];
      setCategory: StockLibraryFilterSlice['setCategory'];
      setSearchQuery: StockLibraryFilterSlice['setSearchQuery'];
      setSortMode: StockLibraryFilterSlice['setSortMode'];
      toggleAccessFilter: StockLibraryFilterSlice['toggleAccessFilter'];
      toggleOrientationFilter: StockLibraryFilterSlice['toggleOrientationFilter'];
      resetFilters: StockLibraryFilterSlice['resetFilters'];
      hasActiveFilters: ReturnType<StockLibraryFilterSlice['hasActiveFilters']>;
      disabledFilterCount: number;
    }
  >((state) => {
    const disabledCount =
      Object.values(state.accessFilters).filter((value) => !value).length +
      Object.values(state.orientationFilters).filter((value) => !value).length;
    return {
      selectedCategory: state.selectedCategory,
      searchQuery: state.searchQuery,
      sortMode: state.sortMode,
      accessFilters: state.accessFilters,
      orientationFilters: state.orientationFilters,
      setCategory: state.setCategory,
      setSearchQuery: state.setSearchQuery,
      setSortMode: state.setSortMode,
      toggleAccessFilter: state.toggleAccessFilter,
      toggleOrientationFilter: state.toggleOrientationFilter,
      resetFilters: state.resetFilters,
      hasActiveFilters: state.hasActiveFilters(),
      disabledFilterCount: disabledCount,
    };
  });

export const useStockLibraryPagination = () =>
  useStockLibraryState<
    StockLibraryPaginationSlice,
    {
      stockImages: StockLibraryPaginationSlice['stockImages'];
      stockStatus: StockLibraryPaginationSlice['stockStatus'];
      stockError: StockLibraryPaginationSlice['stockError'];
      hasNextPage: StockLibraryPaginationSlice['hasNextPage'];
      fetchStockImages: StockLibraryPaginationSlice['fetchStockImages'];
      fetchNextPage: StockLibraryPaginationSlice['fetchNextPage'];
      retryFetch: StockLibraryPaginationSlice['retryFetch'];
    }
  >((state) => ({
    stockImages: state.stockImages,
    stockStatus: state.stockStatus,
    stockError: state.stockError,
    hasNextPage: state.hasNextPage,
    fetchStockImages: state.fetchStockImages,
    fetchNextPage: state.fetchNextPage,
    retryFetch: state.retryFetch,
  }));

export const useStockSelection = () =>
  useStockLibraryState<
    StockLibrarySelectionSlice,
    {
      appliedStockImageId: StockLibrarySelectionSlice['appliedStockImageId'];
      appliedStockImage: StockLibrarySelectionSlice['appliedStockImage'];
      applyStockImage: StockLibrarySelectionSlice['applyStockImage'];
      clearAppliedStockImage: StockLibrarySelectionSlice['clearAppliedStockImage'];
      continueWithStockImage: StockLibrarySelectionSlice['continueWithStockImage'];
    }
  >((state) => ({
    appliedStockImageId: state.appliedStockImageId,
    appliedStockImage: state.appliedStockImage,
    applyStockImage: state.applyStockImage,
    clearAppliedStockImage: state.clearAppliedStockImage,
    continueWithStockImage: state.continueWithStockImage,
  }));
