import { type StateCreator } from 'zustand';
import type { FounderState, StockLibrarySlice } from '@/store/founder/storeTypes';

export type StockLibrarySliceCreator = (
  set: Parameters<StateCreator<FounderState, [], [], StockLibrarySlice>>[0],
  get: Parameters<StateCreator<FounderState, [], [], StockLibrarySlice>>[1]
) => Partial<StockLibrarySlice>;
