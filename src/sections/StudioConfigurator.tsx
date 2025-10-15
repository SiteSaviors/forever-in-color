import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useFounderStore, StylePreviewStatus } from '@/store/useFounderStore';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import { saveToGallery } from '@/utils/galleryApi';
import { downloadCleanImage } from '@/utils/premiumDownload';
import { trackDownloadSuccess } from '@/utils/telemetry';
import { trackLaunchflowEditReopen, trackLaunchflowEmptyStateInteraction, trackLaunchflowOpened } from '@/utils/launchflowTelemetry';

const TokenWarningBanner = lazy(() => import('@/components/studio/TokenWarningBanner'));
const StickyOrderRailLazy = lazy(() => import('@/components/studio/StickyOrderRail'));
const LivingCanvasModal = lazy(() => import('@/components/studio/LivingCanvasModal'));
const CanvasInRoomPreview = lazy(() => import('@/components/studio/CanvasInRoomPreview'));
const StyleForgeOverlay = lazy(() => import('@/components/studio/StyleForgeOverlay'));
const DownloadUpgradeModal = lazy(() => import('@/components/modals/DownloadUpgradeModal'));
const MobileStyleDrawer = lazy(() => import('@/components/studio/MobileStyleDrawer'));
const CanvasUpsellToast = lazy(() => import('@/components/studio/CanvasUpsellToast'));

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

const StyleForgeOverlayFallback = ({ styleName }: { styleName: string }) => (
  <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm" role="presentation">
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 border-4 border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
      <p className="text-sm font-medium text-white/80">Preparing {styleName}…</p>
    </div>
  </div>
);

type StudioEmptyStateProps = {
  onUpload: () => void;
  onBrowseStyles: () => void;
  launchflowOpen: boolean;
};

const StudioEmptyState = ({ onUpload, onBrowseStyles, launchflowOpen }: StudioEmptyStateProps) => (
  <div className="absolute inset-0 flex items-center justify-center p-6">
    <div className="relative w-full max-w-xl overflow-hidden rounded-[2.75rem] border-2 border-dashed border-white/15 bg-slate-950/70 px-8 py-12 text-center shadow-[0_32px_120px_rgba(35,48,94,0.55)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_60%)] opacity-75" />
      <div className="relative space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-glow-purple">
          <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M12 4v9" />
          </svg>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-white">Upload your photo to preview here</h3>
          <p className="text-sm text-white/70">
            Launchflow expands inline so you can crop smartly without losing sight of the configurator.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onUpload}
            disabled={launchflowOpen}
            className={clsx(
              'rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              launchflowOpen
                ? 'cursor-default bg-white/15 text-white/70'
                : 'bg-gradient-cta text-white shadow-glow-purple hover:shadow-glow-purple'
            )}
          >
            {launchflowOpen ? 'Launchflow open…' : 'Upload photo'}
          </button>
          <button
            type="button"
            onClick={onBrowseStyles}
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Browse styles first
          </button>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          No demo previews • Your photo leads the canvas
        </p>
      </div>
    </div>
  </div>
);

type CheckoutNotice = {
  variant: 'success' | 'warning';
  message: string;
};

type StudioConfiguratorProps = {
  checkoutNotice?: CheckoutNotice | null;
  onDismissCheckoutNotice?: () => void;
};

const StudioConfigurator = ({ checkoutNotice, onDismissCheckoutNotice }: StudioConfiguratorProps) => {
  const sessionUser = useFounderStore((state) => state.sessionUser);
  const sessionAccessToken = useFounderStore((state) => state.sessionAccessToken);
  const styles = useFounderStore((state) => state.styles);
  const selectedStyleId = useFounderStore((state) => state.selectedStyleId);
  const selectStyle = useFounderStore((state) => state.selectStyle);
  const previews = useFounderStore((state) => state.previews);
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const preview = currentStyle ? previews[currentStyle.id] : undefined;
  const entitlements = useFounderStore((state) => state.entitlements);
  const hydrateEntitlements = useFounderStore((state) => state.hydrateEntitlements);
  const firstPreviewCompleted = useFounderStore((state) => state.firstPreviewCompleted);
  const generationCount = useFounderStore((state) => state.generationCount);
  const canGenerateMore = useFounderStore((state) => state.canGenerateMore);
  const setPreviewState = useFounderStore((state) => state.setPreviewState);
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const orientation = useFounderStore((state) => state.orientation);
  const orientationChanging = useFounderStore((state) => state.orientationChanging);
  const pendingStyleId = useFounderStore((state) => state.pendingStyleId);
  const stylePreviewStatus = useFounderStore((state) => state.stylePreviewStatus);
  const stylePreviewMessage = useFounderStore((state) => state.stylePreviewMessage);
  const stylePreviewError = useFounderStore((state) => state.stylePreviewError);
  const startStylePreview = useFounderStore((state) => state.startStylePreview);
  const orientationPreviewPending = useFounderStore((state) => state.orientationPreviewPending);
  const anonToken = useFounderStore((state) => state.anonToken);
  const setAccountPromptShown = useFounderStore((state) => state.setAccountPromptShown);
  const livingCanvasModalOpen = useFounderStore((state) => state.livingCanvasModalOpen);
  const launchpadExpanded = useFounderStore((state) => state.launchpadExpanded);
  const setLaunchpadExpanded = useFounderStore((state) => state.setLaunchpadExpanded);
  const cachedPreviewEntry = useFounderStore((state) => {
    const styleId = state.selectedStyleId;
    if (!styleId) return null;
    return state.stylePreviewCache[styleId]?.[state.orientation] ?? null;
  });
  const orientationMeta = ORIENTATION_PRESETS[orientation];
  const previewOrientationLabel = preview?.orientation ? ORIENTATION_PRESETS[preview.orientation].label : null;
  const orientationMismatch = Boolean(preview?.orientation && preview.orientation !== orientation);
  const [savingToGallery, setSavingToGallery] = useState(false);
  const [savedToGallery, setSavedToGallery] = useState(false);
  const [showDownloadUpgradeModal, setShowDownloadUpgradeModal] = useState(false);
  const [downloadingHD, setDownloadingHD] = useState(false);
  const [mobileStyleDrawerOpen, setMobileStyleDrawerOpen] = useState(false);
  const [showCanvasUpsellToast, setShowCanvasUpsellToast] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

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
  const userTier = useFounderStore((state) => state.entitlements?.tier ?? 'anonymous');
  const isPremiumUser = ['creator', 'plus', 'pro'].includes(userTier);

  const handleDownloadHD = async () => {
    if (!currentStyle || !preview?.data?.previewUrl) {
      alert('No preview available to download');
      return;
    }

    // Check if user has premium access
    if (!isPremiumUser) {
      // Show upgrade modal for free/anonymous users
      setShowDownloadUpgradeModal(true);
      return;
    }

    // Premium users: download clean version
    setDownloadingHD(true);
    try {
      // Extract storage path from preview URL
      // URL format: https://.../storage/v1/object/public/preview-cache-public/{storagePath}
      const previewUrl = preview.data.previewUrl;
      const match = previewUrl.match(/preview-cache-(public|premium)\/(.+)$/);

      if (!match) {
        throw new Error('Could not extract storage path from preview URL');
      }

      const storagePath = match[2];
      const filename = `wondertone-${currentStyle.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;

      await downloadCleanImage({
        storagePath,
        filename,
        accessToken: sessionAccessToken,
      });

      console.log('[StudioConfigurator] Clean image downloaded successfully');

      // Track successful download
      trackDownloadSuccess(userTier, currentStyle.id);

      // Show canvas upsell toast after successful download
      setShowCanvasUpsellToast(true);
      setTimeout(() => setShowCanvasUpsellToast(false), 8000); // Auto-dismiss after 8s
    } catch (error) {
      console.error('Failed to download HD image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloadingHD(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!currentStyle || !preview?.data?.previewUrl) {
      alert('No preview available to save');
      return;
    }

    if (!sessionUser) {
      setAccountPromptShown(true);
      return;
    }

    setSavingToGallery(true);

    // Only provide cleanUrl if user has premium access (preview not watermarked)
    // Server will validate this matches their tier
    const result = await saveToGallery({
      styleId: currentStyle.id,
      styleName: currentStyle.name,
      orientation,
      watermarkedUrl: preview.data.previewUrl,
      cleanUrl: preview.data.requiresWatermark ? undefined : preview.data.previewUrl,
      anonToken: sessionUser ? undefined : anonToken,
      accessToken: sessionAccessToken || null,
    });

    setSavingToGallery(false);

    if (result.success) {
      setSavedToGallery(true);
      setTimeout(() => setSavedToGallery(false), 3000);
      if (result.alreadyExists) {
        alert('This preview is already in your gallery');
      }
    } else {
      alert(`Failed to save: ${result.error}`);
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

  const handleEditFromWelcome = () => {
    trackLaunchflowOpened('welcome_banner');
    trackLaunchflowEditReopen('welcome_banner');
    setLaunchpadExpanded(true);
    setWelcomeDismissed(true);
  };

  const handleDismissWelcome = () => {
    setWelcomeDismissed(true);
  };

  const handleStyleClick = (styleId: string) => {
    selectStyle(styleId);
    const style = styles.find((item) => item.id === styleId);
    if (!style) return;

    if (style.id === 'original-image' && croppedImage) {
      setPreviewState('original-image', {
        status: 'ready',
        data: {
          previewUrl: croppedImage,
          watermarkApplied: false,
          startedAt: Date.now(),
          completedAt: Date.now(),
        },
        orientation,
      });
      return;
    }

    if (!canGenerateMore()) {
      return;
    }

    void startStylePreview(style);
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

  const remainingLabel = entitlements.status === 'ready'
    ? entitlements.remainingTokens == null
      ? '∞'
      : Math.max(0, entitlements.remainingTokens)
    : '—';
  const quotaLabel = entitlements.quota == null ? '∞' : entitlements.quota;
  type OverlayStatus = Exclude<StylePreviewStatus, 'idle'>;
  const overlayStatus: OverlayStatus = stylePreviewStatus === 'idle' ? 'animating' : stylePreviewStatus;
  const canRefreshPreview =
    Boolean(currentStyle) &&
    currentStyle?.id !== 'original-image' &&
    !pendingStyleId &&
    stylePreviewStatus === 'idle' &&
    canGenerateMore() &&
    Boolean(cachedPreviewEntry || preview?.status === 'ready');

  return (
    <section
      className="bg-slate-900 min-h-screen relative"
      data-studio-section
      data-founder-anchor="studio"
      id="studio"
    >
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-indigo" />
              <span className="text-sm text-brand-indigo uppercase tracking-[0.3em]">Studio</span>
            </div>
          </div>
          <div className="text-white/70 text-sm">
            {currentStyle?.name || 'Select a style'}
          </div>
        </div>
      </div>

      {showReturningBanner && (
        <div className="max-w-[1800px] mx-auto px-6 pt-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-4 text-white shadow-[0_15px_45px_rgba(16,185,129,0.25)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-emerald-100">Welcome back! Your photo is ready to style.</p>
              <p className="text-xs text-emerald-200/80">
                Edit the crop or jump straight into exploring new canvases.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEditFromWelcome}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition hover:scale-105"
              >
                Edit photo
              </button>
              <button
                type="button"
                onClick={handleDismissWelcome}
                className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-200/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss returning user message"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Warning Banner */}
      <Suspense fallback={null}>
        <TokenWarningBanner />
      </Suspense>

      {checkoutNotice?.message && (
        <div className="max-w-[1800px] mx-auto px-6 pt-4">
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
              checkoutNotice.variant === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-100'
            }`}
          >
            <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              {checkoutNotice.variant === 'success' ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.597c.75 1.335-.214 3.004-1.742 3.004H3.48c-1.528 0-2.492-1.669-1.742-3.004L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-.25-4.75a.75.75 0 10-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            <div className="flex-1 text-sm leading-6">
              {checkoutNotice.message}
            </div>
            {onDismissCheckoutNotice && (
              <button
                type="button"
                onClick={onDismissCheckoutNotice}
                className="text-white/60 transition hover:text-white"
                aria-label="Dismiss checkout message"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

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
        {/* LEFT SIDEBAR: Style Selection (Desktop Only - Hidden on Mobile) */}
        <aside
          className={clsx(
            'hidden lg:block lg:w-80 bg-slate-950/50 border-r border-white/10 lg:h-screen lg:sticky lg:top-[57px] overflow-y-auto transition-opacity duration-200',
            !hasCroppedImage && 'pointer-events-none opacity-40 saturate-50'
          )}
          aria-disabled={!hasCroppedImage}
        >
          <div className="p-6 space-y-6">
            {!hasCroppedImage && (
              <div className="rounded-xl border border-white/12 bg-white/5 p-4 text-sm text-white/70">
                Upload your photo above to unlock style previews.
              </div>
            )}
            {/* Header */}
            <div>
              <h3 className="text-xl font-bold text-white">All Styles</h3>
              <p className="text-xs text-white/60 mt-1">Click to preview</p>
            </div>

            {/* Generation counter */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/70 mb-1">Generations Remaining</p>
              <p className="text-2xl font-bold text-white">{remainingLabel} left</p>
              <p className="text-xs text-white/60 mt-2">Tier: {entitlements.tier.toUpperCase()} · Quota {quotaLabel}</p>
              <Link
                to="/studio/usage"
                className="mt-3 block text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
              >
                View Usage History →
              </Link>
            </div>

            {/* Style list */}
            <div className="space-y-3">
              {styles.map((style) => {
                const isSelected = style.id === selectedStyleId;
                const stylePreview = previews[style.id];
                const isReady = stylePreview?.status === 'ready';

                const isLocked =
                  Boolean(pendingStyleId && pendingStyleId !== style.id) ||
                  (stylePreviewStatus === 'error' && pendingStyleId !== style.id) ||
                  !canGenerateMore();
                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleClick(style.id)}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
                        : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={style.thumbnail} alt={style.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-500/40">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white">{style.name}</p>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">{style.description}</p>
                      {isReady && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-green-400 font-semibold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Cached
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Upgrade CTA */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/30">
              <p className="text-sm font-semibold text-white mb-2">Want unlimited generations?</p>
              <p className="text-xs text-white/70 mb-3">Upgrade to Creator for unlimited style switching</p>
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-cta text-white text-sm font-bold shadow-glow-purple hover:shadow-glow-purple transition">
                Upgrade - $9.99/mo
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER: Canvas Preview (Full-width on mobile, flexible on desktop) */}
        <main className="w-full lg:flex-1 px-4 py-6 lg:p-8 flex flex-col items-center justify-start">
          <div className="w-full max-w-2xl mx-auto">
            {/* Canvas Preview */}
            <div
              className="relative rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-preview-bg shadow-2xl transition-all mx-auto"
              style={{
                aspectRatio: orientationMeta.ratio,
                maxHeight: orientation === 'vertical' ? '85vh' : undefined
              }}
            >
              {hasCroppedImage ? (
                <>
                  {stylePreviewStatus !== 'idle' && (
                    <Suspense fallback={<StyleForgeOverlayFallback styleName={overlayStyleName} />}>
                      <StyleForgeOverlay
                        status={overlayStatus}
                        styleName={overlayStyleName}
                        message={stylePreviewMessage}
                        isError={stylePreviewStatus === 'error'}
                        errorMessage={stylePreviewError}
                      />
                    </Suspense>
                  )}
                  {orientationChanging && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                        <p className="text-white text-sm font-medium">Updating orientation...</p>
                      </div>
                    </div>
                  )}
                  {preview?.status === 'loading' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                      <div className="absolute inset-0 preview-skeleton" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                        <p className="text-white mt-4 text-sm">Creating your masterpiece...</p>
                      </div>
                    </div>
                  )}
                  {preview?.status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-red-500/10 border-2 border-red-400/30">
                      <svg className="w-12 h-12 text-red-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-base font-semibold text-red-300">Preview generation failed</p>
                      <p className="text-sm text-white/60 mt-1">Try selecting a different style</p>
                    </div>
                  )}
                  {displayPreviewUrl ? (
                    <img
                      src={displayPreviewUrl}
                      alt="Canvas preview"
                      className="w-full h-full object-cover select-none"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/40 text-center p-8">
                      <div>
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm">Select a style from the left to see your transformed image</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 lg:top-6 lg:left-6 px-2 py-1 lg:px-4 lg:py-2 rounded-full bg-white/10 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.2em] lg:tracking-[0.3em] text-white/80 backdrop-blur">
                    {orientationMeta.label}
                  </div>
                  {preview?.status === 'ready' && currentStyle && currentStyle.id !== 'original-image' && !orientationPreviewPending && !orientationMismatch && (
                    <div className="absolute top-3 right-3 lg:top-6 lg:right-6 px-2 py-1 lg:px-4 lg:py-2 rounded-full bg-purple-500/95 text-white text-xs lg:text-sm font-semibold shadow-glow-soft backdrop-blur-sm animate-scaleIn">
                      <span className="flex items-center gap-1 lg:gap-2">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="hidden sm:inline">Ready to print</span>
                        <span className="sm:hidden">Ready</span>
                      </span>
                    </div>
                  )}
                  {orientationPreviewPending && (
                    <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur animate-pulse">
                      Adapting to {orientationMeta.label}
                    </div>
                  )}
                  {!orientationPreviewPending && orientationMismatch && previewOrientationLabel && (
                    <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-amber-500/90 text-slate-900 text-xs font-semibold shadow-glow-soft backdrop-blur-sm">
                      {`Preview uses ${previewOrientationLabel} crop • Refresh to update`}
                    </div>
                  )}
                  {!previewHasData && croppedImage && (
                    <div className="pointer-events-none absolute bottom-6 left-1/2 w-[90%] max-w-sm -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/70 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                      Choose a style to transform your photo
                    </div>
                  )}
                </>
              ) : (
                <StudioEmptyState
                  onUpload={handleOpenLaunchflowFromEmptyState}
                  onBrowseStyles={handleBrowseStylesFromEmptyState}
                  launchflowOpen={launchpadExpanded}
                />
              )}
            </div>

            {/* Action Buttons */}
            {preview?.status === 'ready' && currentStyle && (
              <div className="mt-6 flex flex-col items-center gap-4">
                {/* Save to Gallery Button */}
                <button
                  onClick={handleSaveToGallery}
                  disabled={savingToGallery}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    savedToGallery
                      ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50'
                      : 'bg-white/10 hover:bg-white/15 text-white border-2 border-white/20 hover:border-white/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {savedToGallery ? (
                    <>
                      <BookmarkCheck className="w-5 h-5" />
                      <span>Saved to Gallery</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-5 h-5" />
                      <span>{savingToGallery ? 'Saving...' : 'Save to Gallery'}</span>
                    </>
                  )}
                </button>

                {/* Refresh Preview & View Gallery Links */}
                <div className="flex items-center gap-4">
                  {canRefreshPreview && (
                    <button
                      type="button"
                      onClick={() => void startStylePreview(currentStyle, { force: true })}
                      className="text-sm text-white/60 hover:text-white transition-colors underline"
                    >
                      Refresh Preview
                    </button>
                  )}
                  <Link
                    to="/studio/gallery"
                    className="text-sm text-white/60 hover:text-white transition-colors underline"
                  >
                    View Gallery
                  </Link>
                </div>
              </div>
            )}

            {/* Canvas In Room Preview - Desktop Only (below canvas) */}
            <div className="hidden lg:block w-full max-w-2xl mt-12">
              <div className="mb-6 text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  See It In Your Space
                </h3>
                <p className="text-sm text-white/60 max-w-md mx-auto">
                  Visualize how your canvas will look in a real living room
                </p>
              </div>
              <Suspense fallback={<CanvasPreviewFallback />}>
                <CanvasInRoomPreview enableHoverEffect={true} showDimensions={false} />
              </Suspense>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Options + Order Summary (Full-width on mobile, fixed on desktop) */}
        <aside
          className={clsx(
            'w-full lg:w-[420px] transition-opacity duration-200',
            !hasCroppedImage && 'pointer-events-none opacity-50'
          )}
          aria-disabled={!hasCroppedImage}
        >
          <div className="lg:sticky lg:top-[57px] px-4 py-6 lg:p-6">
            {!hasCroppedImage && (
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Upload a photo to customize canvas options and checkout.
              </div>
            )}
            <Suspense fallback={<StickyOrderRailFallback />}>
              <StickyOrderRailLazy
                onDownloadClick={handleDownloadHD}
                downloadingHD={downloadingHD}
                isPremiumUser={isPremiumUser}
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
        </aside>
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
          styles={styles}
          selectedStyleId={selectedStyleId}
          onStyleSelect={handleStyleClick}
          previews={previews}
          canGenerateMore={canGenerateMore()}
          pendingStyleId={pendingStyleId}
          remainingTokens={entitlements.remainingTokens}
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
            // Scroll to right rail (canvas config will be expanded by default in Phase 2 future enhancement)
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </Suspense>
    </section>
  );
};

export default StudioConfigurator;
