import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
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

const orientationOrder: Array<'vertical' | 'square' | 'horizontal'> = ['vertical', 'square', 'horizontal'];

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
  const { closeCanvasModal, setCanvasSize, setFrame, toggleEnhancement, setLivingCanvasModalOpen, computedTotal } =
    useCanvasConfigActions();
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
  const livingCanvas = useMemo(
    () => enhancements.find((item) => item.id === 'living-canvas'),
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

  const handleFrameToggle = () => {
    if (!floatingFrame) return;
    const nextEnabled = !floatingFrame.enabled;
    toggleEnhancement('floating-frame');
    const nextFrame: FrameColor = nextEnabled ? (selectedFrame === 'white' ? 'white' : 'black') : 'none';
    setFrame(nextFrame);
  };

  const handleLivingCanvasToggle = () => {
    if (!livingCanvas) return;
    if (!livingCanvas.enabled) {
      setLivingCanvasModalOpen(true);
    } else {
      toggleEnhancement('living-canvas');
    }
  };

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
      “The print arrived museum-ready. Zero nails, instant conversation starter.” — Avery M.
    </section>
  );

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
                          customRoomAssetSrc={checkoutPreviewAsset ?? undefined}
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

              <div data-modal-content className="w-full max-h-[80vh] overflow-y-auto px-6 py-8 lg:w-[56%]">
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
                            customRoomAssetSrc={checkoutPreviewAsset ?? undefined}
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
                    <header className="space-y-2">
                      <Dialog.Title className="font-display text-[34px] font-semibold text-white">
                        Bring Your Art Home
                      </Dialog.Title>
                      <Dialog.Description className="text-sm text-white/70">
                        Premium canvas, handcrafted frame, and a ready-to-hang finish—all curated for your Wondertone style.
                      </Dialog.Description>
                      <CanvasCheckoutStepIndicator
                        showTimer
                        timerSeed={timerSeed}
                        timerRunning={canvasModalOpen && isCanvasStep}
                      />
                      <button
                        type="button"
                        onClick={() => requestClose('cancel')}
                        className="absolute right-5 top-5 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                        aria-label="Close"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} fill="none">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </header>

                    <section className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/45">Orientation</p>
                      <div className="flex flex-wrap gap-3">
                        {orientationOrder.map((orient) => {
                          const preset = ORIENTATION_PRESETS[orient];
                          const active = orientation === orient;
                          return (
                            <button
                              key={orient}
                              type="button"
                              disabled
                              aria-disabled="true"
                              className={clsx(
                                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                                active
                                  ? 'border-purple-400 bg-purple-500/20 text-white shadow-glow-purple cursor-default'
                                  : 'border-white/15 bg-white/5 text-white/35 cursor-not-allowed'
                              )}
                            >
                              {preset.label}
                              {active && <span className="text-xs text-white/60">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-white/60">
                        {orientationPreviewPending
                          ? 'Applying your crop…'
                          : `${orientationLabel} ready for your canvas. Adjust orientation back in the Studio if needed.`}
                      </p>
                    </section>

                    <section className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/45">Canvas Size</p>
                      <div className="grid gap-3 sm:grid-cols-2">
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

                    {/* Trust signal: Quality guarantee near size selection */}
                    <TrustSignal context="canvas_quality" className="mt-4" />

                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Floating Frame</p>
                        <button
                          type="button"
                          onClick={handleFrameToggle}
                          className={clsx(
                            'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition',
                            floatingFrame?.enabled
                              ? 'border-purple-400 bg-purple-500/20 text-white'
                              : 'border-white/20 text-white/60 hover:bg-white/10'
                          )}
                        >
                          {floatingFrame?.enabled ? 'Remove Frame' : 'Add Frame'}
                        </button>
                      </div>
                      {floatingFrame?.enabled ? (
                        <div className="flex gap-3">
                          {(['black', 'white'] as FrameColor[]).map((frame) => (
                            <button
                              key={frame}
                              type="button"
                              onClick={() => setFrame(frame)}
                              className={clsx(
                                'flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition',
                                selectedFrame === frame
                                  ? 'border-purple-400 bg-purple-500/20 text-white'
                                  : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                              )}
                            >
                              {frame} Frame
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/55">Elevate with a floating frame in black or white.</p>
                      )}
                      {/* Trust signal: Artisan craftsmanship */}
                      <TrustSignal context="artisan_craft" className="mt-3" />
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Living Canvas AR</p>
                        <span className="text-xs font-semibold text-white/70">
                          {livingCanvas ? `+ ${currency.format(livingCanvas.price)}` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleLivingCanvasToggle}
                        className={clsx(
                          'w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition',
                          livingCanvas?.enabled
                            ? 'border-purple-400 bg-purple-500/15 text-white'
                            : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                        )}
                      >
                        {livingCanvas?.enabled ? 'Included in your order' : 'Add Living Canvas augmented moment'}
                      </button>
                    </section>

                    {renderOrderSummaryCard()}
                    {renderTrustSignals()}
                    {renderTestimonialCard()}

                    <footer className="flex flex-col gap-3 border-t border-white/10 bg-slate-950/80 pt-4 mt-6">
                      {/* Trust signal: Final reassurance before commitment */}
                      <TrustSignal context="cta_strip" />

                      <button
                        type="button"
                        onClick={handlePrimaryCta}
                        disabled={canvasAdvanceDisabled}
                        className={clsx(
                          'w-full rounded-[26px] border border-purple-400 bg-gradient-to-r from-purple-500 via-purple-500 to-blue-500 py-4 text-base font-semibold text-white shadow-glow-purple transition',
                          canvasAdvanceDisabled ? 'cursor-not-allowed opacity-40' : 'hover:shadow-glow-purple'
                        )}
                      >
                        {USE_NEW_CTA_COPY ? 'Begin Production →' : 'Continue to Contact & Shipping →'}
                      </button>
                    </footer>
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
