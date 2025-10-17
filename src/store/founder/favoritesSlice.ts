import type { StateCreator } from 'zustand';
import type { FounderState } from '../useFounderStore';

export type FavoritesSlice = {
  favoriteStyles: string[];
  toggleFavoriteStyle: (styleId: string) => void;
  isStyleFavorite: (styleId: string) => boolean;
  setFavoriteStyles: (styleIds: string[]) => void;
  clearFavoriteStyles: () => void;
};

const normalizeList = (ids: string[]): string[] => {
  const seen = new Set<string>();
  const normalized: string[] = [];
  ids.forEach((id) => {
    const trimmed = id.trim().toLowerCase();
    if (!trimmed) return;
    if (seen.has(trimmed)) return;
    seen.add(trimmed);
    normalized.push(trimmed);
  });
  return normalized;
};

export const createFavoritesSlice: StateCreator<FounderState, [], [], FavoritesSlice> = (set, get) => ({
  favoriteStyles: [],
  toggleFavoriteStyle: (styleId) => {
    const normalized = styleId.trim().toLowerCase();
    if (!normalized) return;
    const current = get().favoriteStyles;
    if (current.includes(normalized)) {
      set({ favoriteStyles: current.filter((id) => id !== normalized) });
    } else {
      set({ favoriteStyles: [...current, normalized] });
    }
  },
  isStyleFavorite: (styleId) => {
    const normalized = styleId.trim().toLowerCase();
    return get().favoriteStyles.includes(normalized);
  },
  setFavoriteStyles: (styleIds) => {
    set({ favoriteStyles: normalizeList(styleIds) });
  },
  clearFavoriteStyles: () => {
    set({ favoriteStyles: [] });
  },
});
