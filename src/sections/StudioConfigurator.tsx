import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useFounderStore, StylePreviewStatus } from '@/store/useFounderStore';
import { useAuthModal } from '@/store/useAuthModal';
import { useStudioFeedback } from '@/hooks/useStudioFeedback';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import { saveToGallery } from '@/utils/galleryApi';
import { downloadCleanImage } from '@/utils/premiumDownload';
import { trackDownloadSuccess } from '@/utils/telemetry';
import { trackLaunchflowEditReopen, trackLaunchflowEmptyStateInteraction, trackLaunchflowOpened } from '@/utils/launchflowTelemetry';
import { trackStudioV2CanvasCtaClick, trackStudioV2OrientationCta } from '@/utils/studioV2Analytics';
import StudioHeader, { CheckoutNotice } from '@/sections/studio/components/StudioHeader';
import StyleSidebarFallback from '@/sections/studio/components/StyleSidebarFallback';
import CanvasPreviewPanel from '@/sections/studio/components/CanvasPreviewPanel';
import { ENABLE_STUDIO_V2_CANVAS_MODAL, ENABLE_STUDIO_V2_INSIGHTS_RAIL } from '@/config/featureFlags';
import { OrientationBridgeProvider } from '@/components/studio/orientation/OrientationBridgeProvider';
import { useOrientationBridge } from '@/components/studio/orientation/useOrientationBridge';

const TokenWarningBanner = lazy(() => import('@/components/studio/TokenWarningBanner'));
const StickyOrderRailLazy = lazy(() => import('@/components/studio/StickyOrderRail'));
const LivingCanvasModal = lazy(() => import('@/components/studio/LivingCanvasModal'));
const CanvasInRoomPreview = lazy(() => import('@/components/studio/CanvasInRoomPreview'));
const DownloadUpgradeModal = lazy(() => import('@/components/modals/DownloadUpgradeModal'));
const MobileStyleDrawer = lazy(() => import('@/components/studio/MobileStyleDrawer'));
const CanvasUpsellToast = lazy(() => import('@/components/studio/CanvasUpsellToast'));
const StyleSidebar = lazy(() => import('@/sections/studio/components/StyleSidebar'));
const InsightsRailLazy = lazy(() => import('@/components/studio/InsightsRail'));
const CanvasCheckoutModalLazy = lazy(() => import('@/components/studio/CanvasCheckoutModal'));

const CanvasPreviewFallback = () => (
  <div className="w-full h-[360px] rounded-[2.5rem] bg-slate-800/60 border border-white/10 animate-pulse" />
);

const StickyOrderRailFallback = () => (
  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
    <div className="flex flex-col gap-4">
      <div className="h-6 w-32 rounded-full bg-white/10 animate-pulse" />
      <div className="space-y-3">
        <div className="h-10 rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-10 rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-10 rounded-2xl bg-white/5 animate-pulse" />
      </div>
      <div className="h-12 rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 animate-pulse" />
    </div>
  </div>
);

const InsightsRailFallback = () => (
  <aside className="w-full lg:w-[420px] px-4 py-6 lg:p-6">
    <div className="space-y-4">
      <div className="h-6 w-48 rounded-full bg-white/10 animate-pulse" />
      <div className="h-4 w-64 rounded-full bg-white/5 animate-pulse" />
      <div className="h-48 rounded-3xl border border-white/10 bg-white/5 animate-pulse" />
      <div className="h-48 rounded-3xl border border-white/10 bg-white/5 animate-pulse" />
    </div>
  </aside>
);

const STORAGE_PATH_REGEX = /(preview-cache(?:-public|-premium)?\/.+)$/;

const extractStoragePathFromUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const match = url.match(STORAGE_PATH_REGEX);
  return match ? match[1] : null;
};

type StudioConfiguratorProps = {
  checkoutNotice?: CheckoutNotice | null;
  onDismissCheckoutNotice?: () => void;
};

type StudioConfiguratorInnerProps = StudioConfiguratorProps & {
  showToast: ReturnType<typeof useStudioFeedback>['showToast'];
  showUpgradeModal: ReturnType<typeof useStudioFeedback>['showUpgradeModal'];
  renderFeedback: ReturnType<typeof useStudioFeedback>['renderFeedback'];
};

const StudioConfiguratorInner = ({
  checkoutNotice,
  onDismissCheckoutNotice,
  showToast,
  showUpgradeModal,
  renderFeedback,
}: StudioConfiguratorInnerProps) => {
  const sessionUser = useFounderStore((state) => state.sessionUser);
  const sessionAccessToken = useFounderStore((state) => state.getSessionAccessToken());
  const styles = useFounderStore((state) => state.styles);
  const previews = useFounderStore((state) => state.previews);
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const preview = currentStyle ? previews[currentStyle.id] : undefined;
  const entitlements = useFounderStore((state) => state.entitlements);
  const hydrateEntitlements = useFounderStore((state) => state.hydrateEntitlements);
  const firstPreviewCompleted = useFounderStore((state) => state.firstPreviewCompleted);
  const generationCount = useFounderStore((state) => state.generationCount);
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const orientation = useFounderStore((state) => state.orientation);
  const pendingStyleId = useFounderStore((state) => state.pendingStyleId);
  const stylePreviewStatus = useFounderStore((state) => state.stylePreviewStatus);
  const stylePreviewMessage = useFounderStore((state) => state.stylePreviewMessage);
  const stylePreviewError = useFounderStore((state) => state.stylePreviewError);
  const orientationPreviewPending = useFounderStore((state) => state.orientationPreviewPending);
  const { requestOrientationChange, orientationChanging } = useOrientationBridge();
  const livingCanvasModalOpen = useFounderStore((state) => state.livingCanvasModalOpen);
  const launchpadExpanded = useFounderStore((state) => state.launchpadExpanded);
  const setLaunchpadExpanded = useFounderStore((state) => state.setLaunchpadExpanded);
  const displayRemainingTokens = useFounderStore((state) => state.getDisplayableRemainingTokens());
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
  const openCanvasModal = useFounderStore((state) => state.openCanvasModal);

  const centerCtaThrottleRef = useRef<number>(0);
  const orientationCtaThrottleRef = useRef<number>(0);


  const overlayStyleName =
    (pendingStyleId ? styles.find((style) => style.id === pendingStyleId)?.name : currentStyle?.name) ??
    'Selected Style';
  const hasCroppedImage = Boolean(croppedImage);
  const displayPreviewUrl = preview?.data?.previewUrl ?? (croppedImage ?? undefined);
  const previewHasData = Boolean(preview?.data?.previewUrl);
  const returningUser = useMemo(() => {
    if (!hasCroppedImage || launchpadExpanded) return false;
    return firstPreviewCompleted || generationCount > 0;
  }, [generationCount, firstPreviewCompleted, hasCroppedImage, launchpadExpanded]);
  const showReturningBanner = returningUser && !welcomeDismissed;

  // Get user tier from entitlements
  const userTier = useFounderStore((state) => state.entitlements?.tier ?? 'free');
  const previewReady = preview?.status === 'ready';

  const requiresWatermark = useFounderStore((state) => state.entitlements?.requiresWatermark ?? true);
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

        console.log('[StudioConfigurator] Clean image downloaded successfully');
      }

      // Track successful download
      trackDownloadSuccess(userTier, currentStyle.id);

      // Show canvas upsell toast after successful download
      setShowCanvasUpsellToast(true);
      setTimeout(() => setShowCanvasUpsellToast(false), 8000); // Auto-dismiss after 8s
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

    // Only provide cleanUrl if user has premium access (preview not watermarked)
    // Server will validate this matches their tier
    const storagePath =
      preview.data.storagePath ??
      (preview.data.storageUrl ? extractStoragePathFromUrl(preview.data.storageUrl) : null) ??
      extractStoragePathFromUrl(preview.data.previewUrl);

    if (!storagePath) {
      console.error('[StudioConfigurator] Missing storage path when saving to gallery', preview.data);
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
    if (launchflowSection) {
      launchflowSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBrowseStylesFromEmptyState = () => {
    trackLaunchflowEmptyStateInteraction('browse_styles');
    const stylesAnchor = document.querySelector('[data-founder-anchor="styles"]');
    if (stylesAnchor) {
      stylesAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToCanvasOptions = useCallback(() => {
    const canvasPanel = document.getElementById('canvas-options-panel');
    if (canvasPanel) {
      canvasPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      !!style &&
      hasCroppedImage &&
      !orientationPreviewPending &&
      (previewReady || previewHasData);
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
    setCanvasConfigExpanded(prev => !prev);
    // Scroll to right rail canvas config
    const canvasPanel = document.getElementById('canvas-options-panel');
    if (canvasPanel) {
      canvasPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
  // Calculate disabled states for ActionGrid CTAs
  const downloadDisabled =
    !currentStyle ||
    !hasCroppedImage ||
    orientationPreviewPending ||
    !previewHasData;

  const canvasLocked =
    !hasCroppedImage ||
    orientationPreviewPending;

  return (
    <section
      className="bg-slate-900 min-h-screen relative"
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

      {/* Mobile Floating Action Button - Style Picker */}
      {croppedImage && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            type="button"
            onClick={() => setMobileStyleDrawerOpen(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-3.5 rounded-full shadow-glow-purple active:scale-95 transition-transform duration-150"
            aria-label="Open style picker"
            style={{
              paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Current style thumbnail */}
            {currentStyle?.thumbnail && (
              <div className="w-11 h-11 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0 bg-slate-800">
                <img
                  src={currentStyle.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Label */}
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold leading-tight">
                Style
              </span>
              <span className="text-sm font-bold leading-tight">
                {currentStyle?.name ?? 'Select Style'}
              </span>
            </div>

            {/* Chevron indicator */}
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Main 3-Column Layout: Left Sidebar | Center Canvas | Right Sidebar */}
      {/* Mobile: Vertical stack | Desktop (≥1024px): 3-column flex row */}
      <div className="block lg:flex max-w-[1800px] mx-auto">
        <Suspense
          fallback={
            <StyleSidebarFallback
              entitlements={{
                tier: entitlements.tier,
                status: entitlements.status,
                remainingTokens: displayRemainingTokens,
                quota: entitlements.quota,
              }}
              hasCroppedImage={hasCroppedImage}
            />
          }
        >
          <StyleSidebar
            entitlements={{
              tier: entitlements.tier,
              status: entitlements.status,
              remainingTokens: displayRemainingTokens,
              quota: entitlements.quota,
            }}
            hasCroppedImage={hasCroppedImage}
          />
        </Suspense>
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
        {/* RIGHT SIDEBAR: Options + Order Summary (legacy) or Studio v2 rail */}
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
              'w-full lg:w-[420px] transition-opacity duration-200',
              !hasCroppedImage && 'pointer-events-none opacity-50'
            )}
            aria-disabled={!hasCroppedImage}
          >
            <div className="lg:sticky lg:top-[57px] px-4 py-6 lg:p-6">
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
                      <div className="lg:hidden w-full">
                        <div className="mb-4 text-center space-y-1">
                          <h3 className="text-xl font-bold text-white">
                            See It In Your Space
                          </h3>
                          <p className="text-xs text-white/60 max-w-md mx-auto px-4">
                            Visualize how your canvas will look in a real living room
                          </p>
                        </div>
                        <Suspense fallback={<CanvasPreviewFallback />}>
                          <CanvasInRoomPreview enableHoverEffect={true} showDimensions={false} />
                        </Suspense>
                      </div>
                    }
                  />
                </Suspense>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Living Canvas Modal */}
      <Suspense fallback={null}>
        {livingCanvasModalOpen && <LivingCanvasModal />}
      </Suspense>

      {/* Download Upgrade Modal */}
      <Suspense fallback={null}>
        <DownloadUpgradeModal
          isOpen={showDownloadUpgradeModal}
          onClose={() => setShowDownloadUpgradeModal(false)}
        />
      </Suspense>

      {/* Mobile Style Drawer */}
      <Suspense fallback={null}>
        <MobileStyleDrawer
          isOpen={mobileStyleDrawerOpen}
          onClose={() => setMobileStyleDrawerOpen(false)}
          hasCroppedImage={hasCroppedImage}
          remainingTokens={displayRemainingTokens}
          userTier={entitlements.tier}
        />
      </Suspense>

      {/* Canvas Upsell Toast - After Download Success */}
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

const StudioConfigurator = ({ checkoutNotice, onDismissCheckoutNotice }: StudioConfiguratorProps) => {
  const { showToast, showUpgradeModal, renderFeedback } = useStudioFeedback();

  const handleOrientationToast = useCallback(
    (orientationLabel: string) => {
      showToast({
        title: `${orientationLabel} crop ready`,
        description: 'Preview updated to match your new orientation.',
        variant: 'success',
        duration: 2800,
      });
    },
    [showToast]
  );

  return (
    <OrientationBridgeProvider onOrientationToast={handleOrientationToast}>
      <StudioConfiguratorInner
        checkoutNotice={checkoutNotice}
        onDismissCheckoutNotice={onDismissCheckoutNotice}
        showToast={showToast}
        showUpgradeModal={showUpgradeModal}
        renderFeedback={renderFeedback}
      />
    </OrientationBridgeProvider>
  );
};

export default StudioConfigurator;
