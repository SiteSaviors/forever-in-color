import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useStudioConfiguratorState = () =>
  useFounderStore(
    (state) => ({
      sessionUser: state.sessionUser,
      sessionAccessToken: state.getSessionAccessToken(),
      styles: state.styles,
      previews: state.previews,
      currentStyle: state.currentStyle(),
      entitlements: state.entitlements,
      firstPreviewCompleted: state.firstPreviewCompleted,
      generationCount: state.generationCount,
      croppedImage: state.croppedImage,
      orientation: state.orientation,
      pendingStyleId: state.pendingStyleId,
      stylePreviewStatus: state.stylePreviewStatus,
      stylePreviewMessage: state.stylePreviewMessage,
      stylePreviewError: state.stylePreviewError,
      orientationPreviewPending: state.orientationPreviewPending,
      livingCanvasModalOpen: state.livingCanvasModalOpen,
      launchpadExpanded: state.launchpadExpanded,
      displayRemainingTokens: state.getDisplayableRemainingTokens(),
      userTier: state.entitlements?.tier ?? 'free',
      requiresWatermark: state.entitlements?.requiresWatermark ?? true,
    }),
    shallow
  );

export const useStudioConfiguratorActions = () =>
  useFounderStore(
    (state) => ({
      setLaunchpadExpanded: state.setLaunchpadExpanded,
      openCanvasModal: state.openCanvasModal,
      hydrateEntitlements: state.hydrateEntitlements,
    }),
    shallow
  );
