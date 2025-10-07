import { create } from 'zustand';
import { fetchPreviewForStyle, PreviewResult } from '@/utils/previewClient';
import type { Orientation } from '@/utils/imageUtils';

/**
 * TESTING MODE FLAG
 * Set to `false` to disable automatic preview generation (saves API costs during testing)
 * Set to `true` to enable automatic preview generation (production behavior)
 *
 * When disabled, previews only generate when user manually clicks a style in Studio
 */
const ENABLE_AUTO_PREVIEWS = false;

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

type PreviewState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data?: PreviewResult;
  error?: string;
};

type FounderState = {
  styles: StyleOption[];
  enhancements: Enhancement[];
  selectedStyleId: string | null;
  basePrice: number;
  previewStatus: 'idle' | 'generating' | 'ready';
  previews: Record<string, PreviewState>;
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
  uploadIntentAt: number | null;
  generationCount: number;
  isAuthenticated: boolean;
  accountPromptShown: boolean;
  accountPromptDismissed: boolean;
  subscriptionTier: 'free' | 'creator' | 'pro' | null;
  accountPromptTriggerAt: number | null;
  originalImage: string | null;
  smartCrops: Partial<Record<Orientation, string>>;
  orientationChanging: boolean;
  setOrientationChanging: (loading: boolean) => void;
  selectStyle: (id: string) => void;
  toggleEnhancement: (id: string) => void;
  setEnhancementEnabled: (id: string, enabled: boolean) => void;
  setPreviewStatus: (status: FounderState['previewStatus']) => void;
  setPreviewState: (id: string, state: PreviewState) => void;
  generatePreviews: (ids?: string[], options?: { force?: boolean }) => Promise<void>;
  setLivingCanvasModalOpen: (open: boolean) => void;
  setUploadedImage: (dataUrl: string | null) => void;
  setCroppedImage: (dataUrl: string | null) => void;
  setOriginalImage: (dataUrl: string | null) => void;
  setOrientation: (orientation: FounderState['orientation']) => void;
  setOrientationTip: (tip: string | null) => void;
  markCropReady: () => void;
  setDragging: (dragging: boolean) => void;
  setHoveredStyle: (id: string | null) => void;
  setPreselectedStyle: (id: string | null) => void;
  requestUpload: (options?: { preselectedStyleId?: string }) => void;
  resetPreviews: () => void;
  setSmartCropForOrientation: (orientation: Orientation, dataUrl: string) => void;
  clearSmartCrops: () => void;
  incrementGenerationCount: () => void;
  setAuthenticated: (status: boolean) => void;
  setAccountPromptShown: (shown: boolean) => void;
  dismissAccountPrompt: () => void;
  setSubscriptionTier: (tier: FounderState['subscriptionTier']) => void;
  shouldShowAccountPrompt: () => boolean;
  canGenerateMore: () => boolean;
  getGenerationLimit: () => number;
  shouldAutoGeneratePreviews: () => boolean;
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
  basePrice: 129,
  previewStatus: 'idle',
  previews: Object.fromEntries(mockStyles.map((style) => [style.id, { status: 'idle' as const }])),
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
  uploadIntentAt: null,
  generationCount: parseInt(sessionStorage.getItem('generation_count') || '0'),
  isAuthenticated: !!localStorage.getItem('user_id'),
  accountPromptShown: false,
  accountPromptDismissed: sessionStorage.getItem('account_prompt_dismissed') === 'true',
  subscriptionTier: (localStorage.getItem('subscription_tier') as FounderState['subscriptionTier']) || null,
  accountPromptTriggerAt: null,
  originalImage: null,
  smartCrops: {},
  orientationChanging: false,
  setOrientationChanging: (loading) => set({ orientationChanging: loading }),
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
  resetPreviews: () =>
    set((state) => ({
      previews: Object.fromEntries(
        state.styles.map((style) => [style.id, { status: 'idle' as const }])
      ),
      previewStatus: 'idle',
    })),
  setSmartCropForOrientation: (orientation, dataUrl) =>
    set((state) => ({
      smartCrops: {
        ...state.smartCrops,
        [orientation]: dataUrl,
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

    // Guard: Prevent concurrent generation calls
    if (state.previewStatus === 'generating') {
      console.warn('[generatePreviews] Already generating, skipping duplicate call');
      return;
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

    set({ previewStatus: 'generating' });

    let generatedAny = false;

    await Promise.all(
      targetStyles.map(async (style) => {
        const stateBefore = get();

        // If a preview is already ready and not forcing a refresh, reuse it.
        if (!options.force && stateBefore.previews[style.id]?.status === 'ready') {
          return;
        }

        if (!stateBefore.canGenerateMore()) {
          store.setPreviewState(style.id, { status: 'idle' });
          return;
        }

        store.setPreviewState(style.id, { status: 'loading' });

        try {
          const baseImage =
            stateBefore.croppedImage ??
            stateBefore.smartCrops[stateBefore.orientation] ??
            stateBefore.uploadedImage ??
            stateBefore.originalImage ??
            undefined;

          if (!baseImage) {
            store.setPreviewState(style.id, { status: 'idle' });
            return;
          }

          const result = await fetchPreviewForStyle(
            style,
            baseImage
          );
          store.setPreviewState(style.id, { status: 'ready', data: result });
          generatedAny = true;
          store.incrementGenerationCount();
        } catch (error) {
          store.setPreviewState(style.id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      })
    );

    set((state) => {
      const nextState: Partial<FounderState> = {
        previewStatus: 'ready',
      };
      if (generatedAny && !state.firstPreviewCompleted) {
        nextState.firstPreviewCompleted = true;
        nextState.celebrationAt = Date.now();
      }
      return nextState;
    });
  },
  setLivingCanvasModalOpen: (open) => set({ livingCanvasModalOpen: open }),
  setUploadedImage: (dataUrl) => set({ uploadedImage: dataUrl }),
  setCroppedImage: (dataUrl) => set({ croppedImage: dataUrl }),
  setOriginalImage: (dataUrl) => set({ originalImage: dataUrl }),
  setOrientation: (orientation) => set({ orientation }),
  setOrientationTip: (tip) => set({ orientationTip: tip }),
  markCropReady: () => set({ cropReadyAt: Date.now() }),
  setDragging: (isDragging) => set({ isDragging }),
  computedTotal: () => {
    const { basePrice, enhancements, styles, selectedStyleId } = get();
    const styleMod = styles.find((style) => style.id === selectedStyleId)?.priceModifier ?? 0;
    const enhancementsTotal = enhancements
      .filter((item) => item.enabled)
      .reduce((sum, item) => sum + item.price, 0);
    return basePrice + styleMod + enhancementsTotal;
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
      newCount === 3 &&
      !state.isAuthenticated &&
      !state.accountPromptDismissed &&
      !state.accountPromptShown;

    set({
      generationCount: newCount,
      accountPromptShown: shouldPrompt ? true : state.accountPromptShown,
      accountPromptTriggerAt: shouldPrompt ? Date.now() : state.accountPromptTriggerAt,
    });
  },
  setAuthenticated: (status) => {
    if (status) {
      localStorage.setItem('user_id', 'temp_user_' + Date.now());
    } else {
      localStorage.removeItem('user_id');
    }
    set((state) => ({
      isAuthenticated: status,
      accountPromptShown: status ? false : state.accountPromptShown,
      accountPromptTriggerAt: status ? null : state.accountPromptTriggerAt,
      accountPromptDismissed: status ? false : state.accountPromptDismissed,
    }));
  },
  setAccountPromptShown: (shown) =>
    set({
      accountPromptShown: shown,
      accountPromptTriggerAt: shown ? Date.now() : null,
    }),
  dismissAccountPrompt: () => {
    sessionStorage.setItem('account_prompt_dismissed', 'true');
    set({ accountPromptDismissed: true, accountPromptShown: false, accountPromptTriggerAt: null });
  },
  setSubscriptionTier: (tier) => {
    if (tier) {
      localStorage.setItem('subscription_tier', tier);
    } else {
      localStorage.removeItem('subscription_tier');
    }
    set({ subscriptionTier: tier });
  },
  shouldShowAccountPrompt: () => {
    const { generationCount, isAuthenticated, accountPromptShown, accountPromptDismissed } = get();
    return generationCount >= 3 && !isAuthenticated && !accountPromptShown && !accountPromptDismissed;
  },
  canGenerateMore: () => {
    const { generationCount, isAuthenticated, subscriptionTier } = get();

    // Pro tier: unlimited
    if (subscriptionTier === 'pro') return true;

    // Creator tier: unlimited (but watermarked)
    if (subscriptionTier === 'creator') return true;

    // Authenticated free tier: 8 limit
    if (isAuthenticated) return generationCount < 8;

    // Anonymous: 9 hard limit (soft prompt at 3)
    return generationCount < 9;
  },
  getGenerationLimit: () => {
    const { isAuthenticated, subscriptionTier } = get();

    if (subscriptionTier === 'creator' || subscriptionTier === 'pro') {
      return Infinity;
    }

    return isAuthenticated ? 8 : 9;
  },
  shouldAutoGeneratePreviews: () => {
    return ENABLE_AUTO_PREVIEWS;
  },
}));
