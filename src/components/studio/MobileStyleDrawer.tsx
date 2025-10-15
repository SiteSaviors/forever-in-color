import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import type { StyleOption } from '@/store/useFounderStore';

type PreviewState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
};

type MobileStyleDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  styles: StyleOption[];
  selectedStyleId: string | null;
  onStyleSelect: (styleId: string) => void;
  previews: Record<string, PreviewState>;
  canGenerateMore: boolean;
  pendingStyleId: string | null;
  remainingTokens: number | null;
  userTier: string;
};

export default function MobileStyleDrawer({
  isOpen,
  onClose,
  styles,
  selectedStyleId,
  onStyleSelect,
  previews,
  canGenerateMore,
  pendingStyleId,
  remainingTokens,
  userTier,
}: MobileStyleDrawerProps) {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const touchStartYRef = useRef<number | null>(null);

  // iOS Safari scroll lock - prevents body bounce
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Track viewport height for iOS Safari (100vh bug fix)
  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Android back button support
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

    // Add fake history state when drawer opens
    window.history.pushState({ drawer: 'open' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      try {
        if (window.history.state?.drawer === 'open') {
          window.history.back();
        }
      } catch (error) {
        console.warn('[MobileStyleDrawer] Unable to pop history state', error);
      }
    };
  }, [isOpen, onClose]);

  // Close drawer on orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [isOpen, onClose]);

  const handleStyleClick = (styleId: string) => {
    onStyleSelect(styleId);
    onClose(); // Auto-close after selection
  };

  // Detect reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const transition = prefersReducedMotion
    ? { duration: 0.15, ease: 'easeOut' }
    : { type: 'spring', damping: 30, stiffness: 300 };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current == null) return;
    const currentY = event.touches[0]?.clientY ?? null;
    if (currentY != null) {
      const delta = currentY - touchStartYRef.current;
      if (delta > 90) {
        touchStartYRef.current = null;
        onClose();
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={transition}
            className="fixed inset-x-0 bottom-0 z-50 bg-slate-900 rounded-t-3xl border-t-2 border-white/20 shadow-2xl flex flex-col"
            style={{
              maxHeight: `min(85vh, ${viewportHeight * 0.85}px)`,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-drawer-title"
            aria-describedby="mobile-drawer-desc"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag Handle (visual affordance) */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 max-[360px]:px-4 max-[360px]:py-3">
              <div>
                <h2
                  id="mobile-drawer-title"
                  className="text-xl font-bold text-white max-[360px]:text-lg"
                >
                  Choose AI Style
                </h2>
                <p id="mobile-drawer-desc" className="text-xs text-white/60 mt-1 max-[360px]:text-[11px]">
                  {styles.length} styles available • Tap to preview
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 transition-colors"
                aria-label="Close style picker"
                style={{ touchAction: 'manipulation' }}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Grid */}
            <div className="relative flex-1 overflow-y-auto px-4 py-6 max-[360px]:px-3">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-900 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-900 to-transparent" />
              <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6 max-[360px]:gap-3">
                {styles.map((style) => {
                  const isSelected = style.id === selectedStyleId;
                  const isPending = style.id === pendingStyleId;
                  const isReady = previews[style.id]?.status === 'ready';
                  const isLocked = (isPending || !canGenerateMore) && !isSelected;

                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleStyleClick(style.id)}
                      disabled={isLocked}
                      data-mobile-style-card
                      className={`
                        flex flex-col gap-3 p-3 rounded-2xl text-left transition-all min-h-[180px]
                        ${
                          isSelected
                            ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-2 border-purple-400 shadow-glow-soft'
                            : 'bg-white/5 border-2 border-white/10 active:bg-white/10 active:border-white/20'
                        }
                        ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        max-[360px]:min-h-[160px]
                      `}
                      style={{
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800">
                        <img
                          src={style.thumbnail}
                          alt={`${style.name} preview`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Selected indicator overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-purple-500/40 animate-fadeIn">
                            <svg
                              className="w-8 h-8 text-white drop-shadow-lg"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Cached "Ready" badge */}
                        {isReady && !isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                            Ready
                          </div>
                        )}

                        {/* Pending generation indicator */}
                        {isPending && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
                            <div className="w-8 h-8 border-3 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-sm font-bold text-white line-clamp-1 max-[360px]:text-[13px]">
                          {style.name}
                        </h3>
                        <p className="text-xs text-white/60 mt-1 line-clamp-2 flex-1 max-[360px]:text-[11px]">
                          {style.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer with Token Counter */}
            <div
              className="px-6 py-4 border-t border-white/10 bg-slate-950/50 max-[360px]:px-4 max-[360px]:py-3"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="flex items-center justify-between gap-4 max-[360px]:gap-3">
                <p className="text-xs text-white/60 max-[360px]:text-[11px]">
                  Tap a style to generate your preview
                </p>

                {/* Token Counter */}
                {remainingTokens !== null && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 flex-shrink-0">
                    <svg
                      className="w-3.5 h-3.5 text-purple-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-bold text-purple-200">
                      {remainingTokens === Infinity || remainingTokens === null
                        ? '∞'
                        : Math.max(0, remainingTokens)}{' '}
                      left
                    </span>
                  </div>
                )}

                {/* Upgrade badge for free users */}
                {userTier === 'anonymous' || userTier === 'free' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-purple-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">
                      Upgrade
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
