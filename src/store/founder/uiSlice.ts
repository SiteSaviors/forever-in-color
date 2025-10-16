import type { StateCreator } from 'zustand';
import type { FounderState, StyleOption } from '../useFounderStore';

export type UiSlice = {
  livingCanvasModalOpen: boolean;
  styleCarouselData: StyleOption[];
  hoveredStyleId: string | null;
  preselectedStyleId: string | null;
  launchpadExpanded: boolean;
  launchpadSlimMode: boolean;
  celebrationAt: number | null;
  uploadIntentAt: number | null;
  setLivingCanvasModalOpen: (open: boolean) => void;
  setHoveredStyle: (id: string | null) => void;
  setPreselectedStyle: (id: string | null) => void;
  requestUpload: (options?: { preselectedStyleId?: string }) => void;
};

export const createUiSlice = (
  initialStyles: StyleOption[]
): StateCreator<FounderState, [], [], UiSlice> => (set, _get) => ({
  livingCanvasModalOpen: false,
  styleCarouselData: initialStyles,
  hoveredStyleId: null,
  preselectedStyleId: null,
  launchpadExpanded: false,
  launchpadSlimMode: false,
  celebrationAt: null,
  uploadIntentAt: null,
  setLivingCanvasModalOpen: (open) => set({ livingCanvasModalOpen: open }),
  setHoveredStyle: (id) => set({ hoveredStyleId: id ?? null }),
  setPreselectedStyle: (id) =>
    set((state) => {
      if (!id) {
        return {
          preselectedStyleId: null,
        };
      }

      const normalized = id.trim().toLowerCase();
      const matchingStyle = state.styles.find((style) => style.id === normalized);

      return {
        preselectedStyleId: matchingStyle ? matchingStyle.id : normalized,
        selectedStyleId: matchingStyle ? matchingStyle.id : state.selectedStyleId,
      };
    }),
  requestUpload: (options) =>
    set((state) => {
      const now = Date.now();
      const timestamp = state.uploadIntentAt && state.uploadIntentAt >= now ? state.uploadIntentAt + 1 : now;
      const next: Partial<FounderState> = {
        uploadIntentAt: timestamp,
        launchpadExpanded: true,
      };

      const desiredStyleId = options?.preselectedStyleId?.trim().toLowerCase();
      if (desiredStyleId) {
        const matchingStyle = state.styles.find((style) => style.id === desiredStyleId);
        if (matchingStyle) {
          next.preselectedStyleId = matchingStyle.id;
          next.selectedStyleId = matchingStyle.id;
        } else {
          next.preselectedStyleId = desiredStyleId;
        }
      }

      return next;
    }),
});
