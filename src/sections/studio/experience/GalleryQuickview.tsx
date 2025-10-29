import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { useGalleryQuickview, useGalleryQuickviewSelection, useStudioPreviewState } from '@/store/hooks/studio';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import { trackGalleryQuickviewAnimationComplete, trackGalleryQuickviewScroll } from '@/utils/galleryQuickviewTelemetry';

const ORIENTATION_LABEL: Record<'square' | 'horizontal' | 'vertical', string> = {
  square: 'Square',
  horizontal: 'Landscape',
  vertical: 'Portrait',
};

const PLACEHOLDER_COUNT = 5;

const SkeletonCard = () => (
  <div className="flex w-[120px] flex-col gap-3 shrink-0 md:w-[110px] sm:w-[96px]">
    <div className="h-[98px] w-full rounded-2xl bg-white/5 animate-pulse md:h-[92px] sm:h-[84px]" />
    <div className="h-3 w-[80%] rounded-full bg-white/5 animate-pulse" />
  </div>
);

const EmptyState = () => (
  <div className="rounded-3xl border border-white/10 bg-white/5/10 px-6 py-8 text-center text-white/80 backdrop-blur">
    <p className="text-xs uppercase tracking-[0.38em] text-white/50">Gallery Quickview</p>
    <p className="mt-2 text-sm text-white/70">Save your favorite styles to see them here.</p>
  </div>
);

type PendingState = {
  id: string;
  startedAt: number;
};

const GalleryQuickview = () => {
  const { items, loading, error, ready, requiresWatermark, refresh } = useGalleryQuickview();
  const loadGalleryItem = useGalleryQuickviewSelection();
  const { currentStyleId, preview } = useStudioPreviewState();
  const prefersReducedMotion = useReducedMotion();

  const [pending, setPending] = useState<PendingState | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showStartFade, setShowStartFade] = useState(false);
  const [showEndFade, setShowEndFade] = useState(false);
  const [lastTrackedScrollIndex, setLastTrackedScrollIndex] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const firstItemRef = useRef<string | null>(null);

  const hasItems = ready && items.length > 0;

  useEffect(() => {
    if (!hasItems) return;
    const firstId = items[0]?.id ?? null;
    if (firstId && firstId !== firstItemRef.current) {
      firstItemRef.current = firstId;
      if (!prefersReducedMotion) {
        setHighlightId(firstId);
        const timeout = window.setTimeout(() => setHighlightId(null), 1200);
        return () => window.clearTimeout(timeout);
      }
    }
    return undefined;
  }, [items, hasItems, prefersReducedMotion]);

  useEffect(() => {
    if (!highlightId) return;
    trackGalleryQuickviewAnimationComplete(highlightId);
  }, [highlightId]);

  const updateScrollHints = () => {
    const container = listRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const canScroll = scrollWidth > clientWidth + 1;
    setShowStartFade(canScroll && scrollLeft > 4);
    setShowEndFade(canScroll && scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollHints();
  }, [items.length, loading]);

  useEffect(() => {
    const handleExternalRefresh = () => {
      refresh();
    };
    window.addEventListener('gallery-quickview-refresh', handleExternalRefresh);
    return () => window.removeEventListener('gallery-quickview-refresh', handleExternalRefresh);
  }, [refresh]);

  const handleScroll = () => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = window.requestAnimationFrame(() => {
      updateScrollHints();
      const container = listRef.current;
      if (!container) return;
      const firstChild = container.querySelector<HTMLElement>('[data-quickview-item]');
      if (!firstChild) return;
      const cardWidth = firstChild.getBoundingClientRect().width || 1;
      const lastVisible = Math.min(
        items.length - 1,
        Math.floor((container.scrollLeft + container.clientWidth) / cardWidth) - 1
      );
      if (lastVisible !== lastTrackedScrollIndex) {
        setLastTrackedScrollIndex(lastVisible);
        trackGalleryQuickviewScroll(lastVisible);
      }
    });
  };

  useEffect(() => () => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }
  }, []);

  const activePreviewUrl = preview?.data?.previewUrl ?? null;

  const handleSelect = async (item: GalleryQuickviewItem) => {
    if (pending) return;
    setPending({ id: item.id, startedAt: Date.now() });
    try {
      await loadGalleryItem(item, requiresWatermark, item.position);
    } catch (error) {
      console.error('[GalleryQuickview] Failed to load gallery item', error);
    } finally {
      setPending(null);
    }
  };

  const sectionClass = clsx(
    'relative mt-8 w-full max-w-[720px] mx-auto',
    (!hasItems && !loading) && 'pointer-events-none'
  );

  if (error) {
    return null;
  }

  if (!loading && !ready && !items.length) {
    return null;
  }

  return (
    <section className={sectionClass} aria-label="Gallery Quickview">
      <div className="mb-3 flex items-center justify-between text-white/70">
        <p className="text-xs uppercase tracking-[0.32em] text-white/45">Recent Gallery Saves</p>
        {hasItems && (
          <button
            type="button"
            onClick={() => refresh()}
            className="text-[11px] font-semibold text-white/50 transition hover:text-white/80"
          >
            Refresh
          </button>
        )}
      </div>

      {loading && !hasItems && (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {!loading && ready && !items.length && <EmptyState />}

      {hasItems && (
        <div className="relative">
          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-900 to-transparent transition-opacity duration-200',
              showStartFade ? 'opacity-100' : 'opacity-0'
            )}
          />
          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-900 to-transparent transition-opacity duration-200',
              showEndFade ? 'opacity-100' : 'opacity-0'
            )}
          />
          <LayoutGroup>
            <div
              ref={listRef}
              className={clsx(
                'flex gap-4 overflow-x-auto scroll-smooth pb-1 pl-2 pr-2',
                'snap-x snap-mandatory scrollbar-hide',
                'min-w-0' // Prevent flex item from expanding parent
              )}
              onScroll={handleScroll}
              role="list"
            >
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const isActive =
                    currentStyleId === item.styleId &&
                    (!activePreviewUrl || activePreviewUrl === item.displayUrl || activePreviewUrl === item.imageUrl);
                  const isPending = pending?.id === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      data-quickview-item
                      type="button"
                      layout
                      layoutId={item.id}
                      initial={highlightId === item.id ? { opacity: 0, y: -32, scale: 0.92 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 32 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className={clsx(
                        'group relative flex w-[112px] shrink-0 flex-col gap-2 rounded-3xl border border-transparent bg-white/[0.02] p-2 text-left transition',
                        'hover:border-white/20 hover:bg-white/[0.06]',
                        'md:w-[104px] sm:w-[92px]',
                        isActive && 'border-purple-400/70 bg-purple-500/10 shadow-glow-purple/30',
                        isPending && 'pointer-events-none opacity-70'
                      )}
                      aria-label={`Load saved art "${item.styleName}", ${ORIENTATION_LABEL[item.orientation]} orientation`}
                      aria-pressed={isActive}
                      onClick={() => handleSelect(item)}
                    >
                      <div className="relative">
                        <motion.div
                          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                          layoutId={`${item.id}-preview`}
                        >
                          <img
                            src={item.thumbnailUrl ?? item.imageUrl}
                            alt={item.styleName}
                            className="aspect-square w-full select-none object-cover"
                            draggable={false}
                          />
                        </motion.div>
                        {isPending && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
                          </div>
                        )}
                      </div>
                      <div className="min-h-[32px] text-center">
                        <p className="mx-auto line-clamp-2 text-xs font-semibold text-white/80 group-hover:text-white">
                          {item.styleName}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </LayoutGroup>

          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-900 to-transparent transition-opacity duration-200',
              showStartFade ? 'opacity-100' : 'opacity-0'
            )}
          />
          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-900 to-transparent transition-opacity duration-200',
              showEndFade ? 'opacity-100' : 'opacity-0'
            )}
          />
        </div>
      )}
    </section>
  );
};

export default GalleryQuickview;
