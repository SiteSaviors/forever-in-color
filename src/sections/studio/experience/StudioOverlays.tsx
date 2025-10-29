import { Suspense, lazy } from 'react';
import { ENABLE_STUDIO_V2_CANVAS_MODAL } from '@/config/featureFlags';
import { useStudioOverlayContext } from '@/sections/studio/experience/context';
import { useStudioEntitlementState } from '@/store/hooks/studio/useStudioEntitlementState';
import { useStudioPreviewState } from '@/store/hooks/studio/useStudioPreviewState';
import { useStudioUiState } from '@/store/hooks/studio/useStudioUiState';

const LivingCanvasModal = lazy(() => import('@/components/studio/LivingCanvasModal'));
const DownloadUpgradeModal = lazy(() => import('@/components/modals/DownloadUpgradeModal'));
const MobileStyleDrawer = lazy(() => import('@/components/studio/MobileStyleDrawer'));
const CanvasUpsellToast = lazy(() => import('@/components/studio/CanvasUpsellToast'));
const CanvasCheckoutModalLazy = lazy(() => import('@/components/studio/CanvasCheckoutModal'));

type StudioOverlaysProps = {
  onRequestCanvas: (source: 'center' | 'rail') => void;
};

const StudioOverlays = ({ onRequestCanvas }: StudioOverlaysProps) => {
  const {
    isDownloadUpgradeOpen,
    closeDownloadUpgrade,
    isCanvasUpsellToastVisible,
    hideCanvasUpsellToast,
    isMobileDrawerOpen,
    setMobileDrawerOpen,
  } = useStudioOverlayContext();
  const { entitlements, displayRemainingTokens } = useStudioEntitlementState();
  const { hasCroppedImage } = useStudioPreviewState();
  const { livingCanvasModalOpen } = useStudioUiState();

  return (
    <>
      <Suspense fallback={null}>
        {livingCanvasModalOpen && <LivingCanvasModal />}
      </Suspense>

      <Suspense fallback={null}>
        <DownloadUpgradeModal isOpen={isDownloadUpgradeOpen} onClose={closeDownloadUpgrade} />
      </Suspense>

      <Suspense fallback={null}>
        <MobileStyleDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          hasCroppedImage={hasCroppedImage}
          remainingTokens={displayRemainingTokens}
          userTier={entitlements.tier}
        />
      </Suspense>

      <Suspense fallback={null}>
        <CanvasUpsellToast
          show={isCanvasUpsellToastVisible}
          onDismiss={hideCanvasUpsellToast}
          onCanvasClick={() => {
            hideCanvasUpsellToast();
            onRequestCanvas('rail');
          }}
        />
      </Suspense>

      {ENABLE_STUDIO_V2_CANVAS_MODAL && (
        <Suspense fallback={null}>
          <CanvasCheckoutModalLazy />
        </Suspense>
      )}
    </>
  );
};

export default StudioOverlays;
