import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';

export const useLaunchpadState = () =>
  useFounderStore(
    (state) => ({
      launchpadExpanded: state.launchpadExpanded,
      launchpadSlimMode: state.launchpadSlimMode,
      uploadedImage: state.uploadedImage,
      croppedImage: state.croppedImage,
      cropReadyAt: state.cropReadyAt,
      orientation: state.orientation,
      entitlementsStatus: state.entitlements.status,
      firstPreviewCompleted: state.firstPreviewCompleted,
      generationCount: state.generationCount,
    }),
    shallow
  );

export const useLaunchpadActions = () =>
  useFounderStore(
    (state) => ({
      setLaunchpadExpanded: state.setLaunchpadExpanded,
      setLaunchpadSlimMode: state.setLaunchpadSlimMode,
      hydrateEntitlements: state.hydrateEntitlements,
    }),
    shallow
  );
