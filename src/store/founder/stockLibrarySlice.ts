/**
 * Stock Library Slice
 *
 * Orchestrates the stock modal (view switching, filters, pagination, selection).
 * Implementation is split across dedicated slice files; see docs/STOCK_LIBRARY_SLICE_RESEARCH.md
 * for responsibilities before modifying any state or telemetry behavior.
 */

import type { StateCreator } from 'zustand';
import type { FounderState, StockLibrarySlice } from './storeTypes';
import { createStockLibraryModalSlice } from '@/store/founder/slices/stockLibrary/modalSlice';
import { createStockLibraryFiltersSlice } from '@/store/founder/slices/stockLibrary/filtersSlice';
import { createStockLibraryPaginationSlice } from '@/store/founder/slices/stockLibrary/paginationSlice';
import { createStockLibrarySelectionSlice } from '@/store/founder/slices/stockLibrary/selectionSlice';

export const createStockLibrarySlice: StateCreator<FounderState, [], [], StockLibrarySlice> = (
  set,
  get
) => {
  const modalSlice = createStockLibraryModalSlice(set, get);
  const filtersSlice = createStockLibraryFiltersSlice(set, get);
  const paginationSlice = createStockLibraryPaginationSlice(set, get);
  const selectionSlice = createStockLibrarySelectionSlice(set, get);

  return {
    ...modalSlice,
    ...filtersSlice,
    ...paginationSlice,
    ...selectionSlice,
  } as StockLibrarySlice;
};
