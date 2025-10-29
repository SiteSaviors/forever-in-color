import type { StateCreator } from 'zustand';
import type { Orientation } from '@/utils/imageUtils';
import type { SmartCropResult } from '@/utils/smartCrop';
import type { CanvasSizeKey } from '@/utils/canvasSizes';
import type { PreviewResult } from '@/utils/previewClient';
import type { GateResult } from '@/utils/entitlementGate';

/**
 * Shared type definitions for the founder store.
 * These are intentionally isolated from slice implementations to prevent circular dependencies.
 */

export type StyleOption = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  thumbnailWebp?: string | null;
  thumbnailAvif?: string | null;
  preview: string;
  previewWebp?: string | null;
  previewAvif?: string | null;
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

export type CanvasModalSource = 'center' | 'rail';
export type CanvasModalCloseReason = 'dismiss' | 'cancel' | 'esc_key' | 'backdrop' | 'purchase_complete';

export type CanvasSelection = {
  size: CanvasSize | null;
  frame: FrameColor;
  enhancements: string[];
};

export type StylePreviewStatus = 'idle' | 'animating' | 'generating' | 'polling' | 'ready' | 'error';

export type PreviewState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data?: PreviewResult;
  orientation?: Orientation;
  error?: string;
};

export type StylePreviewCacheEntry = {
  url: string;
  orientation: Orientation;
  generatedAt: number;
  storageUrl?: string | null;
  storagePath?: string | null;
  sourceStoragePath?: string | null;
  sourceDisplayUrl?: string | null;
  cropConfig?: PreviewResult['cropConfig'];
};

export type StartPreviewOptions = {
  force?: boolean;
  orientationOverride?: Orientation;
};

export type PreviewSlice = {
  previewStatus: 'idle' | 'generating' | 'ready';
  previewGenerationPromise: Promise<void> | null;
  previews: Record<string, PreviewState>;
  pendingStyleId: string | null;
  stylePreviewStatus: StylePreviewStatus;
  stylePreviewMessage: string | null;
  stylePreviewError: string | null;
  stylePreviewStartAt: number | null;
  firstPreviewCompleted: boolean;
  authGateOpen: boolean;
  pendingAuthStyleId: string | null;
  pendingAuthOptions: StartPreviewOptions | null;
  setPreviewStatus: (status: PreviewSlice['previewStatus']) => void;
  setPreviewState: (id: string, previewState: PreviewState) => void;
  setPendingStyle: (styleId: string | null) => void;
  setStylePreviewState: (status: StylePreviewStatus, message?: string | null, error?: string | null) => void;
  cacheStylePreview: (styleId: string, entry: StylePreviewCacheEntry) => void;
  getCachedStylePreview: (styleId: string, orientation: Orientation) => StylePreviewCacheEntry | undefined;
  clearStylePreviewCache: () => void;
  startStylePreview: (style: StyleOption, options?: StartPreviewOptions) => Promise<void>;
  resetPreviews: () => void;
  generatePreviews: (ids?: string[], options?: { force?: boolean; orientationOverride?: Orientation }) => Promise<void>;
  setAuthGateOpen: (open: boolean) => void;
  registerAuthGateIntent: (styleId: string, options?: StartPreviewOptions) => void;
  clearAuthGateIntent: () => void;
  resumePendingAuthPreview: () => Promise<void>;
};

export type SessionUser = {
  id: string;
  email: string | null;
};

export type SessionSlice = {
  sessionUser: SessionUser | null;
  accessToken: string | null;
  sessionHydrated: boolean;
  isAuthenticated: boolean;
  getSessionAccessToken: () => string | null;
  setSession: (user: SessionUser | null, accessToken: string | null) => void;
  signOut: () => Promise<void>;
};

export type EntitlementTier = 'free' | 'creator' | 'plus' | 'pro' | 'dev';
export type EntitlementPriority = 'normal' | 'priority' | 'pro';

export type EntitlementState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  tier: EntitlementTier;
  quota: number | null;
  remainingTokens: number | null;
  requiresWatermark: boolean;
  priority: EntitlementPriority;
  renewAt: string | null;
  lastSyncedAt: number | null;
  error: string | null;
};

export type EntitlementSlice = {
  entitlements: EntitlementState;
  showTokenToast: boolean;
  showQuotaModal: boolean;
  generationCount: number;
  setShowTokenToast: (show: boolean) => void;
  setShowQuotaModal: (show: boolean) => void;
  hydrateEntitlements: () => Promise<void>;
  updateEntitlementsFromResponse: (payload: {
    remainingTokens?: number | null;
    requiresWatermark?: boolean;
    tier?: string;
    priority?: string;
  }) => void;
  incrementGenerationCount: () => void;
  canGenerateMore: () => boolean;
  evaluateStyleGate: (styleId: string | null) => GateResult;
  canUseStyle: (styleId: string | null) => boolean;
  getGenerationLimit: () => number;
  getDisplayableRemainingTokens: () => number | null;
};

export type FavoritesSlice = {
  favoriteStyles: string[];
  toggleFavoriteStyle: (styleId: string) => void;
  isStyleFavorite: (styleId: string) => boolean;
  setFavoriteStyles: (styleIds: string[]) => void;
  clearFavoriteStyles: () => void;
};

export type GalleryStatus = 'idle' | 'loading' | 'ready' | 'error';

export type GalleryQuickviewItem = {
  id: string;
  styleId: string;
  styleName: string;
  orientation: 'square' | 'horizontal' | 'vertical';
  thumbnailUrl: string | null;
  imageUrl: string;
  displayUrl: string;
  storagePath: string;
  previewLogId: string | null;
  sourceStoragePath: string | null;
  sourceDisplayUrl: string | null;
  cropConfig: Record<string, unknown> | null;
  savedAt: string;
  position: number;
};

export type GallerySlice = {
  galleryItems: GalleryQuickviewItem[];
  galleryStatus: GalleryStatus;
  galleryError: string | null;
  galleryRequiresWatermark: boolean | null;
  lastFetchedAt: number | null;
  setGalleryItems: (items: GalleryQuickviewItem[], requiresWatermark: boolean | null) => void;
  setGalleryStatus: (status: GalleryStatus) => void;
  setGalleryError: (error: string | null) => void;
  touchGalleryFetchedAt: () => void;
  clearGallery: () => void;
  invalidateGallery: () => void;
  setGalleryRequiresWatermark: (requires: boolean | null) => void;
};

export type AuthSlice = SessionSlice &
  EntitlementSlice & {
    prefetchAuthClient: () => void;
  };

export type FounderBaseState = {
  styles: StyleOption[];
  enhancements: Enhancement[];
  selectedStyleId: string | null;
  basePrice: number;
  livingCanvasModalOpen: boolean;
  uploadedImage: string | null;
  croppedImage: string | null;
  currentImageHash: string | null;
  originalImage: string | null;
  originalImageDimensions: { width: number; height: number } | null;
  smartCrops: Partial<Record<Orientation, SmartCropResult>>;
  orientation: Orientation;
  orientationTip: string | null;
  orientationChanging: boolean;
  orientationPreviewPending: boolean;
  cropReadyAt: number | null;
  isDragging: boolean;
  celebrationAt: number | null;
  styleCarouselData: StyleCarouselCard[];
  hoveredStyleId: string | null;
  preselectedStyleId: string | null;
  launchpadExpanded: boolean;
  launchpadSlimMode: boolean;
  uploadIntentAt: number | null;
  selectedCanvasSize: CanvasSize | null;
  selectedFrame: FrameColor;
  canvasModalOpen: boolean;
  canvasModalSource: CanvasModalSource | null;
  canvasModalOpenedAt: number | null;
  lastCanvasModalSource: CanvasModalSource | null;
  canvasSelections: Record<string, CanvasSelection>;
  loadedStyleIds: Set<string>;
  pendingStyleLoads: Map<string, Promise<void>>;
  setLivingCanvasModalOpen: (open: boolean) => void;
  setUploadedImage: (dataUrl: string | null) => void;
  setCroppedImage: (dataUrl: string | null) => void;
  setCurrentImageHash: (hash: string | null) => void;
  setOriginalImage: (dataUrl: string | null) => void;
  setOriginalImageDimensions: (dimensions: { width: number; height: number } | null) => void;
  setSmartCropForOrientation: (orientation: Orientation, result: SmartCropResult) => void;
  clearSmartCrops: () => void;
  setOrientation: (orientation: Orientation) => void;
  setOrientationTip: (tip: string | null) => void;
  setOrientationChanging: (loading: boolean) => void;
  setOrientationPreviewPending: (pending: boolean) => void;
  markCropReady: () => void;
  setDragging: (dragging: boolean) => void;
  setLaunchpadExpanded: (expanded: boolean) => void;
  setLaunchpadSlimMode: (slim: boolean) => void;
  setHoveredStyle: (id: string | null) => void;
  setPreselectedStyle: (id: string | null) => void;
  requestUpload: (options?: { preselectedStyleId?: string }) => void;
  setCanvasSize: (size: CanvasSize | null) => void;
  setFrame: (frame: FrameColor) => void;
  persistCanvasSelection: () => void;
  loadCanvasSelectionForStyle: (styleId: string | null) => void;
  openCanvasModal: (source: CanvasModalSource) => void;
  closeCanvasModal: (reason: CanvasModalCloseReason) => void;
  selectStyle: (id: string) => void;
  toggleEnhancement: (id: string) => void;
  setEnhancementEnabled: (id: string, enabled: boolean) => void;
  computedTotal: () => number;
  currentStyle: () => StyleOption | undefined;
  livingCanvasEnabled: () => boolean;
  shouldAutoGeneratePreviews: () => boolean;
  ensureStyleLoaded: (styleId: string) => Promise<StyleOption | null>;
  ensureStylesLoaded: (styleIds: string[]) => Promise<void>;
  favoriteStyles: string[];
  toggleFavoriteStyle: (styleId: string) => void;
  isStyleFavorite: (styleId: string) => boolean;
  setFavoriteStyles: (styleIds: string[]) => void;
  clearFavoriteStyles: () => void;
};

export type FounderState = FounderBaseState & PreviewSlice & AuthSlice & FavoritesSlice & GallerySlice;

/**
 * Helper signature for slice creators. Centralizing here makes generics consistent across slices.
 */
export type FounderStateCreator<TSlice> = StateCreator<FounderState, [], [], TSlice>;
