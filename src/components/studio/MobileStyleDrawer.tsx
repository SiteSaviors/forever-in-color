import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import { Suspense, lazy, useEffect, useRef, useState, type TouchEvent } from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import OriginalImageCard from '@/sections/studio/components/OriginalImageCard';
import StyleAccordionFallback from '@/sections/studio/components/StyleAccordionFallback';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

const StyleAccordion = lazy(() => import('@/sections/studio/components/StyleAccordion'));

type MobileStyleDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  hasCroppedImage: boolean;
  remainingTokens: number | null;
  userTier: string;
};

export default function MobileStyleDrawer({
  isOpen,
  onClose,
  hasCroppedImage,
  remainingTokens,
  userTier,
}: MobileStyleDrawerProps) {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const touchStartYRef = useRef<number | null>(null);

  // Subscribe to store state for smart auto-close
  const pendingStyleId = useFounderStore((state) => state.pendingStyleId);
  const stylePreviewStatus = useFounderStore((state) => state.stylePreviewStatus);

  // Lock body scroll when drawer is open
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

  // Smart auto-close: Close drawer when preview generation actually starts
  // This ensures we don't close on locked styles (gate denied), only on successful generation
  useEffect(() => {
    if (!isOpen) return;

    // Close when preview status becomes 'generating' (indicates successful style selection)
    // This only happens after gate validation passes, not when gate is denied
    if (stylePreviewStatus === 'generating' || pendingStyleId !== null) {
      // Small delay to ensure smooth visual transition
      const timer = setTimeout(() => {
        onClose();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [stylePreviewStatus, pendingStyleId, isOpen, onClose]);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

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

  useEffect(() => {
    const handleOrientationChange = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [isOpen, onClose]);

  const prefersReducedMotion = usePrefersReducedMotion();

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
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          <m.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={transition}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden border-t border-white/15 bg-slate-950/95 backdrop-blur-2xl shadow-[0_-24px_60px_rgba(8,14,29,0.65)] rounded-t-[2.25rem]"
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
          >
            <div
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>

            <div className="relative px-6 py-5 border-b border-white/10 max-[360px]:px-4">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40 blur-2xl"
                style={{
                  background:
                    'radial-gradient(120% 80% at 0% 0%, rgba(139, 92, 246, 0.35), transparent 65%), radial-gradient(120% 80% at 100% 0%, rgba(59, 130, 246, 0.28), transparent 70%)',
                }}
              />
              <div className="relative flex items-center justify-between gap-4">
                <h2
                  id="mobile-drawer-title"
                  className="text-[1.05rem] font-display uppercase tracking-[0.32em] text-white"
                >
                  Wondertone Styles
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-11 h-11 flex items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15 active:bg-white/20"
                  aria-label="Close style picker"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p
                id="mobile-drawer-desc"
                className="relative mt-3 text-[11px] uppercase tracking-[0.28em] text-white/55"
              >
                Choose your artistic tone
              </p>
            </div>

            <div className="relative border-b border-white/10 px-6 py-4 max-[360px]:px-4">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-30 blur-2xl"
                style={{
                  background:
                    'radial-gradient(120% 100% at 15% 0%, rgba(14, 165, 233, 0.25), transparent 70%), radial-gradient(110% 90% at 85% 20%, rgba(59, 130, 246, 0.22), transparent 75%)',
                }}
              />
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/55">Remaining</p>
                  <p className="text-2xl font-display tracking-[0.12em] text-white">
                    {remainingTokens == null ? '∞' : Math.max(0, remainingTokens)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/55">Tier</p>
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.3em] text-white/80">
                    {userTier.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ CORRECTED: Preserve mobile scroll structure with accordion inside */}
            <div className="relative flex-1 overflow-y-auto px-4 py-6 max-[360px]:px-3">
              {/* Scroll fade indicators */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-950/95 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950/95 to-transparent z-10" />

              {/* Content */}
              <div className="relative pb-8 space-y-4">
                {/* Original Image Card - always visible */}
                <OriginalImageCard />

                {/* StyleAccordion component - handles selection and closes drawer */}
                <Suspense fallback={<StyleAccordionFallback />}>
                  <StyleAccordion hasCroppedImage={hasCroppedImage} />
                </Suspense>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
