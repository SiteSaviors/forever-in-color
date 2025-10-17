import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import OriginalImageCard from '@/sections/studio/components/OriginalImageCard';
import StyleAccordion from '@/sections/studio/components/StyleAccordion';

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
  const selectedStyleId = useFounderStore((state) => state.selectedStyleId);
  const selectedStyleIdRef = useRef(selectedStyleId);

  // Close drawer when user selects a style
  useEffect(() => {
    if (isOpen && selectedStyleId && selectedStyleId !== selectedStyleIdRef.current) {
      onClose();
    }
    selectedStyleIdRef.current = selectedStyleId;
  }, [selectedStyleId, isOpen, onClose]);

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

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
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 max-[360px]:px-4 max-[360px]:py-3">
              <div>
                <h2
                  id="mobile-drawer-title"
                  className="text-xl font-bold text-white max-[360px]:text-lg"
                >
                  Choose Your Style
                </h2>
                <p id="mobile-drawer-desc" className="text-xs text-white/60 mt-1 max-[360px]:text-[11px]">
                  Expand sections to browse styles
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

            <div className="px-6 py-4 border-b border-white/10">
              <p className="text-xs text-white/60">
                Tier: <span className="font-semibold text-white">{userTier.toUpperCase()}</span> · Remaining:{' '}
                <span className="font-semibold text-white">
                  {remainingTokens == null ? '∞' : Math.max(0, remainingTokens)}
                </span>
              </p>
            </div>

            {/* ✅ CORRECTED: Preserve mobile scroll structure with accordion inside */}
            <div className="relative flex-1 overflow-y-auto px-4 py-6 max-[360px]:px-3">
              {/* Scroll fade indicators */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-900 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-900 to-transparent z-10" />

              {/* Content */}
              <div className="relative pb-8 space-y-4">
                {/* Original Image Card - always visible */}
                <OriginalImageCard />

                {/* StyleAccordion component - handles selection and closes drawer */}
                <StyleAccordion hasCroppedImage={hasCroppedImage} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
