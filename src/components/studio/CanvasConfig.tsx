import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import type { Orientation } from '@/utils/imageUtils';

type Enhancement = {
  id: string;
  name: string;
  price: number;
  description: string;
  enabled: boolean;
};

type CanvasConfigProps = {
  isExpanded: boolean;
  isLocked: boolean;
  // Size selector props
  orientation: Orientation;
  sizeOptions: Array<{ id: string; label: string; nickname?: string; price: number }>;
  selectedSize: string;
  onSizeChange: (sizeId: string) => void;
  // Enhancements props
  floatingFrame: Enhancement | undefined;
  livingCanvas: Enhancement | undefined;
  selectedFrame: 'none' | 'black' | 'white';
  onToggleFloatingFrame: () => void;
  onToggleLivingCanvas: () => void;
  onFrameChange: (frame: 'black' | 'white') => void;
  onLivingCanvasInfoClick: () => void;
  // Order summary props
  currentStyleName: string | undefined;
  selectedSizeLabel: string | undefined;
  basePrice: number;
  enabledEnhancements: Array<{ id: string; name: string; price: number }>;
  total: number;
  checkoutDisabled: boolean;
  checkoutError: string | null;
  onCheckout: () => void;
  // Mobile room preview
  mobileRoomPreview?: React.ReactNode;
};

export default function CanvasConfig({
  isExpanded,
  isLocked,
  orientation: _orientation,
  sizeOptions,
  selectedSize,
  onSizeChange,
  floatingFrame,
  livingCanvas,
  selectedFrame,
  onToggleFloatingFrame,
  onToggleLivingCanvas,
  onFrameChange,
  onLivingCanvasInfoClick,
  currentStyleName,
  selectedSizeLabel,
  basePrice,
  enabledEnhancements,
  total,
  checkoutDisabled,
  checkoutError,
  onCheckout,
  mobileRoomPreview,
}: CanvasConfigProps) {
  const hasEnhancements = enabledEnhancements.length > 0;
  const sizeCardRef = useRef<HTMLDivElement>(null);
  const firstInteractiveRef = useRef<HTMLButtonElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Listen for reduced-motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

    setPrefersReducedMotion(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Auto-scroll to first card on expand
  useEffect(() => {
    if (!isExpanded || !sizeCardRef.current) return;

    if (prefersReducedMotion) {
      sizeCardRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      return;
    }

    const timer = window.setTimeout(() => {
      sizeCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [isExpanded, prefersReducedMotion]);

  // Focus first interactive control when expanded (if unlocked)
  useEffect(() => {
    if (!isExpanded || isLocked || !firstInteractiveRef.current) return;

    const focusControl = () => {
      firstInteractiveRef.current?.focus({ preventScroll: true });
    };

    if (prefersReducedMotion) {
      focusControl();
      return;
    }

    const timer = window.setTimeout(focusControl, 220);
    return () => window.clearTimeout(timer);
  }, [isExpanded, isLocked, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          id="canvas-options-panel"
          role="region"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeInOut' }}
          className="space-y-4 overflow-hidden"
        >
          {/* Canvas Size Selector - with stagger animation */}
          <motion.div
            ref={sizeCardRef}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.05 }}
          >
            <Card glass className="space-y-4 border-2 border-white/20 p-5">
              <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-white">Canvas Size</h3>
                {isLocked && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                    Finalize your photo to unlock
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {sizeOptions.map((size, index) => (
                  <button
                    key={size.id}
                    onClick={() => onSizeChange(size.id)}
                    disabled={isLocked}
                    ref={index === 0 ? firstInteractiveRef : undefined}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      selectedSize === size.id
                        ? 'bg-purple-500 text-white shadow-glow-soft'
                        : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                    } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold">{size.label}</span>
                      {size.nickname && (
                        <span className="text-[11px] uppercase tracking-[0.25em] text-white/50">
                          {size.nickname}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold">${size.price}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Enhancements - with stagger animation */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1 }}
          >
          <Card glass className="space-y-4 border-2 border-white/20 p-5">
            <h3 className="text-base font-bold text-white">Enhancements</h3>

            {/* Floating Frame */}
            {floatingFrame && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (isLocked) return;
                    onToggleFloatingFrame();
                  }}
                  disabled={isLocked}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
                    floatingFrame.enabled
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
                      : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      floatingFrame.enabled ? 'bg-purple-500 shadow-glow-soft' : 'bg-white/10'
                    }`}
                  >
                    {floatingFrame.enabled ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-bold text-white">{floatingFrame.name}</p>
                      <span className="text-sm font-bold text-white">+${floatingFrame.price}</span>
                    </div>
                    <p className="text-xs text-white/60">{floatingFrame.description}</p>
                  </div>
                </button>

                {/* Frame Color Selector */}
                {floatingFrame.enabled && (
                  <div className="pl-4 space-y-2 animate-fadeIn">
                    <p className="text-xs font-medium text-white/80">Frame Color</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => !isLocked && onFrameChange('black')}
                        disabled={isLocked}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                          selectedFrame === 'black'
                            ? 'bg-purple-500 text-white shadow-glow-soft'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <div className="w-4 h-4 rounded-full bg-black border border-white/20" />
                        Black
                      </button>
                      <button
                        onClick={() => !isLocked && onFrameChange('white')}
                        disabled={isLocked}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                          selectedFrame === 'white'
                            ? 'bg-purple-500 text-white shadow-glow-soft'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white border border-gray-300" />
                        White
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Living Canvas AR */}
            {livingCanvas && (
              <button
                onClick={() => {
                  if (isLocked) return;
                  onToggleLivingCanvas();
                }}
                disabled={isLocked}
                className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
                  livingCanvas.enabled
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
                    : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    livingCanvas.enabled ? 'bg-purple-500 shadow-glow-soft' : 'bg-white/10'
                  }`}
                >
                  {livingCanvas.enabled ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-bold text-white flex items-center gap-1">
                      {livingCanvas.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLivingCanvasInfoClick();
                        }}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </p>
                    <span className="text-sm font-bold text-white">+${livingCanvas.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-white/60 mb-2">{livingCanvas.description}</p>
                  {!livingCanvas.enabled && (
                    <span className="inline-block text-[10px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                      🎥 See Demo
                    </span>
                  )}
                </div>
              </button>
            )}
          </Card>
          </motion.div>

          {/* Mobile Room Preview - Only on mobile, between Enhancements and Order */}
          {mobileRoomPreview && <div className="lg:hidden">{mobileRoomPreview}</div>}

          {/* Order Summary - with stagger animation */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.15 }}
          >
          <Card glass className="space-y-4 border-2 border-white/20 p-5">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Your Order</h3>
              <p className="text-xs text-white/60">Review your selections</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 text-sm">
                <span className="text-white/70">
                  {currentStyleName ?? 'Canvas'} • {selectedSizeLabel ?? '—'}
                </span>
                <span className="font-bold text-white">${basePrice}</span>
              </div>

              {enabledEnhancements.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20 text-sm animate-scaleIn"
                >
                  <span className="text-purple-300 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item.name}
                  </span>
                  <span className="font-bold text-white">+${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400/40">
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
            </div>

            {/* Social Proof */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
              <p className="text-xs text-emerald-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">Rated 4.9/5 by 1,200+ customers</span>
              </p>
            </div>

            <button
              onClick={onCheckout}
              disabled={checkoutDisabled}
              className={`w-full bg-gradient-cta text-white font-bold text-base px-6 py-4 rounded-xl shadow-glow-purple transition-all duration-300 ${
                checkoutDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-glow-purple hover:scale-[1.02]'
              }`}
            >
              Complete Your Order →
            </button>

            {checkoutError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {checkoutError}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <span>Ships in 3-5 business days</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>100% satisfaction guarantee</span>
              </div>
            </div>

            {hasEnhancements && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border border-emerald-400/30 animate-fadeIn">
                <p className="text-xs font-semibold text-emerald-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium enhancements added!
                </p>
                <p className="text-xs text-white/60 mt-1">Your artwork will be truly exceptional</p>
              </div>
            )}
          </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
