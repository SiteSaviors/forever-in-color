import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { clsx } from 'clsx';
import type { StylePreviewStatus } from '@/store/founder/storeTypes';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import { saveToGallery } from '@/utils/galleryApi';
import { downloadCleanImage } from '@/utils/premiumDownload';
import { trackDownloadSuccess } from '@/utils/telemetry';
import {
  trackLaunchflowEditReopen,
  trackLaunchflowEmptyStateInteraction,
  trackLaunchflowOpened,
} from '@/utils/launchflowTelemetry';
import { trackStudioV2CanvasCtaClick, trackStudioV2OrientationCta } from '@/utils/studioV2Analytics';
import StudioHeader, { type CheckoutNotice } from '@/sections/studio/components/StudioHeader';
import CanvasPreviewPanel from '@/sections/studio/components/CanvasPreviewPanel';
import { ENABLE_STUDIO_V2_CANVAS_MODAL, ENABLE_STUDIO_V2_INSIGHTS_RAIL } from '@/config/featureFlags';
import { useOrientationBridge } from '@/components/studio/orientation/useOrientationBridge';
import { useStudioConfiguratorActions, useStudioConfiguratorState } from '@/store/hooks/useStudioConfiguratorStore';
import { usePreviewEntry } from '@/store/hooks/usePreviewStore';
import { useAuthModal } from '@/store/useAuthModal';
import { useStudioExperienceContext } from '@/sections/studio/experience/context';
import LeftRail from '@/sections/studio/experience/LeftRail';

const TokenWarningBanner = lazy(() => import('@/components/studio/TokenWarningBanner'));
const StickyOrderRailLazy = lazy(() => import('@/components/studio/StickyOrderRail'));
const LivingCanvasModal = lazy(() => import('@/components/studio/LivingCanvasModal'));
const CanvasInRoomPreview = lazy(() => import('@/components/studio/CanvasInRoomPreview'));
const DownloadUpgradeModal = lazy(() => import('@/components/modals/DownloadUpgradeModal'));
const MobileStyleDrawer = lazy(() => import('@/components/studio/MobileStyleDrawer'));
const CanvasUpsellToast = lazy(() => import('@/components/studio/CanvasUpsellToast'));
const InsightsRailLazy = lazy(() => import('@/components/studio/InsightsRail'));
const CanvasCheckoutModalLazy = lazy(() => import('@/components/studio/CanvasCheckoutModal'));

const CanvasPreviewFallback = () => (
  <div className="h-[360px] w-full animate-pulse rounded-[2.5rem] border border-white/10 bg-slate-800/60" />
);

const StickyOrderRailFallback = () => (
  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
    <div className="flex flex-col gap-4">
      <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-10 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-10 animate-pulse rounded-2xl bg-white/5" />
      </div>
      <div className="h-12 animate-pulse rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30" />
    </div>
  </div>
);

const InsightsRailFallback = () => (
  <aside className="w-full px-4 py-6 lg:w-[420px] lg:p-6">
    <div className="space-y-4">
      <div className="h-6 w-48 animate-pulse rounded-full bg-white/10" />
      <div className="h-4 w-64 animate-pulse rounded-full bg-white/5" />
      <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
    </div>
  </aside>
);

const STORAGE_PATH_REGEX = /(preview-cache(?:-public|-premium)?\/.+)$/;

const extractStoragePathFromUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const match = url.match(STORAGE_PATH_REGEX);
  return match ? match[1] : null;
};

export type StudioExperienceProps = {
  checkoutNotice?: CheckoutNotice | null;
  onDismissCheckoutNotice?: () => void;
};

const StudioExperience = ({ checkoutNotice, onDismissCheckoutNotice }: StudioExperienceProps) => {
  const { showToast, showUpgradeModal, renderFeedback } = useStudioExperienceContext();

  const {
    sessionUser,
    sessionAccessToken,
    styles,
    currentStyle,
    entitlements,
    firstPreviewCompleted,
    generationCount,
    croppedImage,
    orientation,
    pendingStyleId,
    stylePreviewStatus,
    stylePreviewMessage,
    stylePreviewError,
    orientationPreviewPending,
    livingCanvasModalOpen,
    launchpadExpanded,
    displayRemainingTokens,
    userTier,
    requiresWatermark,
  } = useStudioConfiguratorState();

  const { setLaunchpadExpanded, openCanvasModal, hydrateEntitlements } = useStudioConfiguratorActions();
  const preview = usePreviewEntry(currentStyle?.id ?? null);
  const { requestOrientationChange, orientationChanging } = useOrientationBridge();
  const previewOrientationLabel = preview?.orientation ? ORIENTATION_PRESETS[preview.orientation].label : null;
  const orientationMismatch = Boolean(preview?.orientation && preview.orientation !== orientation);

  const [savingToGallery, setSavingToGallery] = useState(false);
  const [savedToGallery, setSavedToGallery] = useState(false);
  const [showDownloadUpgradeModal, setShowDownloadUpgradeModal] = useState(false);
  const [downloadingHD, setDownloadingHD] = useState(false);
  const [mobileStyleDrawerOpen, setMobileStyleDrawerOpen] = useState(false);
  const [showCanvasUpsellToast, setShowCanvasUpsellToast] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [canvasConfigExpanded, setCanvasConfigExpanded] = useState(true);
  const openAuthModal = useAuthModal((state) => state.openModal);

  const centerCtaThrottleRef = useRef<number>(0);
  const orientationCtaThrottleRef = useRef<number>(0);

  const overlayStyleName =
    (pendingStyleId ? styles.find((style) => style.id === pendingStyleId)?.name : currentStyle?.name) ??
    'Selected Style';
  const hasCroppedImage = Boolean(croppedImage);
  const displayPreviewUrl = preview?.data?.previewUrl ?? croppedImage ?? undefined;
  const previewHasData = Boolean(preview?.data?.previewUrl);
  const previewReady = preview?.status === 'ready';
  const returningUser = useMemo(() => {
    if (!hasCroppedImage || launchpadExpanded) return false;
    return firstPreviewCompleted || generationCount > 0;
  }, [generationCount, firstPreviewCompleted, hasCroppedImage, launchpadExpanded]);
  const showReturningBanner = returningUser && !welcomeDismissed;

  const isPremiumUser = !requiresWatermark;
  const [watermarkUpgradeShown, setWatermarkUpgradeShown] = useState(false);

  const handleDownloadHD = async () => {
    if (!currentStyle || !preview?.data?.previewUrl) {
      showToast({
        title: 'Download unavailable',
        description: 'Generate a preview before downloading.',
        variant: 'warning',
      });
      return;
    }

    setDownloadingHD(true);
    try {
      const filename = `wondertone-${currentStyle.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      const triggerDownload = (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      };

      if (requiresWatermark) {
        const downloadSource = preview.data.previewUrl;
        if (!downloadSource) {
          throw new Error('Missing preview URL for download');
        }

        const response = await fetch(downloadSource, { credentials: 'omit' });
        if (!response.ok) {
          throw new Error(`Failed to fetch watermarked preview (${response.status})`);
        }

        const blob = await response.blob();
        triggerDownload(blob);

        if (!watermarkUpgradeShown) {
          setWatermarkUpgradeShown(true);
          setShowDownloadUpgradeModal(true);
        }
      } else {
        const storagePath =
          preview.data.storagePath ??
          (preview.data.storageUrl ? extractStoragePathFromUrl(preview.data.storageUrl) : null) ??
          extractStoragePathFromUrl(preview.data.previewUrl);

        if (!storagePath) {
          throw new Error('Could not extract storage path from preview URL');
        }

        await downloadCleanImage({
          storagePath,
          filename,
          accessToken: sessionAccessToken,
        });
      }

      trackDownloadSuccess(userTier, currentStyle.id);
      setShowCanvasUpsellToast(true);
      setTimeout(() => setShowCanvasUpsellToast(false), 8000);
    } catch (error) {
      console.error('Failed to download HD image:', error);
      showToast({
        title: 'Download failed',
        description: 'Please try again in a moment.',
        variant: 'error',
      });
    } finally {
      setDownloadingHD(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!currentStyle || !preview?.data?.previewUrl) {
      showToast({
        title: 'Nothing to save',
        description: 'Generate a preview before saving to your gallery.',
        variant: 'warning',
      });
      return;
    }

    if (!sessionUser) {
      openAuthModal('signup');
      return;
    }

    setSavingToGallery(true);

    const storagePath =
      preview.data.storagePath ??
      (preview.data.storageUrl ? extractStoragePathFromUrl(preview.data.storageUrl) : null) ??
      extractStoragePathFromUrl(preview.data.previewUrl);

    if (!storagePath) {
      console.error('[StudioExperience] Missing storage path when saving to gallery', preview.data);
      showToast({
        title: 'Save failed',
        description: 'Unable to save preview. Please regenerate and try again.',
        variant: 'error',
      });
      setSavingToGallery(false);
      return;
    }

    const result = await saveToGallery({
      styleId: currentStyle.id,
      styleName: currentStyle.name,
      orientation,
      storagePath,
      accessToken: sessionAccessToken || null,
    });

    setSavingToGallery(false);

    if (result.success) {
      setSavedToGallery(true);
      setTimeout(() => setSavedToGallery(false), 3000);
      if (result.alreadyExists) {
        showToast({
          title: 'Already saved',
          description: 'This preview already lives in your gallery.',
          variant: 'info',
        });
      } else {
        showToast({
          title: 'Saved to gallery',
          description: `${currentStyle.name} is now in your gallery.`,
          variant: 'success',
        });
      }
    } else {
      showToast({
        title: 'Save failed',
        description: result.error ?? 'Unexpected error while saving.',
        variant: 'error',
      });
    }
  };

  const handleOpenLaunchflowFromEmptyState = () => {
    trackLaunchflowEmptyStateInteraction('open_launchflow');
    if (!launchpadExpanded) {
      trackLaunchflowOpened('empty_state');
    }
    setLaunchpadExpanded(true);
    const launchflowSection = document.getElementById('launchflow');
    launchflowSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBrowseStylesFromEmptyState = () => {
    trackLaunchflowEmptyStateInteraction('browse_styles');
    const stylesAnchor = document.querySelector<HTMLElement>('[data-founder-anchor="styles"]');
    stylesAnchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToCanvasOptions = useCallback(() => {
    const canvasPanel = document.getElementById('canvas-options-panel');
    canvasPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleOpenCanvas = useCallback(
    (source: 'center' | 'rail') => {
      if (!hasCroppedImage) {
        scrollToCanvasOptions();
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

  const handleCreateCanvasFromCenter = useCallback(() => {
    const now = Date.now();
    const style = currentStyle;
    const canTrack =
      !!style && hasCroppedImage && !orientationPreviewPending && (previewReady || previewHasData);
    if (canTrack && now - centerCtaThrottleRef.current > 250) {
      trackStudioV2CanvasCtaClick({
        styleId: style.id,
        orientation,
        source: 'center',
      });
      centerCtaThrottleRef.current = now;
    }
    handleOpenCanvas('center');
  }, [
    currentStyle,
    handleOpenCanvas,
    hasCroppedImage,
    orientation,
    orientationPreviewPending,
    previewHasData,
    previewReady,
  ]);

  const handleCanvasConfigToggle = useCallback(() => {
    setCanvasConfigExpanded((prev) => !prev);
    const canvasPanel = document.getElementById('canvas-options-panel');
    canvasPanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const handleChangeOrientationFromCenter = useCallback(() => {
    const now = Date.now();
    if (currentStyle && now - orientationCtaThrottleRef.current > 250) {
      trackStudioV2OrientationCta({
        styleId: currentStyle.id,
        orientation,
      });
      orientationCtaThrottleRef.current = now;
    } else {
      orientationCtaThrottleRef.current = now;
    }

    void requestOrientationChange(orientation).catch(() => {
      handleCanvasConfigToggle();
    });
  }, [currentStyle, handleCanvasConfigToggle, orientation, requestOrientationChange]);

  const handleEditFromWelcome = () => {
    trackLaunchflowOpened('welcome_banner');
    trackLaunchflowEditReopen('welcome_banner');
    setLaunchpadExpanded(true);
    setWelcomeDismissed(true);
  };

  const handleDismissWelcome = () => {
    setWelcomeDismissed(true);
  };

  useEffect(() => {
    if (entitlements.status === 'idle') {
      void hydrateEntitlements();
    }
  }, [entitlements.status, hydrateEntitlements]);

  useEffect(() => {
    if (launchpadExpanded) {
      setWelcomeDismissed(true);
    }
  }, [launchpadExpanded]);

  type OverlayStatus = Exclude<StylePreviewStatus, 'idle'>;
  const overlayStatus: OverlayStatus = stylePreviewStatus === 'idle' ? 'animating' : stylePreviewStatus;

  const downloadDisabled =
    !currentStyle || !hasCroppedImage || orientationPreviewPending || !previewHasData;

  const canvasLocked = !hasCroppedImage || orientationPreviewPending;

  return (
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
        <LeftRail onOpenMobileDrawer={() => setMobileStyleDrawerOpen(true)} />

        <CanvasPreviewPanel
          overlayStyleName={overlayStyleName}
          overlayStatus={overlayStatus}
          stylePreviewStatus={stylePreviewStatus}
          stylePreviewMessage={stylePreviewMessage}
          stylePreviewError={stylePreviewError}
          hasCroppedImage={hasCroppedImage}
          displayPreviewUrl={displayPreviewUrl}
          previewHasData={previewHasData}
          previewStateStatus={preview?.status}
          orientation={orientation}
          orientationPreviewPending={orientationPreviewPending}
          orientationChanging={orientationChanging}
          orientationMismatch={orientationMismatch}
          previewOrientationLabel={previewOrientationLabel}
          croppedImage={croppedImage}
          currentStyle={currentStyle ?? undefined}
          onSaveToGallery={handleSaveToGallery}
          savingToGallery={savingToGallery}
          savedToGallery={savedToGallery}
          launchpadExpanded={launchpadExpanded}
          onOpenLaunchflow={handleOpenLaunchflowFromEmptyState}
          onBrowseStyles={handleBrowseStylesFromEmptyState}
          onDownloadClick={handleDownloadHD}
          downloadingHD={downloadingHD}
          isPremiumUser={isPremiumUser}
          onCreateCanvas={handleCreateCanvasFromCenter}
          onChangeOrientation={handleChangeOrientationFromCenter}
          downloadDisabled={downloadDisabled}
          canvasLocked={canvasLocked}
        />

        {ENABLE_STUDIO_V2_INSIGHTS_RAIL ? (
          <Suspense fallback={<InsightsRailFallback />}>
            <InsightsRailLazy
              hasCroppedImage={hasCroppedImage}
              currentStyle={currentStyle ?? null}
              entitlements={entitlements}
              previewReady={preview?.status === 'ready' && Boolean(preview?.data?.previewUrl)}
              previewUrl={preview?.data?.previewUrl ?? null}
              orientation={orientation}
              onRequestCanvas={handleOpenCanvas}
              onToast={showToast}
              onGatePrompt={showUpgradeModal}
            />
          </Suspense>
        ) : (
          <aside
            className={clsx(
              'w-full transition-opacity duration-200 lg:w-[420px]',
              !hasCroppedImage && 'pointer-events-none opacity-50'
            )}
            aria-disabled={!hasCroppedImage}
          >
            <div className="px-4 py-6 lg:sticky lg:top-[57px] lg:p-6">
              <div className="space-y-6 lg:max-h-[calc(100vh-88px)] lg:overflow-y-auto lg:pr-3 lg:-mr-3">
                {!hasCroppedImage && (
                  <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    Upload a photo to customize canvas options and checkout.
                  </div>
                )}
                <Suspense fallback={<StickyOrderRailFallback />}>
                  <StickyOrderRailLazy
                    canvasConfigExpanded={canvasConfigExpanded}
                    mobileRoomPreview={
                      <div className="w-full lg:hidden">
                        <div className="mb-4 space-y-1 px-4 text-center">
                          <h3 className="text-xl font-bold text-white">See It In Your Space</h3>
                          <p className="mx-auto max-w-md text-xs text-white/60">
                            Visualize how your canvas will look in a real living room
                          </p>
                        </div>
                        <Suspense fallback={<CanvasPreviewFallback />}>
                          <CanvasInRoomPreview enableHoverEffect showDimensions={false} />
                        </Suspense>
                      </div>
                    }
                    onCanvasConfigToggle={handleCanvasConfigToggle}
                    canvasConfigExpanded={canvasConfigExpanded}
                    hasCroppedImage={hasCroppedImage}
                    previewReady={previewReady}
                    orientation={orientation}
                    isPremiumUser={isPremiumUser}
                    onCreateCanvas={() => handleOpenCanvas('rail')}
                    onChangeOrientation={handleChangeOrientationFromCenter}
                    onUpgrade={() =>
                      showUpgradeModal({
                        title: 'Unlock clean previews & downloads',
                        description: 'Upgrade to remove watermarks and receive premium perks.',
                      })
                    }
                  />
                </Suspense>
              </div>
            </div>
          </aside>
        )}
      </div>

      <Suspense fallback={null}>
        {livingCanvasModalOpen && <LivingCanvasModal />}
      </Suspense>

      <Suspense fallback={null}>
        <DownloadUpgradeModal
          isOpen={showDownloadUpgradeModal}
          onClose={() => setShowDownloadUpgradeModal(false)}
        />
      </Suspense>

      <Suspense fallback={null}>
        <MobileStyleDrawer
          isOpen={mobileStyleDrawerOpen}
          onClose={() => setMobileStyleDrawerOpen(false)}
          hasCroppedImage={hasCroppedImage}
          remainingTokens={displayRemainingTokens}
          userTier={entitlements.tier}
        />
      </Suspense>

      <Suspense fallback={null}>
        <CanvasUpsellToast
          show={showCanvasUpsellToast}
          onDismiss={() => setShowCanvasUpsellToast(false)}
          onCanvasClick={() => {
            setShowCanvasUpsellToast(false);
            handleOpenCanvas('rail');
          }}
        />
      </Suspense>

      {ENABLE_STUDIO_V2_CANVAS_MODAL && (
        <Suspense fallback={null}>
          <CanvasCheckoutModalLazy />
        </Suspense>
      )}

      {renderFeedback()}
    </section>
  );
};

export default StudioExperience;
