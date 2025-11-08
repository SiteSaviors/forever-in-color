import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { useGalleryQuickview, useGalleryQuickviewSelection, useStudioPreviewState } from '@/store/hooks/studio';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import {
  trackGalleryQuickviewAnimationComplete,
  trackGalleryQuickviewScroll,
  trackGalleryQuickviewDeleteModeChanged,
  trackGalleryQuickviewDeleteRequested,
  trackGalleryQuickviewDeleteResult,
} from '@/utils/galleryQuickviewTelemetry';
import { ENABLE_QUICKVIEW_DELETE_MODE } from '@/config/featureFlags';
import Modal from '@/components/ui/Modal';
import { useStudioExperienceContext } from '@/sections/studio/experience/context';
import { deleteGalleryItem } from '@/utils/galleryApi';
import { deletePreviewCacheEntries } from '@/store/previewCacheStore';
import { useStudioUserState } from '@/store/hooks/studio/useStudioUserState';
import { useFounderStore } from '@/store/useFounderStore';
import { useAuthModal } from '@/store/useAuthModal';
import { Trash2 } from 'lucide-react';

const ORIENTATION_LABEL: Record<'square' | 'horizontal' | 'vertical', string> = {
  square: 'Square',
  horizontal: 'Landscape',
  vertical: 'Portrait',
};

const PLACEHOLDER_COUNT = 5;

const getSurface = (): 'desktop' | 'mobile' => {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(max-width: 1023px)').matches ? 'mobile' : 'desktop';
};

const isCoarsePointer = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
};

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

type DeleteErrorCode = 'auth' | 'network' | 'server' | 'unknown';

const resolveDeleteError = (
  error: unknown
): { message: string; code: DeleteErrorCode; status?: number } => {
  if (error instanceof TypeError) {
    return {
      message: 'Unable to reach Wondertone. Check your connection and try again.',
      code: 'network',
    };
  }

  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status?: unknown }).status);
    if (status === 401) {
      return {
        message: 'Please sign in to manage your gallery.',
        code: 'auth',
        status,
      };
    }
    if (status >= 500) {
      return {
        message: 'Delete failed on our side. Please try again shortly.',
        code: 'server',
        status,
      };
    }
    return {
      message: 'Unable to delete this preview. Please try again.',
      code: 'unknown',
      status,
    };
  }

  const fallbackMessage =
    error instanceof Error ? error.message : 'Unable to delete this preview. Please try again.';
  return {
    message: fallbackMessage,
    code: 'unknown',
  };
};

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

const GalleryQuickviewLegacy = () => {
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

const GalleryQuickviewModern = () => {
  const { items, loading, error, ready, requiresWatermark, refresh, removeItem } = useGalleryQuickview();
  const loadGalleryItem = useGalleryQuickviewSelection();
  const { currentStyleId, preview } = useStudioPreviewState();
  const prefersReducedMotion = useReducedMotion();
  const { showToast } = useStudioExperienceContext();
  const { sessionAccessToken } = useStudioUserState();
  const openAuthModal = useAuthModal((state) => state.openModal);
  const { restoreOriginalImagePreview, resetPreviewToEmptyState, hasUpload } = useFounderStore((state) => ({
    restoreOriginalImagePreview: state.restoreOriginalImagePreview,
    resetPreviewToEmptyState: state.resetPreviewToEmptyState,
    hasUpload: Boolean(state.croppedImage || state.uploadedImage),
  }));

  const [pending, setPending] = useState<PendingState | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showStartFade, setShowStartFade] = useState(false);
  const [showEndFade, setShowEndFade] = useState(false);
  const [lastTrackedScrollIndex, setLastTrackedScrollIndex] = useState<number | null>(null);
  const [surface, setSurface] = useState<'desktop' | 'mobile'>(() => getSurface());
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmItem, setConfirmItem] = useState<GalleryQuickviewItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const longPressRef = useRef<number | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const firstItemRef = useRef<string | null>(null);

  const hasItems = ready && items.length > 0;
  const isMobileSurface = surface === 'mobile';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    const handleSurfaceChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const nextSurface = 'matches' in event ? (event.matches ? 'mobile' : 'desktop') : event.matches ? 'mobile' : 'desktop';
      setSurface(nextSurface);
    };
    handleSurfaceChange(mq);
    mq.addEventListener('change', handleSurfaceChange);
    return () => mq.removeEventListener('change', handleSurfaceChange);
  }, []);

  useEffect(() => {
    if (!hasItems && deleteMode) {
      setDeleteMode(false);
      trackGalleryQuickviewDeleteModeChanged({ active: false, surface });
    }
  }, [hasItems, deleteMode, surface]);

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
    } catch (selectionError) {
      console.error('[GalleryQuickview] Failed to load gallery item', selectionError);
    } finally {
      setPending((current) => (current?.id === item.id ? null : current));
    }
  };

  const setDeleteModeWithTracking = (next: boolean) => {
    setDeleteMode(next);
    trackGalleryQuickviewDeleteModeChanged({ active: next, surface });
  };

  const toggleDeleteMode = () => {
    if (!hasItems) return;
    setDeleteModeWithTracking(!deleteMode);
  };

  const handleDeleteIntent = (event: MouseEvent<HTMLButtonElement>, item: GalleryQuickviewItem) => {
    event.preventDefault();
    event.stopPropagation();
    if (isMobileSurface && !deleteMode) return;
    setConfirmItem(item);
  };

  const handleCloseModal = () => setConfirmItem(null);

  const handleConfirmDelete = async () => {
    if (!confirmItem || deletingId) return;
    const item = confirmItem;

    trackGalleryQuickviewDeleteRequested({
      artId: item.id,
      styleId: item.styleId,
      position: item.position,
      surface,
      hasUpload,
    });

    const startedAt = performance.now();
    const emitFailure = (code: DeleteErrorCode, message: string, status?: number) => {
      showToast({
        title: 'Delete failed',
        description: message,
        variant: 'error',
      });
      trackGalleryQuickviewDeleteResult({
        artId: item.id,
        styleId: item.styleId,
        success: false,
        surface,
        durationMs: performance.now() - startedAt,
        status,
        errorCode: code,
      });
    };

    if (!sessionAccessToken) {
      openAuthModal('signin');
      emitFailure('auth', 'Please sign in to manage your gallery.');
      return;
    }

    if (isOffline()) {
      emitFailure('network', 'You appear to be offline. Reconnect and try again.');
      return;
    }

    setDeletingId(item.id);

    try {
      const response = await deleteGalleryItem(item.id, sessionAccessToken);
      if (!response.success) {
        const error = new Error(response.error || 'Failed to delete gallery item');
        (error as { status?: number }).status = response.status;
        throw error;
      }

      removeItem(item.id);
      deletePreviewCacheEntries(item.styleId);
      const restored = restoreOriginalImagePreview(item.styleId);
      if (!restored) {
        resetPreviewToEmptyState(item.styleId);
      }

      setConfirmItem(null);
      showToast({
        title: 'Removed from gallery',
        description: `${item.styleName} has been deleted.`,
        variant: 'success',
      });

      trackGalleryQuickviewDeleteResult({
        artId: item.id,
        styleId: item.styleId,
        success: true,
        surface,
        durationMs: performance.now() - startedAt,
        status: response.status,
      });
    } catch (rawError) {
      const { message, code, status } = resolveDeleteError(rawError);
      if (code === 'auth') {
        openAuthModal('signin');
      }
      emitFailure(code, message, status);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      deleteMode ||
      !hasItems ||
      !isMobileSurface ||
      !isCoarsePointer() ||
      (event.pointerType && event.pointerType !== 'touch')
    ) {
      return;
    }
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
    }
    longPressRef.current = window.setTimeout(() => {
      setDeleteModeWithTracking(true);
    }, 450);
  };

  const clearLongPress = () => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  useEffect(() => () => clearLongPress(), []);

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
      <div className="mb-3 space-y-1 text-white/70">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs uppercase tracking-[0.32em] text-white/45">Recent Gallery Saves</p>
          <div
            role="toolbar"
            aria-label="Gallery quickview actions"
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => refresh()}
              className="text-[11px] font-semibold text-white/50 transition hover:text-white/80"
            >
              Refresh
            </button>
            {hasItems && (
              <>
                <button
                  type="button"
                  onClick={toggleDeleteMode}
                  className="hidden md:inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] transition hover:border-white/40"
                >
                  {deleteMode ? 'Done' : 'Manage'}
                </button>
                <button
                  type="button"
                  onClick={toggleDeleteMode}
                  className={clsx(
                    'inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] transition hover:border-white/40 md:hidden',
                    deleteMode ? 'bg-white/10 text-white' : 'text-white/70'
                  )}
                >
                  {deleteMode ? 'Done' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>
        <span role="status" aria-live="polite" className="sr-only">
          {deleteMode ? 'Delete mode on' : 'Delete mode off'}
        </span>
      </div>

      {loading && !hasItems && (
        <div className="flex gap-2 overflow-hidden">
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
                'flex gap-1 overflow-x-auto scroll-smooth pb-1 pl-2 pr-2',
                'snap-x snap-mandatory scrollbar-hide',
                'min-w-0'
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
                    <motion.div
                      key={item.id}
                      data-quickview-item
                      layout
                      layoutId={item.id}
                      initial={highlightId === item.id ? { opacity: 0, y: -32, scale: 0.92 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 32 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className={clsx(
                        'group relative flex w-[112px] shrink-0 flex-col gap-2 rounded-3xl border border-transparent bg-white/[0.02] p-2 transition',
                        'hover:border-white/20 hover:bg-white/[0.06]',
                        'md:w-[104px] sm:w-[92px]',
                        isActive && 'border-purple-400/70 bg-purple-500/10 shadow-glow-purple/30',
                        isPending && 'pointer-events-none opacity-70',
                        deleteMode && isMobileSurface && 'quickview-card-wiggle'
                      )}
                      role="listitem"
                      onPointerDown={handlePointerDown}
                      onPointerUp={clearLongPress}
                      onPointerLeave={clearLongPress}
                      onPointerCancel={clearLongPress}
                    >
                      <button
                        type="button"
                        className="flex flex-col gap-2 text-left"
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
                      </button>

                      <button
                        type="button"
                        onClick={(event) => handleDeleteIntent(event, item)}
                        className={clsx(
                          'absolute -right-2.5 -top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-slate-950 text-white/80 shadow-[0_12px_30px_rgba(8,14,32,0.55)] transition',
                          'hover:text-white hover:border-white/70 hover:bg-slate-950/95',
                          isMobileSurface
                            ? deleteMode
                              ? 'opacity-100 pointer-events-auto'
                              : 'opacity-0 pointer-events-none'
                            : deleteMode
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
                        )}
                        aria-label={`Delete saved art "${item.styleName}"`}
                        aria-hidden={isMobileSurface && !deleteMode}
                        tabIndex={isMobileSurface && !deleteMode ? -1 : 0}
                      >
                        <span aria-hidden="true" className="text-lg leading-none">
                          ×
                        </span>
                      </button>
                    </motion.div>
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

      <Modal
        open={Boolean(confirmItem)}
        onOpenChange={(next) => !next && handleCloseModal()}
        overlayClassName="bg-transparent"
        contentClassName="max-w-md border border-white/10 bg-slate-950/95 px-8 py-8 shadow-[0_32px_120px_rgba(8,14,32,0.8)]"
        className="items-center justify-center"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl text-white">
                Delete “{confirmItem?.styleName}”?
              </h3>
              <p className="text-sm text-white/70">
                This removes the preview from Wondertone Studio.
              </p>
            </div>
          </div>

          {confirmItem && (
            <div className="mx-auto max-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2">
              <img
                src={confirmItem.displayUrl ?? confirmItem.imageUrl}
                alt={confirmItem.styleName}
                className="aspect-square w-full rounded-xl object-cover"
              />
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
            This can’t be undone
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
              disabled={Boolean(deletingId)}
            >
              Keep preview
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={Boolean(deletingId)}
              className={clsx(
                'rounded-full bg-gradient-to-r from-rose-500 via-rose-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(244,63,94,0.6)] transition hover:shadow-[0_20px_50px_rgba(244,63,94,0.8)]',
                deletingId && 'opacity-70 cursor-not-allowed'
              )}
            >
              {deletingId ? 'Deleting…' : 'Delete preview'}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

const GalleryQuickview = () => {
  if (!ENABLE_QUICKVIEW_DELETE_MODE) {
    return <GalleryQuickviewLegacy />;
  }

  return <GalleryQuickviewModern />;
};

export default GalleryQuickview;
