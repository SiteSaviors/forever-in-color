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
  previewLogId?: string | null;
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
  resumePendingAuthPreview: () => Promise<void>;
  abortPreviewGeneration: () => void;
};

export type SessionUser = {
  id: string;
  email: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
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
  premiumTokens: number | null;
  freeMonthlyTokens: number | null;
  hasPremiumAccess: boolean;
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
    premiumTokens?: number | null;
    freeMonthlyTokens?: number | null;
    hasPremiumAccess?: boolean;
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
  consumePreviewToken: () => void;
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
  sourceSignedUrl: string | null;
  sourceSignedUrlExpiresAt: number | null;
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
  removeGalleryItem: (id: string) => void;
};

// Stock Library Types
export type StockCategory =
  | 'all'
  | 'nature-outdoors'
  | 'animals-wildlife'
  | 'people-portraits'
  | 'food-culture'
  | 'abstract-texture'
  | 'scifi-fantasy'
  | 'classic-vintage';

export const STOCK_CATEGORIES: Record<
  Exclude<StockCategory, 'all'>,
  { id: StockCategory; name: string; description: string }
> = {
  'nature-outdoors': {
    id: 'nature-outdoors',
    name: 'Nature & Outdoors',
    description: 'Mountains, forests, oceans, and natural vistas',
  },
  'animals-wildlife': {
    id: 'animals-wildlife',
    name: 'Animals & Wildlife',
    description: 'Pets, wildlife, and animal portraits',
  },
  'people-portraits': {
    id: 'people-portraits',
    name: 'People & Portraits',
    description: 'Human portraits and lifestyle photography',
  },
  'food-culture': {
    id: 'food-culture',
    name: 'Food & Culture',
    description: 'Culinary scenes and cultural moments',
  },
  'abstract-texture': {
    id: 'abstract-texture',
    name: 'Abstract & Texture',
    description: 'Patterns, textures, and abstract compositions',
  },
  'scifi-fantasy': {
    id: 'scifi-fantasy',
    name: 'Sci-Fi & Fantasy',
    description: 'Futuristic and fantastical imagery',
  },
  'classic-vintage': {
    id: 'classic-vintage',
    name: 'Classic & Vintage',
    description: 'Timeless and nostalgic photography',
  },
};

export type StockImage = {
  id: string;
  category: StockCategory;
  title: string;
  tags: string[];
  thumbnailUrl: string;
  fullUrl: string;
  aspectRatio: number;
  orientation: 'horizontal' | 'vertical' | 'square';
  toneHints: string[];
  colorPalette: string[];
  curatedRank: number;
  requiredTier?: 'free' | 'creator' | 'plus' | 'pro' | null;
};

export type StockLibraryView = 'category-selector' | 'grid-browser';
export type StockLibraryStatus = 'idle' | 'loading' | 'ready' | 'error';

export type StockLibrarySlice = {
  // Modal state
  stockLibraryModalOpen: boolean;
  currentView: StockLibraryView;

  // Category/filter state
  selectedCategory: StockCategory;
  searchQuery: string;
  sortMode: 'recommended' | 'popular';
  accessFilters: {
    free: boolean;
    premium: boolean;
  };
  orientationFilters: {
    horizontal: boolean;
    vertical: boolean;
    square: boolean;
  };

  // Pagination state
  stockImages: StockImage[];
  hasNextPage: boolean;
  nextCursor: string | null;
  currentPage: number;

  // Loading/error state
  stockStatus: StockLibraryStatus;
  stockError: string | null;

  // Applied image tracking
  appliedStockImageId: string | null;
  appliedStockImage: StockImage | null;

  // Modal session tracking
  modalOpenedAt: number | null;
  viewedImageIds: Set<string>;

  // Actions
  openStockLibrary: () => void;
  closeStockLibrary: () => void;
  closeStockLibraryWithReason: (reason: 'dismiss' | 'upload_own' | 'esc_key' | 'backdrop') => void;
  setView: (view: StockLibraryView) => void;
  setCategory: (category: StockCategory) => void;
  setSearchQuery: (query: string) => void;
  setSortMode: (mode: 'recommended' | 'popular') => void;
  toggleAccessFilter: (tier: 'free' | 'premium') => void;
  toggleOrientationFilter: (orientation: 'horizontal' | 'vertical' | 'square') => void;
  resetFilters: () => void;
  appendStockImages: (images: StockImage[], nextCursor: string | null) => void;
  resetStockImages: () => void;
  setStockStatus: (status: StockLibraryStatus) => void;
  setStockError: (error: string | null) => void;
  applyStockImage: (image: StockImage) => void;
  clearAppliedStockImage: () => void;
  continueWithStockImage: () => Promise<void>;
  markImageViewed: (imageId: string) => void;
  fetchStockImages: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  retryFetch: () => void;
  getActiveFilterCount: () => number;
  hasActiveFilters: () => boolean;
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
  originalImageStoragePath: string | null;
  originalImagePublicUrl: string | null;
  originalImageSignedUrl: string | null;
  originalImageSignedUrlExpiresAt: number | null;
  originalImageHash: string | null;
  originalImageBytes: number | null;
  originalImagePreviewLogId: string | null;
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
  setOriginalImageSource: (payload: {
    storagePath: string | null;
    publicUrl: string | null;
    signedUrl: string | null;
    signedUrlExpiresAt: number | null;
    hash: string | null;
    bytes: number | null;
  } | null) => void;
  setOriginalImagePreviewLogId: (previewLogId: string | null) => void;
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
  clearSelectedStyle: () => void;
  toggleEnhancement: (id: string) => void;
  setEnhancementEnabled: (id: string, enabled: boolean) => void;
  computedTotal: () => number;
  currentStyle: () => StyleOption | undefined;
  livingCanvasEnabled: () => boolean;
  shouldAutoGeneratePreviews: () => boolean;
  ensureStyleLoaded: (styleId: string) => Promise<StyleOption | null>;
  ensureStylesLoaded: (styleIds: string[]) => Promise<void>;
  restoreOriginalImagePreview: (styleId?: string | null) => boolean;
  resetPreviewToEmptyState: (styleId?: string | null) => void;
  favoriteStyles: string[];
  toggleFavoriteStyle: (styleId: string) => void;
  isStyleFavorite: (styleId: string) => boolean;
  setFavoriteStyles: (styleIds: string[]) => void;
  clearFavoriteStyles: () => void;
};

export type FounderState = FounderBaseState & PreviewSlice & AuthSlice & FavoritesSlice & GallerySlice & StockLibrarySlice;

/**
 * Helper signature for slice creators. Centralizing here makes generics consistent across slices.
 */
export type FounderStateCreator<TSlice> = StateCreator<FounderState, [], [], TSlice>;
