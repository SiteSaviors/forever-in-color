import { useFounderStore } from '../useFounderStore';

/**
 * Derives the current Zustand store shape so slice refactors can be type-driven
 * without mutating runtime behavior. These aliases intentionally mirror the
 * existing monolithic store and will be narrowed incrementally in later phases.
 */
export type FounderStoreState = ReturnType<typeof useFounderStore.getState>;

/**
 * Session-centric state and actions: Supabase session, auth flags, and logout.
 */
export type FounderSessionStateSnapshot = Pick<
  FounderStoreState,
  'sessionUser' | 'accessToken' | 'sessionHydrated' | 'isAuthenticated'
>;

export type FounderSessionActionsSnapshot = Pick<FounderStoreState, 'setSession' | 'signOut'>;

/**
 * Entitlement, quota, and anonymous token management with supporting actions.
 */
export type FounderEntitlementStateSnapshot = Pick<
  FounderStoreState,
  | 'entitlements'
  | 'showTokenToast'
  | 'showQuotaModal'
  | 'generationCount'
>;

export type FounderEntitlementActionsSnapshot = Pick<
  FounderStoreState,
  | 'hydrateEntitlements'
  | 'updateEntitlementsFromResponse'
  | 'setShowTokenToast'
  | 'setShowQuotaModal'
  | 'incrementGenerationCount'
  | 'canGenerateMore'
  | 'getGenerationLimit'
  | 'getDisplayableRemainingTokens'
>;

/**
 * Combined auth helpers exposed by the consolidated slice.
 */
export type FounderAuthActionsSnapshot = Pick<
  FounderStoreState,
  | 'prefetchAuthClient'
  | 'setSession'
  | 'signOut'
  | 'hydrateEntitlements'
  | 'updateEntitlementsFromResponse'
>;

/**
 * Media pipeline state: uploads, crops, orientation, and launchpad layout flags.
 */
export type FounderMediaStateSnapshot = Pick<
  FounderStoreState,
  | 'uploadedImage'
  | 'croppedImage'
  | 'originalImage'
  | 'originalImageDimensions'
  | 'smartCrops'
  | 'orientation'
  | 'orientationTip'
  | 'orientationChanging'
  | 'orientationPreviewPending'
  | 'selectedCanvasSize'
  | 'selectedFrame'
  | 'launchpadExpanded'
  | 'launchpadSlimMode'
  | 'cropReadyAt'
  | 'isDragging'
  | 'uploadIntentAt'
>;

export type FounderMediaActionsSnapshot = Pick<
  FounderStoreState,
  | 'setOrientationChanging'
  | 'setOrientationPreviewPending'
  | 'setLaunchpadExpanded'
  | 'setLaunchpadSlimMode'
  | 'setCanvasSize'
  | 'setFrame'
  | 'setSmartCropForOrientation'
  | 'clearSmartCrops'
  | 'setCroppedImage'
  | 'setOriginalImage'
  | 'setOriginalImageDimensions'
  | 'setOrientation'
  | 'setOrientationTip'
  | 'markCropReady'
  | 'setDragging'
  | 'requestUpload'
>;

/**
 * Preview orchestration state covering cached previews, statuses, and selections.
 */
export type FounderPreviewStateSnapshot = Pick<
  FounderStoreState,
  | 'styles'
  | 'enhancements'
  | 'selectedStyleId'
  | 'basePrice'
  | 'previewStatus'
  | 'previewGenerationPromise'
  | 'previews'
  | 'pendingStyleId'
  | 'stylePreviewStatus'
  | 'stylePreviewMessage'
  | 'stylePreviewError'
  | 'stylePreviewCache'
  | 'stylePreviewCacheOrder'
  | 'stylePreviewStartAt'
  | 'firstPreviewCompleted'
>;

export type FounderPreviewActionsSnapshot = Pick<
  FounderStoreState,
  | 'selectStyle'
  | 'toggleEnhancement'
  | 'setEnhancementEnabled'
  | 'setPreviewStatus'
  | 'setPreviewState'
  | 'setPendingStyle'
  | 'setStylePreviewState'
  | 'cacheStylePreview'
  | 'getCachedStylePreview'
  | 'clearStylePreviewCache'
  | 'startStylePreview'
  | 'resetPreviews'
  | 'generatePreviews'
  | 'computedTotal'
  | 'currentStyle'
  | 'livingCanvasEnabled'
>;

/**
 * UI convenience state: carousels, modals, and celebratory cues.
 */
export type FounderUiStateSnapshot = Pick<
  FounderStoreState,
  | 'livingCanvasModalOpen'
  | 'styleCarouselData'
  | 'hoveredStyleId'
  | 'preselectedStyleId'
  | 'celebrationAt'
>;

export type FounderUiActionsSnapshot = Pick<
  FounderStoreState,
  'setHoveredStyle' | 'setPreselectedStyle'
>;

/**
 * Favourites state: tracked style ids for quick access across experiences.
 */
export type FounderFavoritesStateSnapshot = Pick<FounderStoreState, 'favoriteStyles'>;

export type FounderFavoritesActionsSnapshot = Pick<
  FounderStoreState,
  'toggleFavoriteStyle' | 'isStyleFavorite' | 'setFavoriteStyles' | 'clearFavoriteStyles'
>;
