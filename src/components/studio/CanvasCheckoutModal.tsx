import { Suspense, lazy, useCallback, useMemo, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { CANVAS_SIZE_OPTIONS, getCanvasSizeOption } from '@/utils/canvasSizes';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import { type CanvasModalCloseReason, type FrameColor } from '@/store/founder/storeTypes';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { ENABLE_STUDIO_V2_CANVAS_MODAL } from '@/config/featureFlags';
import { trackStudioV2CanvasModalOrientation } from '@/utils/studioV2Analytics';
import { useCanvasConfigActions, useCanvasConfigState } from '@/store/hooks/useCanvasConfigStore';
import { useStyleCatalogState } from '@/store/hooks/useStyleCatalogStore';
import { useUploadState } from '@/store/hooks/useUploadStore';

const CanvasInRoomPreview = lazy(() => import('@/components/studio/CanvasInRoomPreview'));

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const orientationOrder: Array<'vertical' | 'square' | 'horizontal'> = ['vertical', 'square', 'horizontal'];

const CanvasCheckoutModal = () => {
  const navigate = useNavigate();
  const closingReasonRef = useRef<CanvasModalCloseReason | null>(null);
  const { canvasModalOpen, selectedCanvasSize, selectedFrame, enhancements, orientationPreviewPending } =
    useCanvasConfigState();
  const { closeCanvasModal, setCanvasSize, setFrame, toggleEnhancement, setLivingCanvasModalOpen, computedTotal } =
    useCanvasConfigActions();
  const { orientation } = useUploadState();
  const { currentStyle } = useStyleCatalogState();

  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  const floatingFrame = useMemo(
    () => enhancements.find((item) => item.id === 'floating-frame'),
    [enhancements]
  );
  const livingCanvas = useMemo(
    () => enhancements.find((item) => item.id === 'living-canvas'),
    [enhancements]
  );

  const sizeOptions = CANVAS_SIZE_OPTIONS[orientation];
  const total = computedTotal();
  const selectedSizeOption = selectedCanvasSize ? getCanvasSizeOption(selectedCanvasSize) : null;
  const orientationLabel = ORIENTATION_PRESETS[orientation].label;

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

  const handleClose = useCallback(
    (reason: CanvasModalCloseReason) => {
      closingReasonRef.current = reason;
      closeCanvasModal(reason);
    },
    [closeCanvasModal]
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const pending = closingReasonRef.current;
      closingReasonRef.current = null;
      if (!pending) {
        closeCanvasModal('dismiss');
      }
    }
  };

  const handleOrientationSelect = (target: 'vertical' | 'square' | 'horizontal') => {
    const cropper = (window as typeof window & {
      __openOrientationCropper?: (orientation?: typeof target) => void;
    }).__openOrientationCropper;
    const styleId = currentStyle?.id;
    if (styleId) {
      trackStudioV2CanvasModalOrientation({ styleId, orientation: target });
    }
    cropper?.(target);
  };

  const handlePrimaryCta = () => {
    resetCheckout();
    handleClose('purchase_complete');
    navigate('/checkout');
  };

  if (!ENABLE_STUDIO_V2_CANVAS_MODAL) return null;

  const enhancementsSummary = enhancements
    .filter((item) => item.enabled)
    .map((item) => item.name);

  return (
    <Dialog.Root open={canvasModalOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md"
          onPointerDown={(event) => {
            event.preventDefault();
            handleClose('backdrop');
          }}
        />
        <Dialog.Content
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            handleClose('esc_key');
          }}
          onPointerDownOutside={(event) => {
            event.preventDefault();
            handleClose('backdrop');
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10"
        >
          <div className="relative w-full max-w-[1020px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_rgba(5,10,25,0.7)]">
            <div className="flex flex-col gap-10 lg:flex-row">
              <div className="w-full border-b border-white/10 bg-slate-950/80 px-6 py-8 lg:w-[44%] lg:border-b-0 lg:border-r">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
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
                    <div className="relative">
                      <Suspense fallback={<div className="h-64 rounded-3xl bg-white/5" />}>
                        <CanvasInRoomPreview enableHoverEffect showDimensions={false} />
                      </Suspense>
                      {orientationPreviewPending && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-950/70 text-sm font-semibold text-white/80">
                          Adapting preview…
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-white/60">Preview updates as you adjust materials and finishes.</p>
                  </div>
                </div>
              </div>

              <div className="w-full max-h-[80vh] overflow-y-auto px-6 py-8 lg:w-[56%]">
                <div className="space-y-8">
                  <header className="space-y-2">
                    <Dialog.Title className="font-display text-[34px] font-semibold text-white">
                      Bring Your Art Home
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-white/70">
                      Premium canvas, handcrafted frame, and a ready-to-hang finish—all curated for your Wondertone style.
                    </Dialog.Description>
                    <button
                      type="button"
                      onClick={() => handleClose('cancel')}
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
                            onClick={() => handleOrientationSelect(orient)}
                            disabled={orientationPreviewPending}
                            className={clsx(
                              'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                              active
                                ? 'border-purple-400 bg-purple-500/20 text-white shadow-glow-purple'
                                : 'border-white/20 text-white/70 hover:bg-white/10',
                              orientationPreviewPending && 'cursor-wait opacity-70'
                            )}
                          >
                            {preset.label}
                            {active && (
                              <span className="text-xs text-white/60">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-white/60">
                      {orientationPreviewPending ? 'Applying your crop…' : `${orientationLabel} ready for your canvas.`}
                    </p>
                  </section>

                  <section className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Canvas Size</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sizeOptions.map((option) => {
                        const active = selectedCanvasSize === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setCanvasSize(option.id)}
                            className={clsx(
                              'rounded-2xl border px-4 py-4 text-left transition',
                              active
                                ? 'border-purple-400 bg-purple-500/15 text-white shadow-glow-purple'
                                : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">{option.label}</p>
                                {option.nickname ? (
                                  <p className="text-xs uppercase tracking-[0.32em] text-white/45">{option.nickname}</p>
                                ) : null}
                              </div>
                              <span className="text-sm font-semibold text-white/80">
                                {currency.format(option.price)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

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

                  <section className="space-y-4 rounded-3xl border border-white/12 bg-white/5 p-5">
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

                  <section className="rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/70">
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

                  <section className="rounded-3xl border border-dashed border-white/12 bg-white/5 p-6 text-sm text-white/60">
                    “The print arrived museum-ready. Zero nails, instant conversation starter.” — Avery M.
                  </section>

                  <footer className="sticky bottom-0 flex flex-col gap-3 border-t border-white/10 bg-slate-950/80 pt-4">
                    <button
                      type="button"
                      onClick={handlePrimaryCta}
                      className="w-full rounded-[26px] border border-purple-400 bg-gradient-to-r from-purple-500 via-purple-500 to-blue-500 py-4 text-base font-semibold text-white shadow-glow-purple transition hover:shadow-glow-purple"
                    >
                      Complete Your Order →
                    </button>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CanvasCheckoutModal;
