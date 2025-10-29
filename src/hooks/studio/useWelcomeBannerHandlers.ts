import { useCallback, useEffect, useMemo, useState } from 'react';
import { trackLaunchflowEditReopen, trackLaunchflowOpened } from '@/utils/launchflowTelemetry';
import { useStudioPreviewState } from '@/store/hooks/studio/useStudioPreviewState';
import { useStudioEntitlementState } from '@/store/hooks/studio/useStudioEntitlementState';
import { useStudioUiState } from '@/store/hooks/studio/useStudioUiState';
import { useStudioActions } from '@/store/hooks/studio/useStudioActions';

export const useWelcomeBannerHandlers = () => {
  const { hasCroppedImage } = useStudioPreviewState();
  const { firstPreviewCompleted, generationCount } = useStudioEntitlementState();
  const { launchpadExpanded } = useStudioUiState();
  const { setLaunchpadExpanded } = useStudioActions();

  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    if (launchpadExpanded) {
      setWelcomeDismissed(true);
    }
  }, [launchpadExpanded]);

  const showReturningBanner = useMemo(() => {
    if (!hasCroppedImage || launchpadExpanded) return false;
    return firstPreviewCompleted || generationCount > 0;
  }, [firstPreviewCompleted, generationCount, hasCroppedImage, launchpadExpanded]);

  const handleEditFromWelcome = useCallback(() => {
    trackLaunchflowOpened('welcome_banner');
    trackLaunchflowEditReopen('welcome_banner');
    setLaunchpadExpanded(true);
    setWelcomeDismissed(true);
  }, [setLaunchpadExpanded]);

  const handleDismissWelcome = useCallback(() => {
    setWelcomeDismissed(true);
  }, []);

  return {
    showReturningBanner,
    handleEditFromWelcome,
    handleDismissWelcome,
    welcomeDismissed,
  };
};

