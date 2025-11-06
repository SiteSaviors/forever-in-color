import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import StudioHeader, { type CheckoutNotice } from '@/sections/studio/components/StudioHeader';
import CenterStage from '@/sections/studio/experience/CenterStage';
import { ENABLE_STUDIO_V2_CANVAS_MODAL } from '@/config/featureFlags';
import {
  StudioOverlayProvider,
  useStudioExperienceContext,
} from '@/sections/studio/experience/context';
import { useStudioPreviewState } from '@/store/hooks/studio/useStudioPreviewState';
import { useStudioEntitlementState } from '@/store/hooks/studio/useStudioEntitlementState';
import { useStudioActions } from '@/store/hooks/studio/useStudioActions';
import { useOrientationBridge } from '@/components/studio/orientation/useOrientationBridge';
import LeftRail from '@/sections/studio/experience/LeftRail';
import RightRail from '@/sections/studio/experience/RightRail';
import StudioOverlays from '@/sections/studio/experience/StudioOverlays';
import { useCanvasCtaHandlers } from '@/hooks/studio/useCanvasCtaHandlers';
import { useWelcomeBannerHandlers } from '@/hooks/studio/useWelcomeBannerHandlers';

const TokenWarningBanner = lazy(() => import('@/components/studio/TokenWarningBanner'));

export type StudioExperienceProps = {
  checkoutNotice?: CheckoutNotice | null;
  onDismissCheckoutNotice?: () => void;
};

const StudioExperience = ({ checkoutNotice, onDismissCheckoutNotice }: StudioExperienceProps) => {
  const { renderFeedback } = useStudioExperienceContext();
  const { currentStyle, hasCroppedImage } = useStudioPreviewState();
  const { entitlements } = useStudioEntitlementState();
  const { openCanvasModal, hydrateEntitlements } = useStudioActions();
  const { requestOrientationChange, orientationChanging } = useOrientationBridge();

  const [showDownloadUpgradeModal, setShowDownloadUpgradeModal] = useState(false);
  const [mobileStyleDrawerOpen, setMobileStyleDrawerOpen] = useState(false);
  const [showCanvasUpsellToast, setShowCanvasUpsellToast] = useState(false);
  const [canvasConfigExpanded, setCanvasConfigExpanded] = useState(true);

  const openDownloadUpgrade = useCallback(() => {
    setShowDownloadUpgradeModal(true);
  }, []);
  const closeDownloadUpgrade = useCallback(() => {
    setShowDownloadUpgradeModal(false);
  }, []);
  const showCanvasUpsell = useCallback(() => {
    setShowCanvasUpsellToast(true);
  }, []);
  const hideCanvasUpsell = useCallback(() => {
    setShowCanvasUpsellToast(false);
  }, []);
  const handleCanvasFallback = useCallback(() => {
    // Intentional no-op: legacy rail toggle preserved for now but no longer invoked as a fallback.
  }, []);
  const setMobileDrawerOpen = useCallback((open: boolean) => {
    setMobileStyleDrawerOpen(open);
  }, []);

  const { showReturningBanner, handleEditFromWelcome, handleDismissWelcome } = useWelcomeBannerHandlers();

  const scrollToCanvasOptions = useCallback(() => {
    const canvasPanel = document.getElementById('canvas-options-panel');
    canvasPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleOpenCanvas = useCallback(
    (source: 'center' | 'rail') => {
      if (!hasCroppedImage) {
        return;
      }

      if (ENABLE_STUDIO_V2_CANVAS_MODAL) {
        openCanvasModal(source);
        return;
      }

      scrollToCanvasOptions();
    },
    [hasCroppedImage, openCanvasModal, scrollToCanvasOptions]
  );

  const handleCanvasConfigToggle = useCallback(() => {
    setCanvasConfigExpanded((prev) => !prev);
    const canvasPanel = document.getElementById('canvas-options-panel');
    canvasPanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const { handleChangeOrientationFromRail } = useCanvasCtaHandlers({
    onOpenCanvas: handleOpenCanvas,
    onOrientationFallback: handleCanvasFallback,
    requestOrientationChange,
  });

  const overlayContextValue = useMemo(
    () => ({
      isDownloadUpgradeOpen: showDownloadUpgradeModal,
      openDownloadUpgrade,
      closeDownloadUpgrade,
      isCanvasUpsellToastVisible: showCanvasUpsellToast,
      showCanvasUpsellToast: showCanvasUpsell,
      hideCanvasUpsellToast: hideCanvasUpsell,
      isMobileDrawerOpen: mobileStyleDrawerOpen,
      setMobileDrawerOpen,
    }),
    [
      showDownloadUpgradeModal,
      openDownloadUpgrade,
      closeDownloadUpgrade,
      showCanvasUpsellToast,
      showCanvasUpsell,
      hideCanvasUpsell,
      mobileStyleDrawerOpen,
      setMobileDrawerOpen,
    ]
  );

  useEffect(() => {
    if (entitlements.status === 'idle') {
      void hydrateEntitlements();
    }
  }, [entitlements.status, hydrateEntitlements]);

  return (
    <StudioOverlayProvider value={overlayContextValue}>
      <section
        className="relative min-h-screen bg-slate-900"
        data-studio-section
        data-founder-anchor="studio"
        id="studio"
      >
        <StudioHeader
          currentStyleName={currentStyle?.name}
          showReturningBanner={showReturningBanner}
          onEditWelcome={handleEditFromWelcome}
          onDismissWelcome={handleDismissWelcome}
          checkoutNotice={checkoutNotice}
          onDismissCheckoutNotice={onDismissCheckoutNotice}
        />

        <Suspense fallback={null}>
          <TokenWarningBanner />
        </Suspense>

        <div className="mx-auto block max-w-[1800px] lg:flex">
          <LeftRail />

          <CenterStage
            onOpenCanvas={handleOpenCanvas}
            onCanvasConfigToggle={handleCanvasFallback}
            onRequestOrientationChange={requestOrientationChange}
            orientationChanging={orientationChanging}
          />

          <RightRail
            onRequestCanvas={handleOpenCanvas}
            onChangeOrientation={handleChangeOrientationFromRail}
            onCanvasConfigToggle={handleCanvasConfigToggle}
            canvasConfigExpanded={canvasConfigExpanded}
          />
        </div>

        <StudioOverlays onRequestCanvas={handleOpenCanvas} />

        {renderFeedback()}
      </section>
    </StudioOverlayProvider>
  );
};

export default StudioExperience;
