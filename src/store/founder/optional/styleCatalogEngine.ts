import { loadStyleCatalogEntry, mergeStyleSnapshot } from '@/config/styleCatalog';
import type { FounderState, StyleOption } from '../storeTypes';

type StyleCatalogRuntime = {
  set: (
    partial: Partial<FounderState> | ((state: FounderState) => Partial<FounderState>),
    replace?: boolean
  ) => void;
  get: () => FounderState;
};

export const ensureStyleLoaded = async (
  runtime: StyleCatalogRuntime,
  styleId: string
): Promise<StyleOption | null> => {
  const { get, set } = runtime;
  const state = get();

  if (state.loadedStyleIds.has(styleId)) {
    return state.styles.find((s) => s.id === styleId) ?? null;
  }

  if (state.pendingStyleLoads.has(styleId)) {
    await state.pendingStyleLoads.get(styleId);
    return runtime.get().styles.find((s) => s.id === styleId) ?? null;
  }

  const loadPromise = (async () => {
    try {
      const catalogEntry = await loadStyleCatalogEntry(styleId);
      if (!catalogEntry) {
        console.warn(`[ensureStyleLoaded] Style not found: ${styleId}`);
        return;
      }

      set((current) => {
        const updatedStyles = current.styles.map((s) =>
          s.id === styleId ? mergeStyleSnapshot(s, catalogEntry) : s
        );
        const updatedLoadedIds = new Set(current.loadedStyleIds);
        updatedLoadedIds.add(styleId);

        return {
          styles: updatedStyles,
          loadedStyleIds: updatedLoadedIds,
        };
      });
    } catch (error) {
      console.error(`[ensureStyleLoaded] Failed to load style ${styleId}:`, error);
    } finally {
      set((current) => {
        const updatedPendingLoads = new Map(current.pendingStyleLoads);
        updatedPendingLoads.delete(styleId);
        return { pendingStyleLoads: updatedPendingLoads };
      });
    }
  })();

  set((current) => ({
    pendingStyleLoads: new Map(current.pendingStyleLoads).set(styleId, loadPromise),
  }));

  await loadPromise;
  return runtime.get().styles.find((s) => s.id === styleId) ?? null;
};

export const ensureStylesLoaded = async (
  runtime: StyleCatalogRuntime,
  styleIds: string[]
): Promise<void> => {
  await Promise.all(styleIds.map((id) => ensureStyleLoaded(runtime, id)));
};
