import { createWithEqualityFn } from 'zustand/traditional';
import { CANVAS_SIZE_OPTIONS, getCanvasSizeOption, getDefaultSizeForOrientation } from '@/utils/canvasSizes';
import {
  trackStudioV2CanvasModalClose,
  trackStudioV2CanvasModalOpen,
  type CanvasSelectionSnapshot,
} from '@/utils/studioV2Analytics';
import { trackCanvasPanelOpen } from '@/utils/telemetry';
import { loadInitialStylesLazy } from '@/config/styleCatalog';
import { createPreviewSlice } from './founder/previewSlice';
import { createAuthSlice } from './founder/authSlice';
import { createFavoritesSlice } from './founder/favoritesSlice';
import { createGallerySlice } from './founder/gallerySlice';
import { createStockLibrarySlice } from './founder/stockLibrarySlice';
import type { CanvasSize, Enhancement, FounderBaseState, FounderState, StyleCarouselCard, StyleOption } from './founder/storeTypes';
import { createMemoizedSelector } from './utils/memo';
import { createLazySliceAccessor } from './utils/createLazySliceAccessor';

export type {
  AuthSlice,
  CanvasModalCloseReason,
  CanvasModalSource,
  CanvasSelection,
  CanvasSize,
  Enhancement,
  EntitlementPriority,
  EntitlementState,
  EntitlementTier,
  FavoritesSlice,
  FounderBaseState,
  FounderState,
  FrameColor,
  SessionUser,
  StockCategory,
  StockImage,
  StockLibrarySlice,
  StockLibraryStatus,
  StockLibraryView,
  StyleCarouselCard,
  StyleOption,
  StylePreviewStatus,
} from './founder/storeTypes';

/**
 * TESTING MODE FLAG
 * Set to `false` to disable automatic preview generation (saves API costs during testing)
 * Set to `true` to enable automatic preview generation (production behavior)
 *
 * When disabled, previews only generate when user manually clicks a style in Studio
 */
const ENABLE_AUTO_PREVIEWS = false;
const DEFAULT_SQUARE_SIZE = getDefaultSizeForOrientation('square');
const DEFAULT_SQUARE_PRICE = getCanvasSizeOption(DEFAULT_SQUARE_SIZE)?.price ?? 0;

const createCanvasSelectionSnapshot = (state: FounderBaseState): CanvasSelectionSnapshot => {
  const enabledEnhancements = state.enhancements
    .filter((item) => item.enabled)
    .map((item) => item.id);

  return {
    canvasSize: state.selectedCanvasSize,
    frame: state.selectedFrame,
    enhancements: enabledEnhancements,
    orientation: state.orientation,
  };
};

// NEW: Use lazy loading - only load IDs and names initially
// Full details (thumbnails, descriptions) loaded on-demand via ensureStyleLoaded()
const initialStyles: StyleOption[] = loadInitialStylesLazy();
const styleCatalogEngineAccessor = createLazySliceAccessor(() =>
  import('./founder/optional/styleCatalogEngine')
);

const selectCurrentStyle = createMemoizedSelector(
  (styles: StyleOption[], selectedStyleId: string | null | undefined) => {
    if (!selectedStyleId) {
      return undefined;
    }
    return styles.find((style) => style.id === selectedStyleId);
  }
);


const mockEnhancements: Enhancement[] = [
  {
    id: 'floating-frame',
    name: 'Floating Frame',
    description: 'Premium walnut frame that arrives ready to hang.',
    price: 29,
    enabled: false,
  },
  {
    id: 'living-canvas',
    name: 'Living Canvas AR',
    description: 'Attach a 30s video story that plays back when scanned.',
    price: 59.99,
    enabled: false,
  },
  {
    id: 'digital-bundle',
    name: 'Canvas + Digital Bundle',
    description: 'Instant HD download while you wait for delivery.',
    price: 14.99,
    enabled: false,
  },
];

const mockCarouselData: StyleCarouselCard[] = [
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    resultImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    description: 'Soft, dreamy watercolor aesthetic',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'neon-bloom',
    name: 'Neon Bloom',
    resultImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    description: 'Electric palettes and bloom edges',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'monochrome-muse',
    name: 'Monochrome Muse',
    resultImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    description: 'Cinematic black & white portraiture',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'oil-paint-classic',
    name: 'Oil Paint Classic',
    resultImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80',
    description: 'Traditional oil painting texture',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'charcoal-sketch',
    name: 'Charcoal Sketch',
    resultImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    description: 'Hand-drawn charcoal artistry',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'abstract-fusion',
    name: 'Abstract Fusion',
    resultImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=400&q=80',
    description: 'Bold geometric abstraction',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'pastel-serenade',
    name: 'Pastel Serenade',
    resultImage: 'https://images.unsplash.com/photo-1520690214124-2405f0ec57cc?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    description: 'Gentle color washes with soft grain highlights',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'golden-hour-glow',
    name: 'Golden Hour Glow',
    resultImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=400&q=80',
    description: 'Sun-kissed highlights with cinematic warmth',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'noir-dreamscape',
    name: 'Noir Dreamscape',
    resultImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=400&q=80',
    description: 'Moody monochrome with sculpted lighting',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'midnight-spectrum',
    name: 'Midnight Spectrum',
    resultImage: 'https://images.unsplash.com/photo-1522098635831-696873ac66c1?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
    description: 'Deep blues with neon light trails',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'vintage-mosaic',
    name: 'Vintage Mosaic',
    resultImage: 'https://images.unsplash.com/photo-1545239351-77ee02f37f43?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1504197885-609741792ce7?auto=format&fit=crop&w=400&q=80',
    description: 'Textured collage with rich film tones',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'celestial-ink',
    name: 'Celestial Ink',
    resultImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    description: 'Starry gradients with inky depth',
    ctaLabel: 'Try This Style →',
  },
  {
    id: 'garden-lux',
    name: 'Garden Lux',
    resultImage: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=400&q=80',
    originalImage: 'https://images.unsplash.com/photo-1504196605672-7ad8e5d7e8f9?auto=format&fit=crop&w=400&q=80',
    description: 'Lush florals with painterly highlights',
    ctaLabel: 'Try This Style →',
  },
];

export const useFounderStore = createWithEqualityFn<FounderState>((set, get, api) => ({
  styles: initialStyles,
  enhancements: mockEnhancements,
  selectedStyleId: null,
  basePrice: DEFAULT_SQUARE_PRICE,
  livingCanvasModalOpen: false,
  uploadedImage: null,
  croppedImage: null,
  currentImageHash: null,
  orientation: 'square',
  orientationTip: null,
  cropReadyAt: null,
  isDragging: false,
  celebrationAt: null,
  styleCarouselData: mockCarouselData,
  hoveredStyleId: null,
  preselectedStyleId: null,
  launchpadExpanded: false,
  launchpadSlimMode: false,
  uploadIntentAt: null,
  originalImage: null,
  originalImageDimensions: null,
  originalImageStoragePath: null,
  originalImagePublicUrl: null,
  originalImageSignedUrl: null,
  originalImageSignedUrlExpiresAt: null,
  originalImageHash: null,
  originalImageBytes: null,
  originalImagePreviewLogId: null,
  smartCrops: {},
  loadedStyleIds: new Set<string>(),
  pendingStyleLoads: new Map<string, Promise<void>>(),
  orientationChanging: false,
  orientationPreviewPending: false,
  setOrientationChanging: (loading) => set({ orientationChanging: loading }),
  setOrientationPreviewPending: (pending) => set({ orientationPreviewPending: pending }),
  setLaunchpadExpanded: (expanded) => set({ launchpadExpanded: expanded }),
  setLaunchpadSlimMode: (slim) => set({ launchpadSlimMode: slim }),
  selectedCanvasSize: null,
  setCanvasSize: (size) => {
    set({ selectedCanvasSize: size });
    get().persistCanvasSelection();
  },
  selectedFrame: 'none',
  setFrame: (frame) => {
    set({ selectedFrame: frame });
    get().persistCanvasSelection();
  },
  canvasModalOpen: false,
  canvasModalSource: null,
  canvasModalOpenedAt: null,
  lastCanvasModalSource: null,
  canvasSelections: {},
  selectStyle: (id) => {
    const state = get();
    if (state.selectedStyleId) {
      state.persistCanvasSelection();
    }
    if (state.canvasModalOpen) {
      state.closeCanvasModal('cancel');
    }
    set({ selectedStyleId: id });
    get().loadCanvasSelectionForStyle(id);
  },
  clearSelectedStyle: () => {
    const state = get();
    if (state.selectedStyleId) {
      state.persistCanvasSelection();
    }
    set({ selectedStyleId: null });
  },
  toggleEnhancement: (id) => {
    set((state) => {
      const enhancements = state.enhancements.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      );
      const livingCanvasEnabled = enhancements.find((item) => item.id === 'living-canvas')?.enabled ?? false;
      return {
        enhancements,
        livingCanvasModalOpen: livingCanvasEnabled ? false : state.livingCanvasModalOpen,
      };
    });
    get().persistCanvasSelection();
  },
  setEnhancementEnabled: (id, enabled) => {
    set((state) => ({
      enhancements: state.enhancements.map((item) =>
        item.id === id ? { ...item, enabled } : item
      ),
      livingCanvasModalOpen: id === 'living-canvas' && enabled ? false : state.livingCanvasModalOpen,
    }));
    get().persistCanvasSelection();
  },
  persistCanvasSelection: () => {
    const state = get();
    const styleId = state.selectedStyleId;
    if (!styleId) return;
    const snapshot = createCanvasSelectionSnapshot(state);
    set({
      canvasSelections: {
        ...state.canvasSelections,
        [styleId]: {
          size: (snapshot.canvasSize as CanvasSize | null),
          frame: snapshot.frame,
          enhancements: [...snapshot.enhancements],
        },
      },
    });
  },
  loadCanvasSelectionForStyle: (styleId) => {
    if (!styleId) return;
    const state = get();
    const selection = state.canvasSelections[styleId];
    const defaultSize = getDefaultSizeForOrientation(state.orientation);
    const nextSize = selection?.size ?? defaultSize;
    const nextFrame = selection?.frame ?? 'none';
    const enabledIds = new Set(selection?.enhancements ?? []);

    const enhancements = state.enhancements.map((item) => ({
      ...item,
      enabled: enabledIds.has(item.id),
    }));

    const update: Partial<FounderBaseState> = {
      selectedCanvasSize: nextSize,
      selectedFrame: nextFrame,
      enhancements,
    };

    if (!selection) {
      (update as Partial<FounderBaseState>).canvasSelections = {
        ...state.canvasSelections,
        [styleId]: {
          size: nextSize,
          frame: nextFrame,
          enhancements: Array.from(enabledIds),
        },
      };
    }

    set(update);
  },
  openCanvasModal: (source) => {
    const state = get();
    if (!state.croppedImage) return;
    const style = state.currentStyle();
    if (!style) return;
    state.loadCanvasSelectionForStyle(style.id);
    state.persistCanvasSelection();
    if (state.canvasModalOpen) return;
    const snapshot = createCanvasSelectionSnapshot(state);
    trackCanvasPanelOpen(state.entitlements?.tier ?? 'unknown');
    set({
      canvasModalOpen: true,
      canvasModalSource: source,
      canvasModalOpenedAt: Date.now(),
      lastCanvasModalSource: source,
    });
    trackStudioV2CanvasModalOpen({
      styleId: style.id,
      sourceCTA: source,
      canvasSize: snapshot.canvasSize,
      frame: snapshot.frame,
      enhancements: snapshot.enhancements,
      orientation: snapshot.orientation,
    });
  },
  closeCanvasModal: (reason) => {
    const state = get();
    if (!state.canvasModalOpen) return;
    const style = state.currentStyle();
    const snapshot = createCanvasSelectionSnapshot(state);
    const openedAt = state.canvasModalOpenedAt ?? Date.now();
    set({
      canvasModalOpen: false,
      canvasModalSource: null,
      canvasModalOpenedAt: null,
    });
    if (style) {
      trackStudioV2CanvasModalClose({
        styleId: style.id,
        reason,
        timeSpentMs: Math.max(0, Date.now() - openedAt),
        configuredItems: snapshot,
      });
    }
  },
  ...createPreviewSlice(initialStyles)(set, get, api),
  ...createAuthSlice(set, get, api),
  ...createGallerySlice(set, get, api),
  ...createStockLibrarySlice(set, get, api),
  setSmartCropForOrientation: (orientation, result) =>
    set((state) => ({
      smartCrops: {
        ...state.smartCrops,
        [orientation]: result,
      },
    })),
  clearSmartCrops: () => set({ smartCrops: {} }),
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
  setLivingCanvasModalOpen: (open) => set({ livingCanvasModalOpen: open }),
  setUploadedImage: (dataUrl) =>
    set({
      uploadedImage: dataUrl,
      currentImageHash: null,
      pendingStyleId: null,
      stylePreviewStatus: 'idle',
      stylePreviewMessage: null,
      stylePreviewError: null,
      stylePreviewStartAt: null,
      orientationPreviewPending: false,
      launchpadExpanded: true,
      ...(dataUrl === null
        ? {
            originalImageStoragePath: null,
            originalImagePublicUrl: null,
            originalImageSignedUrl: null,
            originalImageSignedUrlExpiresAt: null,
            originalImageHash: null,
            originalImageBytes: null,
          }
        : {}),
    }),
  setCroppedImage: (dataUrl) =>
    set({
      croppedImage: dataUrl,
      currentImageHash: null,
      launchpadSlimMode: !!dataUrl,
    }),
  setOriginalImage: (dataUrl) =>
    set({
      originalImage: dataUrl,
      originalImagePreviewLogId: null,
      ...(dataUrl === null
        ? {
            originalImageStoragePath: null,
            originalImagePublicUrl: null,
            originalImageSignedUrl: null,
            originalImageSignedUrlExpiresAt: null,
            originalImageHash: null,
            originalImageBytes: null,
          }
        : {}),
    }),
  setOriginalImageDimensions: (dimensions) => set({ originalImageDimensions: dimensions }),
  setOriginalImageSource: (payload) =>
    set({
      originalImageStoragePath: payload?.storagePath ?? null,
      originalImagePublicUrl: payload?.publicUrl ?? null,
      originalImageSignedUrl: payload?.signedUrl ?? null,
      originalImageSignedUrlExpiresAt: payload?.signedUrlExpiresAt ?? null,
      originalImageHash: payload?.hash ?? null,
      originalImageBytes: payload?.bytes ?? null,
    }),
  setOriginalImagePreviewLogId: (previewLogId) => set({ originalImagePreviewLogId: previewLogId }),
  setOrientation: (orientation) => {
    const current = get();
    if (current.orientation === orientation) return;

    const availableOptions = CANVAS_SIZE_OPTIONS[orientation];
    const hasCurrentSize = current.selectedCanvasSize
      ? availableOptions.some((option) => option.id === current.selectedCanvasSize)
      : false;

    const nextCanvasSize = hasCurrentSize ? current.selectedCanvasSize : null;

    set({ orientation, selectedCanvasSize: nextCanvasSize });

    const updated = get();
    if (updated.pendingStyleId) return;

    const styleId = updated.selectedStyleId;
    if (!styleId) {
      set({ orientationPreviewPending: false });
      return;
    }

    if (styleId === 'original-image') {
      const source = updated.croppedImage ?? updated.uploadedImage;
      if (source) {
        const timestamp = Date.now();
        updated.setPreviewState(styleId, {
          status: 'ready',
          data: {
            previewUrl: source,
            watermarkApplied: false,
            startedAt: timestamp,
            completedAt: timestamp,
          },
          orientation,
        });
      }
      set({ orientationPreviewPending: false });
      return;
    }

    set({ orientationPreviewPending: true });
  },
  setOrientationTip: (tip) => set({ orientationTip: tip }),
  markCropReady: () =>
    set((state) => ({
      cropReadyAt: Date.now(),
      launchpadSlimMode: true,
      launchpadExpanded: state.launchpadExpanded,
    })),
  setDragging: (isDragging) => set({ isDragging }),
  computedTotal: () => {
    const { enhancements, styles, selectedStyleId, selectedCanvasSize } = get();
    const styleMod = styles.find((style) => style.id === selectedStyleId)?.priceModifier ?? 0;
    const sizePrice = getCanvasSizeOption(selectedCanvasSize)?.price;
    const enhancementsTotal = enhancements
      .filter((item) => item.enabled)
      .reduce((sum, item) => sum + item.price, 0);
    return (sizePrice ?? 0) + styleMod + enhancementsTotal;
  },
  currentStyle: () => {
    const state = get();
    return selectCurrentStyle(state.styles, state.selectedStyleId);
  },
  livingCanvasEnabled: () => get().enhancements.find((item) => item.id === 'living-canvas')?.enabled ?? false,
  shouldAutoGeneratePreviews: () => {
    return ENABLE_AUTO_PREVIEWS;
  },
  setCurrentImageHash: (hash) => set({ currentImageHash: hash }),
  ensureStyleLoaded: async (styleId: string) => {
    const module = await styleCatalogEngineAccessor.load();
    const runtime = { set, get };
    set(() => ({
      ensureStyleLoaded: (id: string) => module.ensureStyleLoaded(runtime, id),
      ensureStylesLoaded: (ids: string[]) => module.ensureStylesLoaded(runtime, ids),
    }));
    return module.ensureStyleLoaded(runtime, styleId);
  },
  ensureStylesLoaded: async (styleIds: string[]) => {
    const module = await styleCatalogEngineAccessor.load();
    const runtime = { set, get };
    set(() => ({
      ensureStyleLoaded: (id: string) => module.ensureStyleLoaded(runtime, id),
      ensureStylesLoaded: (ids: string[]) => module.ensureStylesLoaded(runtime, ids),
    }));
    await module.ensureStylesLoaded(runtime, styleIds);
  },
  restoreOriginalImagePreview: (styleId = null) => {
    const state = get();
    const source = state.originalImage ?? state.croppedImage ?? state.uploadedImage;
    if (!source) {
      return false;
    }

    if (styleId) {
      state.setPreviewState(styleId, { status: 'idle' });
    }

    if (state.selectedStyleId !== 'original-image') {
      state.selectStyle('original-image');
    }

    const timestamp = Date.now();
    state.setPreviewState('original-image', {
      status: 'ready',
      data: {
        previewUrl: source,
        watermarkApplied: false,
        startedAt: timestamp,
        completedAt: timestamp,
      },
      orientation: state.orientation,
    });

    set({
      pendingStyleId: null,
      previewStatus: 'ready',
      stylePreviewStatus: 'idle',
      stylePreviewMessage: null,
      stylePreviewError: null,
      stylePreviewStartAt: null,
      orientationPreviewPending: false,
    });

    return true;
  },
  resetPreviewToEmptyState: (styleId = null) => {
    const state = get();
    if (styleId) {
      state.setPreviewState(styleId, { status: 'idle' });
    }
    state.setPreviewState('original-image', { status: 'idle' });

    state.clearSmartCrops();
    state.setOriginalImageSource(null);
    state.setOriginalImageDimensions(null);
    state.setOriginalImage(null);
    state.setCroppedImage(null);
    state.setUploadedImage(null);

    set({
      selectedStyleId: null,
      pendingStyleId: null,
      previewStatus: 'idle',
      stylePreviewStatus: 'idle',
      stylePreviewMessage: null,
      stylePreviewError: null,
      stylePreviewStartAt: null,
      orientationPreviewPending: false,
      launchpadSlimMode: false,
    });
  },
  ...createFavoritesSlice(set, get, api),
}));
