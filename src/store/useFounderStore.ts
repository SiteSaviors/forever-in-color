import { createWithEqualityFn } from 'zustand/traditional';
import { getCanvasSizeOption, getDefaultSizeForOrientation } from '@/utils/canvasSizes';
import { loadInitialStylesLazy } from '@/config/styleCatalog';
import { createPreviewSlice } from './founder/previewSlice';
import { createAuthSlice } from './founder/authSlice';
import { createFavoritesSlice } from './founder/favoritesSlice';
import { createGallerySlice } from './founder/gallerySlice';
import { createStockLibrarySlice } from './founder/stockLibrarySlice';
import { createCanvasConfigSlice } from '@/store/founder/slices/canvas/canvasConfigSlice';
import { createCanvasModalSlice } from '@/store/founder/slices/canvas/canvasModalSlice';
import { createUploadPipelineSlice } from '@/store/founder/slices/canvas/uploadPipelineSlice';
import type { Enhancement, FounderState, StyleCarouselCard, StyleOption } from './founder/storeTypes';
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

// NEW: Use lazy loading - only load IDs and names initially
// Full details (thumbnails, descriptions) loaded on-demand via ensureStyleLoaded()
const initialStyles: StyleOption[] = loadInitialStylesLazy();
const styleCatalogEngineAccessor = createLazySliceAccessor(() =>
  import('./founder/optional/styleCatalogEngine')
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

/**
 * Founder Store (monolithic for now)
 *
 * NOTE: Sections are annotated to guide the canvas store refactor (see docs/FOUNDER_STORE_RESEARCH.md).
 *  - Canvas Config Core (Phase 3.1 target)
 *  - Canvas Modal Lifecycle (Phase 3.2 target)
 *  - Upload / Orientation Pipeline (Phase 3.3 target)
 */
export const useFounderStore = createWithEqualityFn<FounderState>((set, get, api) => ({
  // ── Canvas Config Core (Phase 3.1 extraction candidate) ────────────────────────
  styles: initialStyles,
  ...createCanvasConfigSlice(mockEnhancements)(set, get, api),
  ...createCanvasModalSlice(set, get, api),
  ...createUploadPipelineSlice(set, get, api),
  basePrice: DEFAULT_SQUARE_PRICE,
  livingCanvasModalOpen: false,
  celebrationAt: null,
  styleCarouselData: mockCarouselData,
  hoveredStyleId: null,
  preselectedStyleId: null,
  loadedStyleIds: new Set<string>(),
  pendingStyleLoads: new Map<string, Promise<void>>(),
  // ── Canvas Modal Lifecycle (Phase 3.2 extraction candidate) ────────────────────
  ...createCanvasModalSlice(set, get, api),
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
  // ── Upload / Orientation Pipeline (Phase 3.3 extraction candidate) ────────────
  setLivingCanvasModalOpen: (open) => set({ livingCanvasModalOpen: open }),
  shouldAutoGeneratePreviews: () => {
    return ENABLE_AUTO_PREVIEWS;
  },
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
  ...createFavoritesSlice(set, get, api),
}));
