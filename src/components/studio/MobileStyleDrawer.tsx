import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import type { ToneSection } from '@/store/hooks/useToneSections';
import { useToneSectionPrefetch } from '@/hooks/useToneSectionPrefetch';

type PreviewState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
};

type MobileStyleDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  sections: ToneSection[];
  onStyleSelect: (styleId: string, meta?: { tone?: string }) => void;
  previews: Record<string, PreviewState>;
  pendingStyleId: string | null;
  remainingTokens: number | null;
  userTier: string;
};

export default function MobileStyleDrawer({
  isOpen,
  onClose,
  sections,
  onStyleSelect,
  previews,
  pendingStyleId,
  remainingTokens,
  userTier,
}: MobileStyleDrawerProps) {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const touchStartYRef = useRef<number | null>(null);

  const totalStyles = sections.reduce((sum, section) => sum + section.styles.length, 0);
  const sectionKeys = useMemo(() => sections.map((section) => section.tone), [sections]);

  const handlePrefetch = useCallback(
    (tone: string) => {
      const target = sections.find((section) => section.tone === tone);
      if (!target) return;
      target.styles.forEach(({ option }) => {
        const image = new Image();
        image.src = option.thumbnail;
      });
    },
    [sections]
  );

  const { setActive } = useToneSectionPrefetch(sectionKeys, handlePrefetch);

  useEffect(() => {
    if (isOpen) {
      sectionKeys.forEach((key) => setActive(key, true));
    }
  }, [isOpen, sectionKeys, setActive]);

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

  const handleStyleClick = (styleId: string, tone: string) => {
    onStyleSelect(styleId, { tone });
    onClose();
  };

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
                  Choose AI Style
                </h2>
                <p id="mobile-drawer-desc" className="text-xs text-white/60 mt-1 max-[360px]:text-[11px]">
                  {totalStyles} styles available • Tap to preview
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

            <div className="relative flex-1 overflow-y-auto px-4 py-6 max-[360px]:px-3">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-900 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-900 to-transparent" />

              <div className="relative space-y-6 pb-8">
                {sections.map((section) => (
                  <div key={section.tone} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {section.definition.icon && (
                            <span className="text-sm" aria-hidden="true">
                              {section.definition.icon}
                            </span>
                          )}
                          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                            {section.definition.label}
                          </h3>
                        </div>
                        <p className="text-xs text-white/50 mt-1">{section.definition.description}</p>
                      </div>
                      {!section.lockedGate?.allowed && section.lockedGate?.reason === 'style_locked' && (
                        <span className="text-[11px] font-semibold text-purple-300">
                          {section.lockedGate.requiredTier
                            ? `${section.lockedGate.requiredTier.toUpperCase()}+`
                            : 'Upgrade'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 max-[360px]:gap-3">
                      {section.styles.map((entry) => {
                        const style = entry.option;
                        const previewState = previews[style.id];
                        const isReady = previewState?.status === 'ready';
                        const gate = entry.gate;
                        const isLocked =
                          Boolean(pendingStyleId && pendingStyleId !== style.id) || !gate.allowed;

                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => handleStyleClick(style.id, section.tone)}
                            disabled={isLocked}
                            data-mobile-style-card
                            className={`
                              flex flex-col gap-3 p-3 rounded-2xl text-left transition-all min-h-[180px]
                              ${
                                entry.isSelected
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
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800">
                              <img
                                src={style.thumbnail}
                                alt={`${style.name} thumbnail`}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                              {entry.isSelected && (
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

                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-semibold text-white line-clamp-1">{style.name}</p>
                              <p className="text-xs text-white/60 line-clamp-2">{style.description}</p>
                              {!gate.allowed && gate.reason === 'style_locked' && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-purple-300 font-semibold">
                                  Locked · {gate.requiredTier ? `${gate.requiredTier.toUpperCase()}+` : 'Upgrade'}
                                </span>
                              )}
                              {isReady && gate.allowed && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-semibold">
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
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
