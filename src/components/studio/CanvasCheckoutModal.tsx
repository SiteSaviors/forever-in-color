import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { Frame, Maximize2, Compass, Sparkles, Edit3, Package, Flag, Shield } from 'lucide-react';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { CANVAS_SIZE_OPTIONS, getCanvasSizeOption } from '@/utils/canvasSizes';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import { type CanvasModalCloseReason, type FrameColor } from '@/store/founder/storeTypes';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useCanvasConfigActions, useCanvasConfigState } from '@/store/hooks/useCanvasConfigStore';
import { useStyleCatalogState } from '@/store/hooks/useStyleCatalogStore';
import { useUploadState } from '@/store/hooks/useUploadStore';
import { useEntitlementsState } from '@/store/hooks/useEntitlementsStore';
import {
  trackOrderStarted,
  trackOrderCompleted,
  trackCheckoutStepView,
  trackCheckoutExit,
  trackCheckoutRecommendationShown,
  trackCheckoutRecommendationSelected,
} from '@/utils/telemetry';
import {
  SHOW_SIZE_RECOMMENDATIONS,
  USE_NEW_CTA_COPY,
  SHOW_STATIC_TESTIMONIALS,
} from '@/config/featureFlags';
import CanvasCheckoutStepIndicator from '@/components/studio/CanvasCheckoutStepIndicator';
import CanvasSizeCard from '@/components/studio/CanvasSizeCard';
import StaticTestimonial from '@/components/studio/StaticTestimonial';
import CanvasTestimonialGrid from '@/components/studio/CanvasTestimonialGrid';
import TrustSignal from '@/components/checkout/TrustSignals';
import ContactForm from '@/components/checkout/ContactForm';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentStep from '@/components/checkout/PaymentStep';
import { getCanvasRecommendation } from '@/utils/canvasRecommendations';
import { CANVAS_PREVIEW_ASSETS } from '@/utils/canvasPreviewAssets';
import { shallow } from 'zustand/shallow';

const CanvasInRoomPreview = lazy(() => import('@/components/studio/CanvasInRoomPreview'));

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

type FrameOption = {
  id: FrameColor;
  label: string;
  subtitle: string;
  thumbnail: string;
};

const FRAME_OPTIONS: FrameOption[] = [
  {
    id: 'none',
    label: 'Gallery Wrap',
    subtitle: 'Gallery-wrap canvas',
    thumbnail: '/frame-swatches/no-frame.webp',
  },
  {
    id: 'black',
    label: 'Black Floating',
    subtitle: 'Modern shadow gap',
    thumbnail: '/frame-swatches/black-frame-thumbnail.webp',
  },
  {
    id: 'white',
    label: 'White Floating',
    subtitle: 'Bright airy trim',
    thumbnail: '/frame-swatches/white-frame-thumbnail.webp',
  },
];

// Testimonial data with canvas images (user will provide actual assets)
const CANVAS_TESTIMONIALS = [
  {
    id: 'tm1',
    canvasImageUrl: '/testimonials/canvas-1.jpg', // Placeholder - user will provide
    quote: 'This canvas completely transformed our living room. The quality is absolutely stunning.',
    author: 'Sarah M.',
    location: 'Austin, TX',
    verified: true,
  },
  {
    id: 'tm2',
    canvasImageUrl: '/testimonials/canvas-2.jpg', // Placeholder - user will provide
    quote: 'Museum-quality print. Everyone asks where we got it.',
    author: 'James K.',
    location: 'Seattle, WA',
    verified: true,
  },
  {
    id: 'tm3',
    canvasImageUrl: '/testimonials/canvas-3.jpg', // Placeholder - user will provide
    quote: 'The colors are even richer in person. Totally worth it.',
    author: 'Jordan T.',
    location: 'Brooklyn, NY',
    verified: true,
  },
  {
    id: 'tm4',
    canvasImageUrl: '/testimonials/canvas-4.jpg', // Placeholder - user will provide
    quote: 'Best investment for our home. The frame is gorgeous.',
    author: 'Avery M.',
    verified: true,
  },
];

const CanvasCheckoutModal = () => {
  const closingReasonRef = useRef<CanvasModalCloseReason | null>(null);
  const { canvasModalOpen, selectedCanvasSize, selectedFrame, enhancements, orientationPreviewPending } =
    useCanvasConfigState();
  const { closeCanvasModal, setCanvasSize, setFrame, toggleEnhancement, computedTotal } = useCanvasConfigActions();
  const { orientation, smartCrops } = useUploadState();
  const { currentStyle } = useStyleCatalogState();
  const { userTier } = useEntitlementsState();

  const { step, setStep, enterModalCheckout, leaveModalCheckout, shipping } = useCheckoutStore(
    (state) => ({
      step: state.step,
      setStep: state.setStep,
      enterModalCheckout: state.enterModalCheckout,
      leaveModalCheckout: state.leaveModalCheckout,
      shipping: state.shipping,
    }),
    shallow
  );

  const floatingFrame = useMemo(
    () => enhancements.find((item) => item.id === 'floating-frame'),
    [enhancements]
  );

  // Canvas size recommendation based on image resolution + orientation
  const recommendation = useMemo(() => {
    const currentCrop = smartCrops[orientation];
    return getCanvasRecommendation(
      orientation,
      currentCrop?.imageDimensions?.width,
      currentCrop?.imageDimensions?.height
    );
  }, [orientation, smartCrops]);

  const sizeOptions = CANVAS_SIZE_OPTIONS[orientation];
  const total = computedTotal();
  const selectedSizeOption = selectedCanvasSize ? getCanvasSizeOption(selectedCanvasSize) : null;
  const checkoutPreviewAsset = selectedCanvasSize ? CANVAS_PREVIEW_ASSETS[selectedCanvasSize] : null;
  const frameKey = selectedFrame ?? 'none';
  const previewRoomSrc = checkoutPreviewAsset?.roomSrc[frameKey] ?? checkoutPreviewAsset?.roomSrc.none;
  const previewArtRect = checkoutPreviewAsset?.artRectPct[frameKey] ?? checkoutPreviewAsset?.artRectPct.none;
  const orientationLabel = ORIENTATION_PRESETS[orientation].label;
  const hasEnabledEnhancements = enhancements.some((item) => item.enabled);
  const shippingCountry = shipping?.country ?? null;
  const isCanvasStep = step === 'canvas';
  const isContactStep = step === 'contact';
  const isShippingStep = step === 'shipping';
  const isPaymentStep = step === 'payment';
  const isSuccessStep = step === 'success';
  const canvasAdvanceDisabled = !selectedCanvasSize || orientationPreviewPending;
  const handleContactNext = useCallback(() => setStep('shipping'), [setStep]);
  const handleShippingBack = useCallback(() => setStep('contact'), [setStep]);
  const handleShippingNext = useCallback(() => setStep('payment'), [setStep]);
  const handlePaymentBack = useCallback(() => setStep('shipping'), [setStep]);
  const handlePaymentSuccess = useCallback(() => setStep('success'), [setStep]);
  const modalReturnUrl = typeof window !== 'undefined' ? `${window.location.origin}/studio?checkout=success&surface=canvas-modal` : undefined;

  const successTimeline = [
    {
      icon: '📧',
      title: 'Confirmation sent',
      body: "We've emailed your receipt and concierge contact.",
    },
    {
      icon: '🎨',
      title: 'Canvas in production',
      body: 'Our artisans are stretching your premium print by hand.',
    },
    {
      icon: '🚚',
      title: 'Shipping in 5-7 days',
      body: 'Tracking information arrives the moment it leaves our atelier.',
    },
  ];

  const handleFrameSelect = useCallback(
    (frame: FrameColor) => {
      if (frame === 'none') {
        if (floatingFrame?.enabled) {
          toggleEnhancement('floating-frame');
        }
        if (selectedFrame !== 'none') {
          setFrame('none');
        }
        return;
      }

      if (!floatingFrame?.enabled) {
        toggleEnhancement('floating-frame');
      }

      if (selectedFrame !== frame) {
        setFrame(frame);
      }
    },
    [floatingFrame, selectedFrame, toggleEnhancement, setFrame]
  );

  const [exitPromptReason, setExitPromptReason] = useState<CanvasModalCloseReason | null>(null);
  const [mobilePreviewExpanded, setMobilePreviewExpanded] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [triggerFrameShimmer, setTriggerFrameShimmer] = useState(false);
  const [hasAutoExpandedOnce, setHasAutoExpandedOnce] = useState(false);
  const [timerSeed, setTimerSeed] = useState<number | null>(null);
  const recommendationLoggedRef = useRef<Set<string>>(new Set());
  const drawerPulseTimeoutRef = useRef<number | null>(null);
  const drawerPulseCleanupTimeoutRef = useRef<number | null>(null);

  const commitClose = useCallback(
    (reason: CanvasModalCloseReason) => {
      closingReasonRef.current = reason;
      closeCanvasModal(reason);
    },
    [closeCanvasModal]
  );

  const shouldConfirmExit = step !== 'canvas' && step !== 'success';

  const requestClose = useCallback(
    (reason: CanvasModalCloseReason) => {
      if (shouldConfirmExit) {
        setExitPromptReason(reason);
        return;
      }
      setExitPromptReason(null);
      commitClose(reason);
    },
    [commitClose, shouldConfirmExit]
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const pending = closingReasonRef.current;
      closingReasonRef.current = null;
      if (!pending) {
        requestClose('dismiss');
      }
    }
  };

  const modalSessionActiveRef = useRef(false);
  const telemetryFiredRef = useRef(false);
  const confettiTriggeredRef = useRef(false);
  const orderCompletionTrackedRef = useRef(false);
  const mobilePreviewDragStartRef = useRef<number | null>(null);
  const mobilePreviewDragHandledRef = useRef(false);
  const previewHeaderRef = useRef<HTMLDivElement>(null);

  // Show sticky guarantee when scrolled past preview header
  const showStickyGuarantee = useScrollVisibility(previewHeaderRef, 0.65);

  useEffect(() => {
    if (canvasModalOpen) {
      if (!modalSessionActiveRef.current) {
        enterModalCheckout();
        telemetryFiredRef.current = false;
        modalSessionActiveRef.current = true;
      }
      return;
    }

    if (modalSessionActiveRef.current) {
      leaveModalCheckout();
      telemetryFiredRef.current = false;
      modalSessionActiveRef.current = false;
    }
  }, [canvasModalOpen, enterModalCheckout, leaveModalCheckout]);

  useEffect(() => {
    if (canvasModalOpen) {
      setTimerSeed(Date.now());
      recommendationLoggedRef.current = new Set();
      return;
    }
    setMobilePreviewExpanded(false);
    setTimerSeed(null);
    if (drawerPulseTimeoutRef.current) {
      window.clearTimeout(drawerPulseTimeoutRef.current);
      drawerPulseTimeoutRef.current = null;
    }
    if (drawerPulseCleanupTimeoutRef.current) {
      window.clearTimeout(drawerPulseCleanupTimeoutRef.current);
      drawerPulseCleanupTimeoutRef.current = null;
    }
  }, [canvasModalOpen]);

  useEffect(() => {
    if (!canvasModalOpen) return undefined;
    if (!shouldConfirmExit) return undefined;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [canvasModalOpen, shouldConfirmExit]);

  useEffect(() => {
    if (step === 'success') {
      if (!confettiTriggeredRef.current) {
        confettiTriggeredRef.current = true;
        void import('canvas-confetti')
          .then(({ default: confetti }) => {
            const base = {
              spread: 70,
              ticks: 120,
              colors: ['#8b5cf6', '#a855f7', '#60a5fa', '#22d3ee', '#f472b6', '#fbbf24'],
            };
            confetti({
              particleCount: 120,
              origin: { y: 0.3 },
              ...base,
            });
            confetti({
              particleCount: 80,
              angle: 60,
              origin: { x: 1, y: 0.3 },
              ...base,
            });
            confetti({
              particleCount: 80,
              angle: 120,
              origin: { x: 0, y: 0.3 },
              ...base,
            });
          })
          .catch((error) => {
            console.warn('[canvas-checkout] failed to load confetti', error);
          });
      }
      if (!orderCompletionTrackedRef.current) {
        trackOrderCompleted(userTier, total, hasEnabledEnhancements, shippingCountry);
        orderCompletionTrackedRef.current = true;
      }
    } else {
      confettiTriggeredRef.current = false;
      orderCompletionTrackedRef.current = false;
    }
  }, [step, userTier, total, hasEnabledEnhancements, shippingCountry]);

  useEffect(() => {
    if (step !== 'success' && shareFeedback) {
      setShareFeedback(null);
    }
  }, [step, shareFeedback]);

  useEffect(() => {
    trackCheckoutStepView(step, userTier);
  }, [step, userTier]);

  // Track recommendation impressions when canvas step loads
  useEffect(() => {
    if (!(canvasModalOpen && step === 'canvas')) {
      return;
    }

    sizeOptions.forEach((option) => {
      const key = `${orientation}:${option.id}`;
      if (recommendationLoggedRef.current.has(key)) {
        return;
      }
      const isRecommended = option.id === recommendation.recommendedSize;
      const isMostPopular = option.id === recommendation.mostPopularSize;
      trackCheckoutRecommendationShown(option.id, orientation, isRecommended, isMostPopular);
      recommendationLoggedRef.current.add(key);
    });
  }, [canvasModalOpen, step, sizeOptions, recommendation, orientation]);

  const handlePrimaryCta = () => {
    if (step !== 'canvas') {
      return;
    }
    if (!telemetryFiredRef.current) {
      trackOrderStarted(userTier, total, hasEnabledEnhancements);
      telemetryFiredRef.current = true;
    }

    // Scroll to top of modal on step transition
    const modalContent = document.querySelector('[data-modal-content]');
    if (modalContent) {
      modalContent.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

    setStep('contact');
  };

  const enhancementsSummary = enhancements
    .filter((item) => item.enabled)
    .map((item) => item.name);

  const clearDrawerPulseTimeouts = useCallback(() => {
    if (drawerPulseTimeoutRef.current) {
      window.clearTimeout(drawerPulseTimeoutRef.current);
      drawerPulseTimeoutRef.current = null;
    }
    if (drawerPulseCleanupTimeoutRef.current) {
      window.clearTimeout(drawerPulseCleanupTimeoutRef.current);
      drawerPulseCleanupTimeoutRef.current = null;
    }
  }, []);

  const handleMobilePreviewDragMove = useCallback(
    (event: PointerEvent) => {
      const startY = mobilePreviewDragStartRef.current;
      if (startY == null) return;
      const delta = event.clientY - startY;
      if (Math.abs(delta) < 40) return;
      const shouldExpand = delta < 0;
      setMobilePreviewExpanded(shouldExpand);
      mobilePreviewDragHandledRef.current = true;
      mobilePreviewDragStartRef.current = null;
      window.removeEventListener('pointermove', handleMobilePreviewDragMove);
    },
    [setMobilePreviewExpanded]
  );

  const endMobilePreviewDrag = useCallback(() => {
    const handled = mobilePreviewDragHandledRef.current;
    mobilePreviewDragStartRef.current = null;
    window.removeEventListener('pointermove', handleMobilePreviewDragMove);
    window.removeEventListener('pointerup', endMobilePreviewDrag);
    if (handled) {
      window.setTimeout(() => {
        mobilePreviewDragHandledRef.current = false;
      }, 0);
    }
  }, [handleMobilePreviewDragMove]);

  const beginMobilePreviewDrag = useCallback(
    (clientY: number) => {
      mobilePreviewDragStartRef.current = clientY;
      window.addEventListener('pointermove', handleMobilePreviewDragMove);
      window.addEventListener('pointerup', endMobilePreviewDrag, { once: true });
    },
    [handleMobilePreviewDragMove, endMobilePreviewDrag]
  );

  const handleShareSuccess = async () => {
    const shareText = `I just ordered a Wondertone canvas${
      currentStyle?.name ? ` in ${currentStyle.name}` : ''
    }! Can't wait to hang it.`;
    const shareUrl = `${window.location.origin}/studio`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wondertone Canvas',
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback('Shared via native sheet ✨');
        setTimeout(() => setShareFeedback(null), 3000);
        return;
      } catch (error) {
        console.warn('[canvas-checkout] share dismissed', error);
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setShareFeedback('Link copied to clipboard');
        setTimeout(() => setShareFeedback(null), 3000);
        return;
      } catch (error) {
        console.warn('[canvas-checkout] clipboard copy failed', error);
      }
    }

    setShareFeedback('Sharing is not supported on this device');
    setTimeout(() => setShareFeedback(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (modalSessionActiveRef.current) {
        leaveModalCheckout();
        modalSessionActiveRef.current = false;
        telemetryFiredRef.current = false;
      }
      endMobilePreviewDrag();
      clearDrawerPulseTimeouts();
    };
  }, [leaveModalCheckout, endMobilePreviewDrag, clearDrawerPulseTimeouts]);

  const renderOrderSummaryCard = () => (
    <section className="space-y-4 rounded-3xl border border-white/12 bg-white/5 p-5 transition hover:border-white/30 hover:bg-white/10 focus-within:border-purple-300/60">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Order Summary</p>
        <div className="space-y-1 text-sm text-white/75">
          <p>{selectedSizeOption ? `${selectedSizeOption.label} Canvas` : 'Canvas size pending'}</p>
          <p>Frame: {selectedFrame === 'none' ? 'No frame' : `${selectedFrame} floating frame`}</p>
          <p>Orientation: {orientationLabel}</p>
          <p>Enhancements: {enhancementsSummary.length ? enhancementsSummary.join(', ') : 'None'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-sm font-semibold text-white/70">Total</span>
        <span className="text-xl font-bold text-white">{currency.format(total)}</span>
      </div>
      <div className="h-12 rounded-2xl border border-dashed border-white/15 bg-transparent" />
    </section>
  );

  const renderTrustSignals = () => (
    <section className="rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10">
      <div className="grid gap-3 text-center sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 px-3 py-3">
          <p className="text-lg">⭐ 4.9</p>
          <p className="text-xs text-white/60">1,200+ collectors</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-3">
          <p className="text-lg">🚚 5-day turn</p>
          <p className="text-xs text-white/60">Handled & insured shipping</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-3">
          <p className="text-lg">🛡️ Guaranteed</p>
          <p className="text-xs text-white/60">Love it or we’ll remake it</p>
        </div>
      </div>
    </section>
  );

  const renderTestimonialCard = () => (
    <section className="rounded-3xl border border-dashed border-white/12 bg-white/5 p-6 text-sm text-white/60 transition hover:border-white/40 hover:bg-white/10">
      "The print arrived museum-ready. Zero nails, instant conversation starter." — Avery M.
    </section>
  );

  const renderPremiumTrustBar = () => {
    return (
      <div className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/8 via-white/4 to-white/6 p-5 shadow-[0_0_24px_rgba(168,85,247,0.12)] transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_32px_rgba(168,85,247,0.18)]">
        {/* Premium gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-emerald-500/8" />

        {/* Subtle glow on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/12 via-transparent to-emerald-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-3 sm:divide-x sm:divide-white/15">
          {/* Free Shipping */}
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/15 shadow-[0_0_16px_rgba(168,85,247,0.2)] transition-transform duration-300 group-hover:scale-105">
              <Package className="h-6 w-6 text-purple-300" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="font-display text-base font-semibold text-white">Free Shipping</p>
              <p className="text-xs text-white/55">On all orders</p>
            </div>
          </div>

          {/* Made in USA */}
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/15 shadow-[0_0_16px_rgba(59,130,246,0.2)] transition-transform duration-300 group-hover:scale-105">
              <Flag className="h-6 w-6 text-blue-300" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="font-display text-base font-semibold text-white">Made in USA</p>
              <p className="text-xs text-white/55">Handcrafted quality</p>
            </div>
          </div>

          {/* Money-Back Guarantee */}
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/15 shadow-[0_0_16px_rgba(52,211,153,0.2)] transition-transform duration-300 group-hover:scale-105">
              <Shield className="h-6 w-6 text-emerald-300" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="font-display text-base font-semibold text-white">Money-Back Guarantee</p>
              <p className="text-xs text-white/55">100-day protection</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEnhancedOrderSummary = () => {
    const handleScrollToFrame = () => {
      const frameSection = document.querySelector('[data-section="frame-selection"]');
      const modalContent = document.querySelector('[data-modal-content]');
      if (frameSection && modalContent) {
        const offset = (frameSection as HTMLElement).offsetTop - 20;
        modalContent.scrollTo({ top: offset, behavior: 'smooth' });
      }
    };

    const handleScrollToSize = () => {
      const sizeSection = document.querySelector('[data-section="size-selection"]');
      const modalContent = document.querySelector('[data-modal-content]');
      if (sizeSection && modalContent) {
        const offset = (sizeSection as HTMLElement).offsetTop - 20;
        modalContent.scrollTo({ top: offset, behavior: 'smooth' });
      }
    };

    const frameLabel = selectedFrame === 'none'
      ? 'Gallery wrap'
      : `${selectedFrame.charAt(0).toUpperCase() + selectedFrame.slice(1)} floating frame`;

    return (
      <section className="space-y-4 rounded-3xl border border-white/12 bg-gradient-to-br from-white/5 via-white/3 to-transparent p-6 transition hover:border-white/20">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Order Summary</p>

          <div className="space-y-3 text-sm">
            {/* Canvas Size */}
            <div className="flex items-center justify-between text-white/75">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-purple-300/60" />
                <span>{selectedSizeOption ? `${selectedSizeOption.label} Canvas` : 'Size pending'}</span>
              </div>
              <button
                type="button"
                onClick={handleScrollToSize}
                disabled={orientationPreviewPending}
                className={clsx(
                  'flex items-center gap-1 text-xs font-semibold transition',
                  orientationPreviewPending
                    ? 'cursor-not-allowed text-purple-300/40'
                    : 'text-purple-300 hover:text-purple-200'
                )}
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
            </div>

            {/* Frame */}
            <div className="flex items-center justify-between text-white/75">
              <div className="flex items-center gap-2">
                <Frame className="h-4 w-4 text-purple-300/60" />
                <span>{frameLabel}</span>
              </div>
              <button
                type="button"
                onClick={handleScrollToFrame}
                disabled={orientationPreviewPending}
                className={clsx(
                  'flex items-center gap-1 text-xs font-semibold transition',
                  orientationPreviewPending
                    ? 'cursor-not-allowed text-purple-300/40'
                    : 'text-purple-300 hover:text-purple-200'
                )}
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
            </div>

            {/* Orientation */}
            <div className="flex items-center gap-2 text-white/75">
              <Compass className="h-4 w-4 text-purple-300/60" />
              <span>Orientation: {orientationLabel}</span>
            </div>

            {/* Enhancements */}
            {enhancementsSummary.length > 0 && (
              <div className="flex items-center gap-2 text-white/75">
                <Sparkles className="h-4 w-4 text-purple-300/60" />
                <span>Enhancements: {enhancementsSummary.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Price with Animation */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-sm font-semibold text-white/70">Total</span>
          <span
            key={total}
            className="font-display text-2xl font-bold text-white motion-safe:animate-[pulse_400ms_ease-in-out]"
          >
            {currency.format(total)}
          </span>
        </div>
      </section>
    );
  };

  return (
    <Dialog.Root open={canvasModalOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md"
          onPointerDown={(event) => {
            event.preventDefault();
            requestClose('backdrop');
          }}
        />
        <Dialog.Content
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            requestClose('esc_key');
          }}
          onPointerDownOutside={(event) => {
            event.preventDefault();
            requestClose('backdrop');
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10"
        >
          <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_rgba(5,10,25,0.7)]">
            <div className="flex flex-col gap-10 lg:flex-row">
              <div className="hidden w-full border-b border-white/10 bg-slate-950/80 px-6 py-8 lg:block lg:w-[44%] lg:border-b-0 lg:border-r lg:max-h-[80vh] lg:overflow-y-auto scrollbar-hide">
                <div className="space-y-6">
                  <div ref={previewHeaderRef} className="flex items-center gap-3">
                    {currentStyle?.thumbnail ? (
                      <img
                        src={currentStyle.thumbnail}
                        alt={`${currentStyle.name} thumbnail`}
                        className="h-12 w-12 rounded-2xl border border-white/15 object-cover"
                      />
                    ) : null}
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-white/45">Current Style</p>
                      <p className="text-base font-semibold text-white">
                        {currentStyle?.name ?? 'Wondertone Canvas'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={clsx('relative', triggerFrameShimmer && 'frame-shimmer')}>
                      <Suspense fallback={<div className="h-64 rounded-3xl bg-white/5" />}>
                        <CanvasInRoomPreview
                          enableHoverEffect
                          showDimensions={false}
                          customRoomAssetSrc={previewRoomSrc}
                          customArtRectPct={previewArtRect}
                        />
                      </Suspense>
                      {orientationPreviewPending && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-950/70 text-sm font-semibold text-white/80">
                          Adapting preview…
                        </div>
                      )}
                      {isSuccessStep && !orientationPreviewPending && (
                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80 p-4">
                          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-[0_0_25px_rgba(16,185,129,0.45)]">
                            <span className="text-[10px]">✦</span> Ordered & in production
                          </div>
                          <p className="text-xs text-white/80">Tracking will arrive once it ships.</p>
                        </div>
                      )}
                    </div>

                    {/* Social Proof: Canvas testimonial grid */}
                    {SHOW_STATIC_TESTIMONIALS && (
                      <div className="mt-8 space-y-5">
                        <h3 className="font-display text-center text-lg font-semibold leading-tight text-white">
                          Join 10,000+ creators who fell in love
                        </h3>
                        <CanvasTestimonialGrid testimonials={CANVAS_TESTIMONIALS} />
                      </div>
                    )}

                    {/* Sticky guarantee: Fades in after scrolling past header */}
                    <TrustSignal
                      context="sticky_guarantee"
                      style={{ opacity: showStickyGuarantee ? 1 : 0 }}
                    />
                  </div>
                </div>
              </div>

              <div data-modal-content className="relative w-full max-h-[80vh] overflow-y-auto px-6 py-8 lg:w-[56%]">
                {/* Close button - positioned at true top-right corner */}
                <button
                  type="button"
                  onClick={() => requestClose('cancel')}
                  className="absolute right-6 top-6 z-10 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      if (mobilePreviewDragHandledRef.current) {
                        mobilePreviewDragHandledRef.current = false;
                        return;
                      }
                      setMobilePreviewExpanded((prev) => !prev);
                    }}
                    onPointerDown={(event) => {
                      if (event.pointerType !== 'mouse') {
                        beginMobilePreviewDrag(event.clientY);
                      }
                    }}
                    className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-white/80 transition hover:border-white/40"
                    aria-expanded={mobilePreviewExpanded}
                  >
                    <div>
                      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/45">
                        Your Canvas
                        {isSuccessStep && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                            Ordered
                          </span>
                        )}
                      </p>
                      <p className="text-base font-semibold text-white">
                        {selectedSizeOption ? selectedSizeOption.label : 'Select a size'}
                      </p>
                      <p className="text-xs text-white/60">{currency.format(total)}</p>
                    </div>
                    <span className={clsx('text-lg transition-transform', mobilePreviewExpanded && 'rotate-180')}>
                      ↓
                    </span>
                  </button>
                  <div
                    data-mobile-drawer
                    className={clsx(
                      'mt-3 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 transition-[max-height] duration-300 ease-out',
                      mobilePreviewExpanded ? 'max-h-[420px]' : 'max-h-0 border-transparent'
                    )}
                    aria-hidden={!mobilePreviewExpanded}
                  >
                    <div
                      className={clsx(
                        'p-3 transition-opacity duration-300 ease-out',
                        mobilePreviewExpanded ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      <div className={clsx('relative', triggerFrameShimmer && 'frame-shimmer')}>
                        <Suspense fallback={<div className="h-56 rounded-3xl bg-white/5" />}>
                          <CanvasInRoomPreview
                            enableHoverEffect
                            showDimensions={false}
                            customRoomAssetSrc={previewRoomSrc}
                            customArtRectPct={previewArtRect}
                          />
                        </Suspense>
                        {orientationPreviewPending && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-950/70 text-sm font-semibold text-white/80">
                            Adapting preview…
                          </div>
                        )}
                        {isSuccessStep && !orientationPreviewPending && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-between rounded-3xl bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80 p-3 text-xs text-white/80">
                            <span className="rounded-full bg-emerald-500/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                              Ordered ✦
                            </span>
                            <span>Tracking emailed soon</span>
                          </div>
                        )}
                      </div>

                      {/* Social Proof: Universal testimonial */}
                      {SHOW_STATIC_TESTIMONIALS && (
                        <StaticTestimonial
                          quote="This canvas completely transformed our living room. The quality is absolutely stunning, and every guest asks where we got it."
                          author="Sarah M."
                          location="Austin, TX"
                          className="mt-3"
                        />
                      )}
                    </div>
                  </div>
                </div>
                {isCanvasStep && (
                  <div className="space-y-8">
                    <header className="space-y-3 pb-6">
                      <Dialog.Title className="font-display text-[32px] font-semibold leading-tight tracking-tight text-white">
                        ✨ Turn Your Memory Into a Masterpiece
                      </Dialog.Title>
                      <Dialog.Description className="font-poppins text-[16px] font-semibold leading-relaxed text-white/80">
                        Museum-grade canvas. Arrives ready to hang. Ships in 3-5 days.
                      </Dialog.Description>
                      <CanvasCheckoutStepIndicator
                        showTimer={false}
                        timerSeed={timerSeed}
                        timerRunning={canvasModalOpen && isCanvasStep}
                      />
                    </header>

                    <section className="space-y-4" data-section="frame-selection">
                      <div className="space-y-2">
                        <h3 className="font-display text-xl font-semibold text-white">1. Choose Your Frame</h3>
                        <p className="font-poppins text-sm text-white/60">Select the finish that makes your art shine.</p>
                      </div>
                      <div className="flex gap-3">
                        {FRAME_OPTIONS.map((option) => {
                          const active = selectedFrame === option.id;
                          const isDisabled = option.id !== 'none' && orientationPreviewPending;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleFrameSelect(option.id)}
                              disabled={isDisabled}
                              className={clsx(
                                'group flex flex-1 items-center gap-3 rounded-full border px-5 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                                active
                                  ? 'scale-[1.02] border-purple-400 bg-purple-500/15 text-white shadow-glow-purple'
                                  : 'border-white/15 bg-white/5 text-white/70 hover:scale-[1.02] hover:border-white/30 hover:bg-white/10',
                                !active && 'active:scale-[0.98]',
                                isDisabled && 'cursor-not-allowed opacity-40'
                              )}
                            >
                              <span
                                className={clsx(
                                  'h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-white/5',
                                  active ? 'border-purple-400/50' : 'border-white/10'
                                )}
                              >
                                <img
                                  src={option.thumbnail}
                                  alt={`${option.label} thumbnail`}
                                  className="h-full w-full object-cover"
                                  draggable={false}
                                />
                              </span>
                              <p className="font-display text-base font-semibold text-white">{option.label}</p>
                              {active && (
                                <svg
                                  className="ml-auto h-5 w-5 shrink-0 text-purple-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section className="space-y-6" data-section="size-selection">
                      <div className="space-y-2">
                        <h3 className="font-display text-xl font-semibold text-white">2. Choose Your Size</h3>
                        <p className="font-poppins text-sm text-white/60">
                          Museum-quality canvas, handcrafted frame, ready to hang
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {sizeOptions.map((option) => {
                          const isRecommended = option.id === recommendation.recommendedSize;
                          const isMostPopular = option.id === recommendation.mostPopularSize;

                          const handleSizeSelect = () => {
                            setCanvasSize(option.id);
                            trackCheckoutRecommendationSelected(option.id, isRecommended, isMostPopular);

                            // Trigger frame shimmer if frame is enabled
                            if (floatingFrame?.enabled) {
                              setTriggerFrameShimmer(true);
                              setTimeout(() => setTriggerFrameShimmer(false), 300);
                            }

                            // Auto-expand mobile drawer on first selection
                            if (!hasAutoExpandedOnce && typeof window !== 'undefined' && window.innerWidth < 1024) {
                              setMobilePreviewExpanded(true);
                              setHasAutoExpandedOnce(true);

                              // Brief pulse hint
                              clearDrawerPulseTimeouts();
                              drawerPulseTimeoutRef.current = window.setTimeout(() => {
                                const drawer = document.querySelector('[data-mobile-drawer]');
                                if (drawer) {
                                  drawer.classList.add('motion-safe:animate-[pulse_600ms_ease-in-out_2]');
                                  drawerPulseCleanupTimeoutRef.current = window.setTimeout(() => {
                                    drawer.classList.remove('motion-safe:animate-[pulse_600ms_ease-in-out_2]');
                                    drawerPulseCleanupTimeoutRef.current = null;
                                  }, 1200);
                                }
                              }, 100);
                            }
                          };

                          return (
                            <CanvasSizeCard
                              key={option.id}
                              option={option}
                              isSelected={selectedCanvasSize === option.id}
                              isRecommended={SHOW_SIZE_RECOMMENDATIONS && isRecommended}
                              isMostPopular={SHOW_SIZE_RECOMMENDATIONS && isMostPopular}
                              onSelect={handleSizeSelect}
                              showSocialProof={false}
                              _enableCountAnimation={false}
                            />
                          );
                        })}
                      </div>
                    </section>

                    {/* SECTION 1: Premium Trust Bar + Primary CTA - Immediate Action */}
                    <footer className="space-y-4 border-t border-white/10 pt-6 mt-8">
                      {renderPremiumTrustBar()}

                      <button
                        type="button"
                        onClick={handlePrimaryCta}
                        disabled={canvasAdvanceDisabled}
                        className={clsx(
                          'w-full rounded-[26px] border border-purple-400 bg-gradient-to-r from-purple-500 via-purple-500 to-blue-500 py-4 text-base font-semibold text-white shadow-glow-purple transition',
                          canvasAdvanceDisabled
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:shadow-glow-purple motion-safe:hover:scale-[1.01]'
                        )}
                      >
                        {USE_NEW_CTA_COPY ? 'Begin Production →' : 'Continue to Contact & Shipping →'}
                      </button>
                    </footer>

                    {/* SECTION 2: Enhanced Order Summary - Config Review */}
                    <div className="mt-6">
                      {renderEnhancedOrderSummary()}
                    </div>

                    {/* SECTION 3: Testimonials - Compact Social Proof */}
                    <div className="mt-6 space-y-3">
                      <StaticTestimonial
                        quote="This canvas completely transformed our living room. The quality is absolutely stunning."
                        author="Sarah M."
                        location="Austin, TX"
                        verified={true}
                        canvasImageUrl="/testimonials/canvas-1.jpg"
                        layout="horizontal"
                        imagePosition="left"
                      />

                      <StaticTestimonial
                        quote="The print arrived museum-ready. Zero nails, instant conversation starter."
                        author="Avery M."
                        location="Brooklyn, NY"
                        verified={true}
                        canvasImageUrl="/testimonials/canvas-2.jpg"
                        layout="horizontal"
                        imagePosition="right"
                      />

                      <StaticTestimonial
                        quote="Museum-quality print. Everyone asks where we got it."
                        author="James K."
                        location="Seattle, WA"
                        verified={true}
                        canvasImageUrl="/testimonials/canvas-3.jpg"
                        layout="horizontal"
                        imagePosition="left"
                      />
                    </div>

                    {/* SECTION 4: Micro Trust Row - Final Reassurance */}
                    <p className="mt-4 text-center text-[11px] leading-relaxed text-white/45">
                      ⭐ 4.9/5 from 1,200+ collectors · 🚚 5-day insured shipping · 🛡️ 100-day guarantee
                    </p>
                  </div>
                )}
                {isContactStep && (
              <section className="space-y-6 px-6 pb-10 transition duration-200 motion-safe:animate-[slideFade_240ms_ease-out]">
                <div className="flex flex-wrap items-center justify-between gap-3 text-white/60">
                  <button
                    type="button"
                    onClick={() => setStep('canvas')}
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:text-white"
                  >
                    <span aria-hidden="true" className="text-lg">
                      ←
                    </span>
                    Back to Canvas Setup
                  </button>
                  <span className="text-xs uppercase tracking-[0.28em]">Step 2 · Contact</span>
                </div>
                <CanvasCheckoutStepIndicator />
                <div className="rounded-3xl border border-white/12 bg-slate-950/75 p-6">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">Who should we reach?</p>
                    <p className="text-base text-white/80">
                      We’ll send studio confirmations, shipping timelines, and concierge support to this inbox.
                    </p>
                  </div>
                  <div className="mt-6">
                    <ContactForm onNext={handleContactNext} />
                  </div>
                </div>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <div className="space-y-6 lg:flex-1">{renderOrderSummaryCard()}</div>
                  <div className="space-y-6 lg:w-[300px]">
                    {renderTrustSignals()}
                    {renderTestimonialCard()}
                  </div>
                </div>
              </section>
            )}
            {isShippingStep && (
              <section className="space-y-6 px-6 pb-10 transition duration-200 motion-safe:animate-[slideFade_240ms_ease-out]">
                <div className="flex flex-wrap items-center justify-between gap-3 text-white/60">
                  <button
                    type="button"
                    onClick={() => setStep('contact')}
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:text-white"
                  >
                    <span aria-hidden="true" className="text-lg">
                      ←
                    </span>
                    Back to Contact Details
                  </button>
                  <span className="text-xs uppercase tracking-[0.28em]">Step 3 · Shipping</span>
                </div>
                <CanvasCheckoutStepIndicator />
                <div className="rounded-3xl border border-white/12 bg-slate-950/75 p-6">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">Where should we deliver?</p>
                    <p className="text-base text-white/80">
                      Provide a trusted address for insured delivery. We’ll share tracking the moment your canvas ships.
                    </p>
                  </div>
                  <div className="mt-6">
                    <ShippingForm onBack={handleShippingBack} onNext={handleShippingNext} />
                  </div>
                </div>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <div className="space-y-6 lg:flex-1">{renderOrderSummaryCard()}</div>
                  <div className="space-y-6 lg:w-[300px]">
                    {renderTrustSignals()}
                    {renderTestimonialCard()}
                  </div>
                </div>
              </section>
            )}
            {isPaymentStep && (
              <section className="space-y-6 px-6 pb-10 transition duration-200 motion-safe:animate-[slideFade_240ms_ease-out]">
                <div className="flex flex-wrap items-center justify-between gap-3 text-white/60">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:text-white"
                  >
                    <span aria-hidden="true" className="text-lg">
                      ←
                    </span>
                    Back to Shipping
                  </button>
                  <span className="text-xs uppercase tracking-[0.28em]">Step 4 · Payment</span>
                </div>
                <CanvasCheckoutStepIndicator />
                <div className="rounded-3xl border border-white/12 bg-slate-950/75 p-6">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">Secure payment</p>
                    <p className="text-base text-white/80">
                      Wondertone uses Stripe with 3D Secure. Your card information never touches our servers.
                    </p>
                  </div>
                  <div className="mt-6">
                    <Suspense
                      fallback={
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/70">
                          Preparing secure payment…
                        </div>
                      }
                    >
                      <PaymentStep
                        onBack={handlePaymentBack}
                        onSuccess={handlePaymentSuccess}
                        returnUrl={modalReturnUrl}
                      />
                    </Suspense>
                  </div>
                </div>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <div className="space-y-6 lg:flex-1">{renderOrderSummaryCard()}</div>
                  <div className="space-y-6 lg:w-[300px]">
                    {renderTrustSignals()}
                    {renderTestimonialCard()}
                  </div>
                </div>
              </section>
            )}
            {isSuccessStep && (
              <section className="space-y-8 px-6 pb-10 transition duration-200 motion-safe:animate-[slideFade_240ms_ease-out]">
                <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-purple-900/60 via-slate-950 to-slate-950/95 p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.65)]">
                  <div className="pointer-events-none absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-500/30 blur-[120px]" />
                  <div className="pointer-events-none absolute -right-24 top-0 h-48 w-48 rounded-full bg-emerald-400/20 blur-[100px]" />
                  <div className="relative space-y-3 text-center">
                    <span className="text-xs uppercase tracking-[0.35em] text-white/60">Wondertone Checkout</span>
                    <h2 className="text-3xl font-semibold">Your canvas is officially in production</h2>
                    <p className="text-white/70">
                      Our atelier is stretching your piece, applying finishes, and preparing premium packaging.
                    </p>
                  </div>
                  <div className="relative mt-8 grid gap-4 md:grid-cols-3">
                    {successTimeline.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
                      >
                        <div className="text-xl">{item.icon}</div>
                        <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-white/70">{item.body}</p>
                      </div>
                    ))}
                  </div>
                  <div className="relative mt-8 flex flex-col gap-3 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-center">
                    <button
                      type="button"
                      className="w-full rounded-2xl bg-white/90 px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-white sm:w-auto"
                      onClick={() => requestClose('purchase_complete')}
                    >
                      Return to Studio
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-2xl border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white/90 transition hover:border-white/60 sm:w-auto"
                      onClick={handleShareSuccess}
                    >
                      Share the excitement →
                    </button>
                  </div>
                  {shareFeedback ? (
                    <p className="mt-3 text-center text-xs text-white/70">{shareFeedback}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <div className="space-y-6 lg:flex-1">{renderOrderSummaryCard()}</div>
                  <div className="space-y-6 lg:w-[300px]">
                    {renderTrustSignals()}
                    {renderTestimonialCard()}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
        </Dialog.Content>
      </Dialog.Portal>
      {exitPromptReason && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="w-full max-w-sm translate-y-2 scale-95 rounded-3xl border border-white/10 bg-slate-900/95 p-6 text-white shadow-xl opacity-0 animate-[fadeUp_200ms_ease-out_forwards]">
            <p className="text-lg font-semibold">Step away from checkout?</p>
            <p className="mt-2 text-sm text-white/70">
              Your progress will be saved for a little while. Come back any time to finish where you left off.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
                onClick={() => {
                  trackCheckoutExit('stay', step, exitPromptReason ?? 'unknown');
                  setExitPromptReason(null);
                }}
              >
                Stay in checkout
              </button>
              <button
                type="button"
                className="rounded-2xl bg-white/90 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                onClick={() => {
                  const reason = exitPromptReason ?? 'cancel';
                  trackCheckoutExit('leave', step, reason);
                  setExitPromptReason(null);
                  commitClose(reason);
                }}
              >
                Leave for now
              </button>
            </div>
          </div>
        </div>
      )}
    </Dialog.Root>
  );
};

export default CanvasCheckoutModal;
