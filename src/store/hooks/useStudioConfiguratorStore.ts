import {
  useStudioActions,
  useStudioEntitlementState,
  useStudioPreviewState,
  useStudioUiState,
  useStudioUserState,
} from '@/store/hooks/studio';

export const useStudioConfiguratorState = () =>
  (function useCompatState() {
    const user = useStudioUserState();
    const preview = useStudioPreviewState();
    const entitlements = useStudioEntitlementState();
    const ui = useStudioUiState();

    return {
      sessionUser: user.sessionUser,
      sessionAccessToken: user.sessionAccessToken,
      styles: preview.styles,
      currentStyle: preview.currentStyle,
      entitlements: entitlements.entitlements,
      firstPreviewCompleted: entitlements.firstPreviewCompleted,
      generationCount: entitlements.generationCount,
      croppedImage: preview.croppedImage,
      orientation: preview.orientation,
      pendingStyleId: preview.pendingStyleId,
      stylePreviewStatus: preview.stylePreviewStatus,
      stylePreviewMessage: preview.stylePreviewMessage,
      stylePreviewError: preview.stylePreviewError,
      orientationPreviewPending: preview.orientationPreviewPending,
      livingCanvasModalOpen: ui.livingCanvasModalOpen,
      launchpadExpanded: ui.launchpadExpanded,
      displayRemainingTokens: entitlements.displayRemainingTokens,
      userTier: entitlements.userTier,
      requiresWatermark: entitlements.requiresWatermark,
      // Additional derived helpers (opt-in for new modules)
      hasCroppedImage: preview.hasCroppedImage,
      previewReady: preview.previewReady,
      previewHasData: preview.previewHasData,
      orientationMismatch: preview.orientationMismatch,
      isAuthenticated: user.isAuthenticated,
    };
  })();

export const useStudioConfiguratorActions = () =>
  (function useCompatActions() {
    const actions = useStudioActions();
    return {
      setLaunchpadExpanded: actions.setLaunchpadExpanded,
      openCanvasModal: actions.openCanvasModal,
      hydrateEntitlements: actions.hydrateEntitlements,
    };
  })();

export {
  useStudioActions,
  useStudioEntitlementState,
  useStudioPreviewState,
  useStudioUiState,
  useStudioUserState,
};
