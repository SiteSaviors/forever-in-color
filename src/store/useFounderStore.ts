import { create } from 'zustand';
import { fetchPreviewForStyle, PreviewResult } from '@/utils/previewClient';
import { startFounderPreviewGeneration } from '@/utils/founderPreviewGeneration';
import type { Orientation } from '@/utils/imageUtils';
import type { SmartCropResult } from '@/utils/smartCrop';
import { emitStepOneEvent } from '@/utils/telemetry';
import { logPreviewStage } from '@/utils/previewAnalytics';
import { playPreviewChime } from '@/utils/playPreviewChime';
import { CANVAS_SIZE_OPTIONS, CanvasSizeKey, getCanvasSizeOption, getDefaultSizeForOrientation } from '@/utils/canvasSizes';
import { mintAnonymousToken, fetchAuthenticatedEntitlements } from '@/utils/entitlementsApi';
import { supabaseClient } from '@/utils/supabaseClient';

/**
 * TESTING MODE FLAG
 * Set to `false` to disable automatic preview generation (saves API costs during testing)
 * Set to `true` to enable automatic preview generation (production behavior)
 *
 * When disabled, previews only generate when user manually clicks a style in Studio
 */
const ENABLE_AUTO_PREVIEWS = false;
const STYLE_PREVIEW_CACHE_LIMIT = 12;
const DEFAULT_SQUARE_SIZE = getDefaultSizeForOrientation('square');
const DEFAULT_SQUARE_PRICE = getCanvasSizeOption(DEFAULT_SQUARE_SIZE)?.price ?? 0;

const ORIENTATION_TO_ASPECT: Record<Orientation, string> = {
  square: '1:1',
  horizontal: '3:2',
  vertical: '2:3',
};

const STAGE_MESSAGES = {
  animating: 'Summoning the Wondertone studio…',
  generating: 'Sketching base strokes…',
  polling: 'Layering textures…',
  watermarking: 'Applying finishing varnish…',
  ready: 'Preview ready',
  error: 'Generation failed',
} as const;

type SessionUser = {
  id: string;
  email: string | null;
};

const tierFromServer = (value?: string | null, devOverride = false): EntitlementTier => {
  if (devOverride) return 'dev';
  switch ((value ?? '').toLowerCase()) {
    case 'anonymous':
      return 'anonymous';
    case 'creator':
    case 'plus':
    case 'pro':
      return value as EntitlementTier;
    case 'free':
    default:
      return 'free';
  }
};

const priorityFromTier = (tier: EntitlementTier): EntitlementPriority => {
  switch (tier) {
    case 'pro':
    case 'dev':
      return 'pro';
    case 'creator':
    case 'plus':
      return 'priority';
    default:
      return 'normal';
  }
};

const requiresWatermarkFromTier = (tier: EntitlementTier): boolean => tier === 'anonymous' || tier === 'free';

const generateIdempotencyKey = (styleId: string): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${styleId}-${crypto.randomUUID()}`;
  }
  return `${styleId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export type StyleOption = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  preview: string;
  priceModifier: number;
};

export type Enhancement = {
  id: string;
  name: string;
  description: string;
  price: number;
  enabled: boolean;
};

export type StyleCarouselCard = {
  id: string;
  name: string;
  resultImage: string;
  originalImage: string;
  description: string;
  ctaLabel: string;
};

export type CanvasSize = CanvasSizeKey;
export type FrameColor = 'black' | 'white' | 'none';

type PreviewState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data?: PreviewResult;
  orientation?: Orientation;
  error?: string;
};

type StylePreviewCacheEntry = {
  url: string;
  orientation: Orientation;
  generatedAt: number;
};

export type StylePreviewStatus =
  | 'idle'
  | 'animating'
  | 'generating'
  | 'polling'
  | 'watermarking'
  | 'ready'
  | 'error';

export type EntitlementTier = 'anonymous' | 'free' | 'creator' | 'plus' | 'pro' | 'dev';
export type EntitlementPriority = 'normal' | 'priority' | 'pro';

type EntitlementState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  tier: EntitlementTier;
  quota: number | null;
  remainingTokens: number | null;
  requiresWatermark: boolean;
  priority: EntitlementPriority;
  renewAt: string | null;
  hardLimit: number | null;
  softRemaining: number | null;
  dismissedPrompt: boolean;
  lastSyncedAt: number | null;
  error: string | null;
};

type StartPreviewOptions = {
  force?: boolean;
  orientationOverride?: Orientation;
};

type FounderState = {
  styles: StyleOption[];
  enhancements: Enhancement[];
  selectedStyleId: string | null;
  basePrice: number;
  previewStatus: 'idle' | 'generating' | 'ready';
  previewGenerationPromise: Promise<void> | null;
  previews: Record<string, PreviewState>;
  pendingStyleId: string | null;
  stylePreviewStatus: StylePreviewStatus;
  stylePreviewMessage: string | null;
  stylePreviewError: string | null;
  stylePreviewCache: Record<string, Partial<Record<Orientation, StylePreviewCacheEntry>>>;
  stylePreviewCacheOrder: string[];
  stylePreviewStartAt: number | null;
  firstPreviewCompleted: boolean;
  livingCanvasModalOpen: boolean;
  uploadedImage: string | null;
  croppedImage: string | null;
  orientation: Orientation;
  orientationTip: string | null;
  cropReadyAt: number | null;
  isDragging: boolean;
  celebrationAt: number | null;
  styleCarouselData: StyleCarouselCard[];
  hoveredStyleId: string | null;
  preselectedStyleId: string | null;
  entitlements: EntitlementState;
  sessionUser: SessionUser | null;
  accessToken: string | null;
  sessionHydrated: boolean;
  anonToken: string | null;
  uploadIntentAt: number | null;
  generationCount: number;
  isAuthenticated: boolean;
  accountPromptShown: boolean;
  accountPromptDismissed: boolean;
  accountPromptTriggerAt: number | null;
  originalImage: string | null;
  originalImageDimensions: { width: number; height: number } | null;
  smartCrops: Partial<Record<Orientation, SmartCropResult>>;
  orientationChanging: boolean;
  orientationPreviewPending: boolean;
  setOrientationChanging: (loading: boolean) => void;
  selectedCanvasSize: CanvasSize;
  setCanvasSize: (size: CanvasSize) => void;
  selectedFrame: FrameColor;
  setFrame: (frame: FrameColor) => void;
  selectStyle: (id: string) => void;
  toggleEnhancement: (id: string) => void;
  setEnhancementEnabled: (id: string, enabled: boolean) => void;
  setPreviewStatus: (status: FounderState['previewStatus']) => void;
  setPreviewState: (id: string, state: PreviewState) => void;
  setPendingStyle: (styleId: string | null) => void;
  setStylePreviewState: (status: StylePreviewStatus, message?: string | null, error?: string | null) => void;
  cacheStylePreview: (styleId: string, entry: StylePreviewCacheEntry) => void;
  getCachedStylePreview: (styleId: string, orientation: Orientation) => StylePreviewCacheEntry | undefined;
  clearStylePreviewCache: () => void;
  startStylePreview: (style: StyleOption, options?: StartPreviewOptions) => Promise<void>;
  generatePreviews: (ids?: string[], options?: { force?: boolean; orientationOverride?: Orientation }) => Promise<void>;
  setLivingCanvasModalOpen: (open: boolean) => void;
  setUploadedImage: (dataUrl: string | null) => void;
  setCroppedImage: (dataUrl: string | null) => void;
  setOriginalImage: (dataUrl: string | null) => void;
  setOriginalImageDimensions: (dimensions: { width: number; height: number } | null) => void;
  setOrientation: (orientation: FounderState['orientation']) => void;
  setOrientationTip: (tip: string | null) => void;
  setOrientationPreviewPending: (pending: boolean) => void;
  markCropReady: () => void;
  setDragging: (dragging: boolean) => void;
  setHoveredStyle: (id: string | null) => void;
  setPreselectedStyle: (id: string | null) => void;
  requestUpload: (options?: { preselectedStyleId?: string }) => void;
  resetPreviews: () => void;
  setSmartCropForOrientation: (orientation: Orientation, result: SmartCropResult) => void;
  clearSmartCrops: () => void;
  incrementGenerationCount: () => void;
  setSession: (user: SessionUser | null, accessToken: string | null) => void;
  signOut: () => Promise<void>;
  setAccountPromptShown: (shown: boolean) => void;
  dismissAccountPrompt: () => void;
  shouldShowAccountPrompt: () => boolean;
  canGenerateMore: () => boolean;
  getGenerationLimit: () => number;
  shouldAutoGeneratePreviews: () => boolean;
  hydrateEntitlements: () => Promise<void>;
  updateEntitlementsFromResponse: (payload: {
    remainingTokens?: number | null;
    requiresWatermark?: boolean;
    tier?: string;
    priority?: string;
  }) => void;
  setAnonToken: (token: string | null) => void;
  computedTotal: () => number;
  currentStyle: () => StyleOption | undefined;
  livingCanvasEnabled: () => boolean;
};

const mockStyles: StyleOption[] = [
  {
    id: 'original-image',
    name: 'Original Image',
    description: 'Your photo untouched - classic canvas print.',
    thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'classic-oil-painting',
    name: 'Classic Oil Painting',
    description: 'Traditional oil painting texture with bold brush strokes.',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    description: 'Soft washes with gentle light leaks perfect for portraits.',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'pastel-bliss',
    name: 'Pastel Bliss',
    description: 'Gentle color washes with soft grain highlights.',
    thumbnail: 'https://images.unsplash.com/photo-1520690214124-2405f0ec57cc?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1520690214124-2405f0ec57cc?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: '3d-storybook',
    name: '3D Storybook',
    description: 'Whimsical 3D illustrated style with storybook charm.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'pop-art-burst',
    name: 'Pop Art Burst',
    description: 'Bold Warhol-inspired pop art with vibrant colors.',
    thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'artisan-charcoal',
    name: 'Artisan Charcoal',
    description: 'Hand-drawn charcoal artistry with dramatic shading.',
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'neon-splash',
    name: 'Neon Splash',
    description: 'Electric neon splashes with vibrant energy.',
    thumbnail: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'electric-bloom',
    name: 'Electric Bloom',
    description: 'Luminous bloom effects with electric color palettes.',
    thumbnail: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'deco-luxe',
    name: 'Deco Luxe',
    description: 'Art Deco elegance with geometric luxury.',
    thumbnail: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'abstract-fusion',
    name: 'Abstract Fusion',
    description: 'Bold geometric abstraction with luminous color blocking.',
    thumbnail: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'gemstone-poly',
    name: 'Gemstone Poly',
    description: 'Low-poly crystalline facets with gemstone brilliance.',
    thumbnail: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
];

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

export const useFounderStore = create<FounderState>((set, get) => ({
  styles: mockStyles,
  enhancements: mockEnhancements,
  selectedStyleId: mockStyles[0]?.id ?? null,
  basePrice: DEFAULT_SQUARE_PRICE,
  previewStatus: 'idle',
  previewGenerationPromise: null,
  previews: Object.fromEntries(mockStyles.map((style) => [style.id, { status: 'idle' as const }])),
  pendingStyleId: null,
  stylePreviewStatus: 'idle',
  stylePreviewMessage: null,
  stylePreviewError: null,
  stylePreviewCache: {},
  stylePreviewCacheOrder: [],
  stylePreviewStartAt: null,
  firstPreviewCompleted: false,
  livingCanvasModalOpen: false,
  uploadedImage: null,
  croppedImage: null,
  orientation: 'square',
  orientationTip: null,
  cropReadyAt: null,
  isDragging: false,
  celebrationAt: null,
  styleCarouselData: mockCarouselData,
  hoveredStyleId: null,
  preselectedStyleId: null,
  entitlements: {
    status: 'idle',
    tier: 'anonymous',
    quota: 10,
    remainingTokens: 10,
    requiresWatermark: true,
    priority: 'normal',
    renewAt: null,
    hardLimit: 10,
    softRemaining: 5,
    dismissedPrompt: false,
    lastSyncedAt: null,
    error: null
  },
  sessionUser: null,
  accessToken: null,
  sessionHydrated: false,
  anonToken: null,
  uploadIntentAt: null,
  generationCount: parseInt(sessionStorage.getItem('generation_count') || '0'),
  isAuthenticated: false,
  accountPromptShown: false,
  accountPromptDismissed: sessionStorage.getItem('account_prompt_dismissed') === 'true',
  accountPromptTriggerAt: null,
  originalImage: null,
  originalImageDimensions: null,
  smartCrops: {},
  orientationChanging: false,
  orientationPreviewPending: false,
  setOrientationChanging: (loading) => set({ orientationChanging: loading }),
  setOrientationPreviewPending: (pending) => set({ orientationPreviewPending: pending }),
  selectedCanvasSize: DEFAULT_SQUARE_SIZE,
  setCanvasSize: (size) => set({ selectedCanvasSize: size }),
  selectedFrame: 'none',
  setFrame: (frame) => set({ selectedFrame: frame }),
  selectStyle: (id) => set({ selectedStyleId: id }),
  toggleEnhancement: (id) =>
    set((state) => {
      const enhancements = state.enhancements.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      );
      const livingCanvasEnabled = enhancements.find((item) => item.id === 'living-canvas')?.enabled ?? false;
      return {
        enhancements,
        livingCanvasModalOpen: livingCanvasEnabled ? false : state.livingCanvasModalOpen,
      };
    }),
  setEnhancementEnabled: (id, enabled) =>
    set((state) => ({
      enhancements: state.enhancements.map((item) =>
        item.id === id ? { ...item, enabled } : item
      ),
      livingCanvasModalOpen: id === 'living-canvas' && enabled ? false : state.livingCanvasModalOpen,
    })),
  setPreviewStatus: (status) => set({ previewStatus: status }),
  setPreviewState: (id, previewState) =>
    set((state) => ({
      previews: {
        ...state.previews,
        [id]: previewState,
      },
    })),
  setPendingStyle: (styleId) =>
    set({ pendingStyleId: styleId }),
  setStylePreviewState: (status, message = null, error = null) =>
    set((state) => ({
      stylePreviewStatus: status,
      stylePreviewMessage: message,
      stylePreviewError: status === 'error' ? (error ?? state.stylePreviewError ?? 'Preview failed') : null,
    })),
  cacheStylePreview: (styleId, entry) =>
    set((state) => {
      const existingForStyle = state.stylePreviewCache[styleId] ?? {};
      const key = `${styleId}:${entry.orientation}`;

      const filteredOrder = state.stylePreviewCacheOrder.filter((existingKey) => existingKey !== key);
      filteredOrder.push(key);

      const cacheCopy: Record<string, Partial<Record<Orientation, StylePreviewCacheEntry>>> = {
        ...state.stylePreviewCache,
        [styleId]: {
          ...existingForStyle,
          [entry.orientation]: entry,
        },
      };

      while (filteredOrder.length > STYLE_PREVIEW_CACHE_LIMIT) {
        const oldestKey = filteredOrder.shift();
        if (!oldestKey) break;
        const [oldStyleId, oldOrientation] = oldestKey.split(':') as [string, Orientation];
        const map = cacheCopy[oldStyleId];
        if (map && map[oldOrientation]) {
        const { [oldOrientation]: _removed, ...rest } = map;
        if (Object.keys(rest).length === 0) {
          delete cacheCopy[oldStyleId];
        } else {
          cacheCopy[oldStyleId] = rest as Partial<Record<Orientation, StylePreviewCacheEntry>>;
        }
        }
      }

      return {
        stylePreviewCache: cacheCopy,
        stylePreviewCacheOrder: filteredOrder,
      };
    }),
  getCachedStylePreview: (styleId, orientation) => {
    const state = get();
    return state.stylePreviewCache[styleId]?.[orientation];
  },
  clearStylePreviewCache: () =>
    set({ stylePreviewCache: {}, stylePreviewCacheOrder: [] }),
  startStylePreview: async (style, options: StartPreviewOptions = {}) => {
    const state = get();
    const { force = false, orientationOverride } = options;
    const targetOrientation = orientationOverride ?? state.orientation;

    if (state.pendingStyleId && state.pendingStyleId !== style.id) {
      return;
    }

    set({ selectedStyleId: style.id });

    if (style.id === 'original-image') {
      const source = state.croppedImage ?? state.uploadedImage;
      if (source) {
        const timestamp = Date.now();
        state.setPreviewState('original-image', {
          status: 'ready',
          data: {
            previewUrl: source,
            watermarkApplied: false,
            startedAt: timestamp,
            completedAt: timestamp,
          },
          orientation: targetOrientation,
        });
        set({
          pendingStyleId: null,
          stylePreviewStatus: 'idle',
          stylePreviewMessage: null,
          stylePreviewError: null,
          orientationPreviewPending: false,
        });
      }
      return;
    }

    const sourceImage =
      state.croppedImage ??
      state.smartCrops[targetOrientation]?.dataUrl ??
      state.uploadedImage ??
      state.originalImage ??
      null;
    if (!sourceImage) {
      set({
        stylePreviewStatus: 'error',
        stylePreviewMessage: 'Upload a photo to generate a preview.',
        stylePreviewError: 'No image uploaded',
        pendingStyleId: null,
        orientationPreviewPending: false,
      });
      return;
    }

    if (state.entitlements.status === 'idle' || state.entitlements.status === 'error') {
      await get().hydrateEntitlements();
    }

    const entitlementState = get().entitlements;

    if (entitlementState.status === 'error') {
      set({
        stylePreviewStatus: 'error',
        stylePreviewMessage: 'Unable to verify preview allowance. Please try again.',
        stylePreviewError: entitlementState.error ?? 'Entitlement check failed',
        pendingStyleId: null,
        orientationPreviewPending: false,
      });
      return;
    }

    if (!get().canGenerateMore()) {
      set({
        stylePreviewStatus: 'error',
        stylePreviewMessage: 'Preview limit reached. Upgrade to continue.',
        stylePreviewError: 'ENTITLEMENT_EXCEEDED',
        pendingStyleId: null,
        orientationPreviewPending: false,
      });
      return;
    }

    const cached = !force ? state.getCachedStylePreview(style.id, targetOrientation) : undefined;
    const startTime = Date.now();
    set({ stylePreviewStartAt: startTime });
    logPreviewStage({ styleId: style.id, stage: 'start', elapsedMs: 0, timestamp: startTime });
    if (cached) {
      const timestamp = Date.now();
      state.setPreviewState(style.id, {
        status: 'ready',
        data: {
          previewUrl: cached.url,
          watermarkApplied: get().entitlements.requiresWatermark,
          startedAt: cached.generatedAt ?? timestamp,
          completedAt: cached.generatedAt ?? timestamp,
        },
        orientation: targetOrientation,
      });
      set({
        pendingStyleId: null,
        stylePreviewStatus: 'idle',
        stylePreviewMessage: null,
        stylePreviewError: null,
        stylePreviewStartAt: null,
        orientationPreviewPending: false,
      });
      playPreviewChime();
      logPreviewStage({
        styleId: style.id,
        stage: 'complete',
        elapsedMs: Date.now() - startTime,
        timestamp: Date.now(),
      });
      return;
    }

    set({
      pendingStyleId: style.id,
      stylePreviewStatus: 'animating',
      stylePreviewMessage: STAGE_MESSAGES.animating,
      stylePreviewError: null,
    });

    const aspectRatio = ORIENTATION_TO_ASPECT[targetOrientation] ?? '1:1';
    emitStepOneEvent({ type: 'preview', styleId: style.id, status: 'start' });
    try {
      const existing = state.previews[style.id];
      state.setPreviewState(style.id, {
        status: 'loading',
        data: existing?.data,
        orientation: existing?.orientation,
        error: existing?.error,
      });
      const sessionUser = get().sessionUser;
      const anonToken = sessionUser ? null : get().anonToken;
      const accessToken = get().accessToken;

      const idempotencyKey = generateIdempotencyKey(style.id);

      const result = await startFounderPreviewGeneration({
        imageUrl: sourceImage,
        styleId: style.id,
        styleName: style.name,
        aspectRatio,
        anonToken,
        accessToken,
        idempotencyKey,
        onStage: (stage) => {
          if (get().pendingStyleId !== style.id) {
            return;
          }
          set({
            stylePreviewStatus: stage,
            stylePreviewMessage: STAGE_MESSAGES[stage],
            stylePreviewError: null,
          });
          emitStepOneEvent({ type: 'preview', styleId: style.id, status: stage });
          const startAt = get().stylePreviewStartAt ?? startTime;
          logPreviewStage({
            styleId: style.id,
            stage,
            elapsedMs: Date.now() - startAt,
            timestamp: Date.now(),
          });
        },
      });

      const timestamp = Date.now();
      state.cacheStylePreview(style.id, {
        url: result.previewUrl,
        orientation: targetOrientation,
        generatedAt: timestamp,
      });
      state.setPreviewState(style.id, {
        status: 'ready',
        data: {
          previewUrl: result.previewUrl,
          watermarkApplied: result.requiresWatermark,
          startedAt: timestamp,
          completedAt: timestamp,
        },
        orientation: targetOrientation,
      });

      get().updateEntitlementsFromResponse({
        remainingTokens: result.remainingTokens,
        requiresWatermark: result.requiresWatermark,
        tier: result.tier,
        priority: result.priority,
      });
      get().incrementGenerationCount();

      set({
        pendingStyleId: null,
        stylePreviewStatus: 'ready',
        stylePreviewMessage: STAGE_MESSAGES.ready,
        stylePreviewError: null,
        stylePreviewStartAt: null,
        orientationPreviewPending: get().orientation === targetOrientation ? false : get().orientationPreviewPending,
      });
      emitStepOneEvent({ type: 'preview', styleId: style.id, status: 'complete' });
      playPreviewChime();
      logPreviewStage({
        styleId: style.id,
        stage: 'complete',
        elapsedMs: Date.now() - startTime,
        timestamp: Date.now(),
      });

      window.setTimeout(() => {
        if (get().stylePreviewStatus === 'ready') {
          set({ stylePreviewStatus: 'idle', stylePreviewMessage: null });
        }
      }, 400);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      const existingPreview = get().previews[style.id];
      state.setPreviewState(style.id, {
        status: 'error',
        data: existingPreview?.data,
        orientation: existingPreview?.orientation ?? targetOrientation,
        error: error instanceof Error ? error.message : 'Preview failed',
      });

      set({
        pendingStyleId: null,
        stylePreviewStatus: 'error',
        stylePreviewMessage: STAGE_MESSAGES.error,
        stylePreviewError: error instanceof Error ? error.message : 'Preview failed',
        stylePreviewStartAt: null,
      });
      emitStepOneEvent({ type: 'preview', styleId: style.id, status: 'error' });
      logPreviewStage({
        styleId: style.id,
        stage: 'error',
        elapsedMs: Date.now() - startTime,
        timestamp: Date.now(),
        message: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof Error && (error as Error & { code?: string }).code === 'ENTITLEMENT_EXCEEDED') {
        const remaining = (error as Error & { remainingTokens?: number | null }).remainingTokens ?? 0;
        get().updateEntitlementsFromResponse({ remainingTokens: remaining });
      }

      window.setTimeout(() => {
        if (get().stylePreviewStatus === 'error') {
          set({ stylePreviewStatus: 'idle', stylePreviewMessage: null });
        }
      }, 1600);

      if (get().orientation === targetOrientation) {
        set({ orientationPreviewPending: false });
      }
    }
  },
  resetPreviews: () =>
    set((state) => ({
      previews: Object.fromEntries(
        state.styles.map((style) => [style.id, { status: 'idle' as const }])
      ),
      previewStatus: 'idle',
      stylePreviewCache: {},
      stylePreviewCacheOrder: [],
      pendingStyleId: null,
      stylePreviewStatus: 'idle',
      stylePreviewMessage: null,
      stylePreviewError: null,
      stylePreviewStartAt: null,
      orientationPreviewPending: false,
    })),
  setSmartCropForOrientation: (orientation, result) =>
    set((state) => ({
      smartCrops: {
        ...state.smartCrops,
        [orientation]: result,
      },
    })),
  clearSmartCrops: () => set({ smartCrops: {} }),
  setAnonToken: (token) => set({ anonToken: token }),
  hydrateEntitlements: async () => {
    const state = get();
    if (state.entitlements.status === 'loading') {
      return;
    }

    set((current) => ({
      entitlements: {
        ...current.entitlements,
        status: 'loading',
        error: null
      }
    }));

    try {
      if (state.sessionUser && supabaseClient) {
        const snapshot = await fetchAuthenticatedEntitlements();
        if (!snapshot) {
          set((current) => ({
            entitlements: {
              ...current.entitlements,
              status: 'ready',
              tier: 'free',
              quota: 10,
              remainingTokens: 10,
              requiresWatermark: true,
              priority: 'normal',
              renewAt: null,
              hardLimit: 10,
              softRemaining: null,
              lastSyncedAt: Date.now(),
              error: null
            }
          }));
        } else {
          set((current) => ({
            entitlements: {
              status: 'ready',
              tier: snapshot.tier,
              quota: snapshot.quota,
              remainingTokens: snapshot.remainingTokens,
              requiresWatermark: snapshot.requiresWatermark,
              priority: snapshot.priority,
              renewAt: snapshot.renewAt,
              hardLimit: snapshot.quota,
              softRemaining: null,
              dismissedPrompt: current.entitlements.dismissedPrompt,
              lastSyncedAt: Date.now(),
              error: null
            }
          }));
        }
      } else {
        const minted = await mintAnonymousToken({
          token: state.anonToken ?? undefined,
          dismissedPrompt: state.accountPromptDismissed
        });

        sessionStorage.setItem('account_prompt_dismissed', minted.dismissed_prompt ? 'true' : 'false');

        set({
          anonToken: minted.anon_token,
          accountPromptDismissed: minted.dismissed_prompt,
          entitlements: {
            status: 'ready',
            tier: 'anonymous',
            quota: minted.hard_limit,
            remainingTokens: minted.hard_remaining,
            requiresWatermark: true,
            priority: 'normal',
            renewAt: null,
            hardLimit: minted.hard_limit,
            softRemaining: minted.free_tokens_remaining,
            dismissedPrompt: minted.dismissed_prompt,
            lastSyncedAt: Date.now(),
            error: null
          }
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load entitlements';
      set((current) => ({
        entitlements: {
          ...current.entitlements,
          status: 'error',
          error: message,
          lastSyncedAt: Date.now()
        }
      }));
    }
  },
  updateEntitlementsFromResponse: ({ remainingTokens, requiresWatermark, tier, priority }) => {
    set((current) => {
      const next: EntitlementState = {
        ...current.entitlements,
        status: 'ready',
        lastSyncedAt: Date.now(),
        error: null
      };

      if (typeof remainingTokens === 'number') {
        next.remainingTokens = remainingTokens;
      }

      if (typeof requiresWatermark === 'boolean') {
        next.requiresWatermark = requiresWatermark;
      }

      if (tier) {
        const mappedTier = tierFromServer(tier, next.tier === 'dev');
        next.tier = mappedTier;
        next.priority = priorityFromTier(mappedTier);
        next.requiresWatermark = requiresWatermark ?? requiresWatermarkFromTier(mappedTier);
      }

      if (priority) {
        const normalized = priority.toLowerCase();
        if (normalized === 'normal' || normalized === 'priority' || normalized === 'pro') {
          next.priority = normalized as EntitlementPriority;
        }
      }

      if (next.tier === 'anonymous' && next.softRemaining != null) {
        next.softRemaining = Math.max(next.softRemaining - 1, 0);
      }

      return { entitlements: next };
    });
  },
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
  generatePreviews: async (ids, options = {}) => {
    const store = get();
    const state = get();
    const targetOrientation = options.orientationOverride ?? state.orientation;

    if (state.previewGenerationPromise) {
      console.warn('[generatePreviews] In-flight request detected, reusing existing promise');
      return state.previewGenerationPromise;
    }

    let targetStyles: StyleOption[];
    if (ids && ids.length > 0) {
      targetStyles = store.styles.filter((style) => ids.includes(style.id));
    } else {
      const prioritized: StyleOption[] = [];
      if (state.selectedStyleId) {
        const selected = store.styles.find((style) => style.id === state.selectedStyleId);
        if (selected) {
          prioritized.push(selected);
        }
      }

      for (const style of store.styles) {
        if (prioritized.length >= 3) break;
        if (prioritized.some((item) => item.id === style.id)) continue;
        prioritized.push(style);
      }

      targetStyles = prioritized;
    }

    if (!targetStyles.length) return;

    const shouldGenerate = targetStyles.some((style) => {
      if (options.force) return true;
      const previewState = state.previews[style.id];
      return previewState?.status !== 'ready';
    });

    if (!shouldGenerate) {
      return;
    }

    let generatedAny = false;

    const generationRun = (async () => {
      set({ previewStatus: 'generating' });

      await Promise.all(
        targetStyles.map(async (style) => {
          const stateBefore = get();

          if (!options.force && stateBefore.previews[style.id]?.status === 'ready') {
            return;
          }

      if (!stateBefore.canGenerateMore()) {
        const existing = stateBefore.previews[style.id];
        store.setPreviewState(style.id, {
          status: 'idle',
          data: existing?.data,
          orientation: existing?.orientation,
          error: existing?.error,
        });
        return;
      }

      store.setPreviewState(style.id, {
        status: 'loading',
        data: stateBefore.previews[style.id]?.data,
        orientation: stateBefore.previews[style.id]?.orientation,
        error: stateBefore.previews[style.id]?.error,
      });

      try {
        const baseImage =
          stateBefore.croppedImage ??
          stateBefore.smartCrops[targetOrientation]?.dataUrl ??
          stateBefore.uploadedImage ??
          stateBefore.originalImage ??
          undefined;

            if (!baseImage) {
              const previous = get().previews[style.id];
              store.setPreviewState(style.id, {
                status: 'idle',
                data: previous?.data,
                orientation: previous?.orientation,
                error: previous?.error,
              });
              return;
            }

        const result = await fetchPreviewForStyle(style, baseImage);
        store.setPreviewState(style.id, {
          status: 'ready',
          data: result,
          orientation: targetOrientation,
        });
        generatedAny = true;
        store.incrementGenerationCount();
          } catch (error) {
            const previous = get().previews[style.id];
            store.setPreviewState(style.id, {
              status: 'error',
              data: previous?.data,
              orientation: previous?.orientation,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        })
      );

      set((current) => {
        const nextState: Partial<FounderState> = {
          previewStatus: 'ready',
        };
        if (generatedAny && !current.firstPreviewCompleted) {
          nextState.firstPreviewCompleted = true;
          nextState.celebrationAt = Date.now();
        }
        return nextState;
      });
    })();

    set({ previewGenerationPromise: generationRun });

    try {
      await generationRun;
    } finally {
      set({ previewGenerationPromise: null });
    }
  },
  setLivingCanvasModalOpen: (open) => set({ livingCanvasModalOpen: open }),
  setUploadedImage: (dataUrl) =>
    set({
      uploadedImage: dataUrl,
      stylePreviewCache: {},
      stylePreviewCacheOrder: [],
      pendingStyleId: null,
      stylePreviewStatus: 'idle',
      stylePreviewMessage: null,
      stylePreviewError: null,
      stylePreviewStartAt: null,
      orientationPreviewPending: false,
    }),
  setCroppedImage: (dataUrl) => set({ croppedImage: dataUrl }),
  setOriginalImage: (dataUrl) => set({ originalImage: dataUrl }),
  setOriginalImageDimensions: (dimensions) => set({ originalImageDimensions: dimensions }),
  setOrientation: (orientation) => {
    const current = get();
    if (current.orientation === orientation) return;

    const availableOptions = CANVAS_SIZE_OPTIONS[orientation];
    const hasCurrentSize = availableOptions.some((option) => option.id === current.selectedCanvasSize);
    const nextCanvasSize = hasCurrentSize ? current.selectedCanvasSize : getDefaultSizeForOrientation(orientation);

    const previousOrientation = current.orientation;
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

    const cached = updated.stylePreviewCache[styleId]?.[orientation];
    if (cached) {
      updated.setPreviewState(styleId, {
        status: 'ready',
        data: {
          previewUrl: cached.url,
          watermarkApplied: false,
          startedAt: cached.generatedAt,
          completedAt: cached.generatedAt,
        },
        orientation,
      });
      set({
        stylePreviewStatus: 'idle',
        stylePreviewMessage: null,
        stylePreviewError: null,
        orientationPreviewPending: false,
      });
    } else {
      const existing = updated.previews[styleId];
      if (existing?.data) {
        updated.setPreviewState(styleId, {
          status: existing.status,
          data: existing.data,
          orientation: existing.orientation ?? previousOrientation,
          error: existing.error,
        });
      }
      set({ orientationPreviewPending: true });
    }
  },
  setOrientationTip: (tip) => set({ orientationTip: tip }),
  markCropReady: () => set({ cropReadyAt: Date.now() }),
  setDragging: (isDragging) => set({ isDragging }),
  computedTotal: () => {
    const { basePrice, enhancements, styles, selectedStyleId, selectedCanvasSize } = get();
    const styleMod = styles.find((style) => style.id === selectedStyleId)?.priceModifier ?? 0;
    const sizePrice = getCanvasSizeOption(selectedCanvasSize)?.price ?? basePrice;
    const enhancementsTotal = enhancements
      .filter((item) => item.enabled)
      .reduce((sum, item) => sum + item.price, 0);
    return sizePrice + styleMod + enhancementsTotal;
  },
  currentStyle: () => {
    const { styles, selectedStyleId } = get();
    return styles.find((style) => style.id === selectedStyleId);
  },
  livingCanvasEnabled: () => get().enhancements.find((item) => item.id === 'living-canvas')?.enabled ?? false,
  incrementGenerationCount: () => {
    const state = get();
    const newCount = state.generationCount + 1;
    sessionStorage.setItem('generation_count', newCount.toString());

    const shouldPrompt =
      state.entitlements.tier === 'anonymous' &&
      typeof state.entitlements.softRemaining === 'number' &&
      state.entitlements.softRemaining <= 0 &&
      !state.accountPromptDismissed &&
      !state.accountPromptShown;

    set({
      generationCount: newCount,
      accountPromptShown: shouldPrompt ? true : state.accountPromptShown,
      accountPromptTriggerAt: shouldPrompt ? Date.now() : state.accountPromptTriggerAt,
    });
  },
  setSession: (user, accessToken) => {
    const current = get();
    const currentUserId = current.sessionUser?.id ?? null;
    const nextUserId = user?.id ?? null;
    const tokenChanged = current.accessToken !== accessToken;

    if (current.sessionHydrated && currentUserId === nextUserId && !tokenChanged) {
      return;
    }

    set((state) => ({
      sessionHydrated: true,
      sessionUser: user,
      accessToken: accessToken ?? null,
      isAuthenticated: Boolean(user),
      accountPromptShown: user ? false : state.accountPromptShown,
      accountPromptTriggerAt: user ? null : state.accountPromptTriggerAt,
      accountPromptDismissed: user ? false : state.accountPromptDismissed,
      anonToken: user ? state.anonToken : null,
    }));

    void get().hydrateEntitlements();
  },
  signOut: async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    } else {
      get().setSession(null, null);
    }
  },
  setAccountPromptShown: (shown) =>
    set({
      accountPromptShown: shown,
      accountPromptTriggerAt: shown ? Date.now() : null,
    }),
  dismissAccountPrompt: () => {
    sessionStorage.setItem('account_prompt_dismissed', 'true');
    set({ accountPromptDismissed: true, accountPromptShown: false, accountPromptTriggerAt: null });

    const token = get().anonToken;
    if (token) {
      void mintAnonymousToken({ token, dismissedPrompt: true }).then((response) => {
        set((current) => ({
          anonToken: response.anon_token,
          entitlements: {
            ...current.entitlements,
            dismissedPrompt: response.dismissed_prompt,
            softRemaining: response.free_tokens_remaining,
            hardLimit: response.hard_limit,
            quota: response.hard_limit,
            remainingTokens: response.hard_remaining
          }
        }));
      }).catch(() => {
        // silent fail - local dismissal already applied
      });
    }
  },
  shouldShowAccountPrompt: () => {
    const { entitlements, accountPromptShown, accountPromptDismissed } = get();
    const softRemaining = entitlements.softRemaining;
    const shouldPrompt =
      entitlements.tier === 'anonymous' &&
      typeof softRemaining === 'number' &&
      softRemaining <= 0;

    return shouldPrompt && !accountPromptShown && !accountPromptDismissed;
  },
  canGenerateMore: () => {
    const { entitlements } = get();

    if (entitlements.status !== 'ready') {
      return true;
    }

    if (entitlements.remainingTokens == null) {
      return true;
    }

    return entitlements.remainingTokens > 0;
  },
  getGenerationLimit: () => {
    const { entitlements } = get();
    if (entitlements.quota == null) {
      return Infinity;
    }

    return entitlements.quota;
  },
  shouldAutoGeneratePreviews: () => {
    return ENABLE_AUTO_PREVIEWS;
  },
}));
