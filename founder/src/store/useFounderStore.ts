import { create } from 'zustand';
import { fetchPreviewForStyle, PreviewResult } from '@/utils/previewClient';
import type { Orientation } from '@/utils/imageUtils';

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
  selectStyle: (id: string) => void;
  toggleEnhancement: (id: string) => void;
  setEnhancementEnabled: (id: string, enabled: boolean) => void;
  setPreviewStatus: (status: FounderState['previewStatus']) => void;
  setPreviewState: (id: string, state: PreviewState) => void;
  generatePreviews: (ids?: string[]) => Promise<void>;
  setLivingCanvasModalOpen: (open: boolean) => void;
  setUploadedImage: (dataUrl: string | null) => void;
  setCroppedImage: (dataUrl: string | null) => void;
  setOrientation: (orientation: FounderState['orientation']) => void;
  setOrientationTip: (tip: string | null) => void;
  markCropReady: () => void;
  setDragging: (dragging: boolean) => void;
  setHoveredStyle: (id: string | null) => void;
  setPreselectedStyle: (id: string | null) => void;
  computedTotal: () => number;
  currentStyle: () => StyleOption | undefined;
  livingCanvasEnabled: () => boolean;
};

const mockStyles: StyleOption[] = [
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    description: 'Soft washes with gentle light leaks perfect for portraits and weddings.',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
    priceModifier: 0,
  },
  {
    id: 'neon-bloom',
    name: 'Neon Bloom',
    description: 'Electric palettes and bloom edges for nightlife captured in motion.',
    thumbnail: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    priceModifier: 20,
  },
  {
    id: 'monochrome-muse',
    name: 'Monochrome Muse',
    description: 'Silver gelatin-inspired black & white portraiture with cinematic grain.',
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    preview: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    priceModifier: 10,
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
];

export const useFounderStore = create<FounderState>((set, get) => ({
  styles: mockStyles,
  enhancements: mockEnhancements,
  selectedStyleId: mockStyles[0]?.id ?? null,
  basePrice: 129,
  previewStatus: 'ready',
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
  generatePreviews: async (ids) => {
    const store = get();
    const targetStyles = ids ? store.styles.filter((style) => ids.includes(style.id)) : store.styles;
    if (!targetStyles.length) return;

    set({ previewStatus: 'generating' });
    targetStyles.forEach((style) => {
      store.setPreviewState(style.id, { status: 'loading' });
    });

    await Promise.all(
      targetStyles.map(async (style) => {
        try {
          const result = await fetchPreviewForStyle(style, store.croppedImage ?? store.uploadedImage ?? undefined);
          store.setPreviewState(style.id, { status: 'ready', data: result });
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
      if (!state.firstPreviewCompleted) {
        nextState.firstPreviewCompleted = true;
        nextState.celebrationAt = Date.now();
        // Living Canvas modal will be shown later in the Studio flow, not immediately after first preview
        // This prevents interrupting the user's momentum and allows them to continue to customization
      }
      return nextState;
    });
  },
  setLivingCanvasModalOpen: (open) => set({ livingCanvasModalOpen: open }),
  setUploadedImage: (dataUrl) => set({ uploadedImage: dataUrl }),
  setCroppedImage: (dataUrl) => set({ croppedImage: dataUrl }),
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
}));
