import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { Orientation } from '@/utils/imageUtils';
import type { StylePreviewCacheEntry } from '@/store/founder/storeTypes';

type PreviewCacheMap = Record<string, Partial<Record<Orientation, StylePreviewCacheEntry>>>;

type CacheMetrics = {
  hits: number;
  misses: number;
  evictions: number;
};

type PreviewCacheState = {
  cache: PreviewCacheMap;
  order: string[];
  metrics: CacheMetrics;
  setEntry: (styleId: string, entry: StylePreviewCacheEntry) => void;
  getEntry: (styleId: string, orientation: Orientation) => StylePreviewCacheEntry | undefined;
  hasEntry: (styleId: string, orientation: Orientation) => boolean;
  deleteEntriesForStyle: (styleId: string) => void;
  clear: () => void;
};

export const PREVIEW_CACHE_LIMIT = 50;

const shouldLogMetrics = () =>
  typeof window !== 'undefined' &&
  (import.meta.env?.DEV || (window as typeof window & { DEBUG_PREVIEW_CACHE?: boolean }).DEBUG_PREVIEW_CACHE);

const logCacheMetrics = (metrics: CacheMetrics) => {
  if (!shouldLogMetrics()) {
    return;
  }

  const totalLookups = metrics.hits + metrics.misses;
  const hitRate = totalLookups > 0 ? Number(((metrics.hits / totalLookups) * 100).toFixed(1)) : 0;
  console.info(
    `[PreviewCache] hits=${metrics.hits} misses=${metrics.misses} evictions=${metrics.evictions} hitRate=${hitRate}%`
  );
};

export const previewCacheStore = createStore<PreviewCacheState>()((set, get) => ({
  cache: {},
  order: [],
  metrics: {
    hits: 0,
    misses: 0,
    evictions: 0,
  },
  setEntry: (styleId, entry) => {
    set((state) => {
      const key = `${styleId}:${entry.orientation}`;
      const nextOrder = state.order.filter((value) => value !== key);
      nextOrder.push(key);

      const nextCache: PreviewCacheMap = { ...state.cache };
      const existingByStyle = { ...(nextCache[styleId] ?? {}) };
      existingByStyle[entry.orientation] = entry;
      nextCache[styleId] = existingByStyle;

      const nextMetrics: CacheMetrics = { ...state.metrics };

      while (nextOrder.length > PREVIEW_CACHE_LIMIT) {
        const oldestKey = nextOrder.shift();
        if (!oldestKey) break;
        const [oldStyleId, rawOrientation] = oldestKey.split(':') as [string, Orientation];
        const styleCache = nextCache[oldStyleId];
        if (styleCache && styleCache[rawOrientation]) {
          delete styleCache[rawOrientation];
          if (Object.keys(styleCache).length === 0) {
            delete nextCache[oldStyleId];
          } else {
            nextCache[oldStyleId] = styleCache;
          }
          nextMetrics.evictions += 1;
        }
      }

      if (shouldLogMetrics()) {
        logCacheMetrics(nextMetrics);
      }

      return {
        cache: nextCache,
        order: nextOrder,
        metrics: nextMetrics,
      };
    });
  },
  getEntry: (styleId, orientation) => {
    const entry = get().cache[styleId]?.[orientation];
    set((state) => {
      const nextMetrics: CacheMetrics = { ...state.metrics };
      if (entry) {
        nextMetrics.hits += 1;
      } else {
        nextMetrics.misses += 1;
      }

      if (shouldLogMetrics() && (nextMetrics.hits + nextMetrics.misses) % 10 === 0) {
        logCacheMetrics(nextMetrics);
      }

      return {
        metrics: nextMetrics,
      };
    });

    return entry;
  },
  hasEntry: (styleId, orientation) => Boolean(get().cache[styleId]?.[orientation]),
  deleteEntriesForStyle: (styleId) => {
    set((state) => {
      if (!state.cache[styleId]) {
        return state;
      }

      const nextCache: PreviewCacheMap = { ...state.cache };
      delete nextCache[styleId];

      const prefix = `${styleId}:`;
      const nextOrder = state.order.filter((value) => !value.startsWith(prefix));

      return {
        cache: nextCache,
        order: nextOrder,
      };
    });
  },
  clear: () => {
    set({
      cache: {},
      order: [],
      metrics: {
        hits: 0,
        misses: 0,
        evictions: 0,
      },
    });
  },
}));

export const getPreviewCacheStore = () => previewCacheStore;

export const usePreviewCacheStore = <T,>(
  selector: (state: PreviewCacheState) => T,
  equalityFn?: (a: T, b: T) => boolean
) => useStore(previewCacheStore, selector, equalityFn);

export const cachePreviewEntry = (styleId: string, entry: StylePreviewCacheEntry) =>
  previewCacheStore.getState().setEntry(styleId, entry);

export const getCachedPreviewEntry = (styleId: string, orientation: Orientation) =>
  previewCacheStore.getState().getEntry(styleId, orientation);

export const hasCachedPreviewEntry = (styleId: string, orientation: Orientation) =>
  previewCacheStore.getState().hasEntry(styleId, orientation);

export const deletePreviewCacheEntries = (styleId: string | null) => {
  if (!styleId) return;
  previewCacheStore.getState().deleteEntriesForStyle(styleId);
};

export const clearPreviewCache = () => previewCacheStore.getState().clear();

export const usePreviewCacheEntry = (styleId: string | null, orientation: Orientation | null) =>
  usePreviewCacheStore((state) =>
    styleId && orientation ? state.cache[styleId]?.[orientation] ?? null : null
  );

export const useHasCachedPreviewEntry = (styleId: string | null, orientation: Orientation | null) =>
  usePreviewCacheStore((state) =>
    styleId && orientation ? Boolean(state.cache[styleId]?.[orientation]) : false
  );
