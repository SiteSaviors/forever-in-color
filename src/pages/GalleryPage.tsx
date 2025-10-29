import {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type TransitionEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Heart, Trash2, ArrowLeft, Filter, Sparkles, Expand } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthModal } from '@/store/useAuthModal';
import { useEntitlementsState } from '@/store/hooks/useEntitlementsStore';
import { useSessionState } from '@/store/hooks/useSessionStore';
import { useStudioFeedback } from '@/hooks/useStudioFeedback';
import {
  fetchGalleryItems,
  deleteGalleryItem,
  toggleGalleryFavorite,
  incrementGalleryDownload,
  getGalleryDownloadUrl,
  type GalleryItem,
  type GalleryFilters,
} from '@/utils/galleryApi';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import './GalleryPage.css';

type GalleryActionButtonProps = {
  onClick: () => void;
  icon: typeof Download;
  label: string;
  disabled?: boolean;
  active?: boolean;
  destructive?: boolean;
  activeClass?: string;
};

const GalleryActionButton = ({
  onClick,
  icon: Icon,
  label,
  disabled,
  active,
  destructive,
  activeClass,
}: GalleryActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      'p-2 rounded-full transition-colors flex items-center justify-center text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo disabled:opacity-40 disabled:cursor-not-allowed',
      destructive ? 'hover:bg-red-500/20 text-white/80 hover:text-red-200' : 'hover:bg-white/20',
      active && (activeClass ?? 'bg-red-500/25 text-red-200'),
      !active && !destructive && 'bg-white/10',
      destructive && 'bg-white/10'
    )}
    title={label}
    aria-label={label}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const GalleryPage = () => {
  const navigate = useNavigate();
  const { accessToken: sessionAccessToken } = useSessionState();
  const { entitlements } = useEntitlementsState();
  const { showToast, showUpgradeModal, renderFeedback } = useStudioFeedback();
  const openAuthModal = useAuthModal((state) => state.openModal);

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<GalleryFilters>({
    sort: 'newest',
    limit: 50,
    offset: 0,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filtersMounted, setFiltersMounted] = useState(false);
  const [filtersPanelState, setFiltersPanelState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const filtersWrapperRef = useRef<HTMLDivElement>(null);
  const filtersContentRef = useRef<HTMLDivElement>(null);
  const [filtersHeight, setFiltersHeight] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [lightboxState, setLightboxState] = useState<{ item: GalleryItem | null; mode: 'open' | 'closing' }>({
    item: null,
    mode: 'open',
  });
  const lightboxTimerRef = useRef<number | null>(null);
  const [authPrompted, setAuthPrompted] = useState(false);
  const LIGHTBOX_ANIMATION_MS = 220;

  // Check if user has access to clean (watermark-free) downloads
  const requiresWatermark = entitlements.requiresWatermark;

  // Fetch gallery items
  const loadGallery = useCallback(async () => {
    setLoading(true);
    setError(null);

    const accessToken = sessionAccessToken || null;
    if (!accessToken) {
      if (!authPrompted) {
        setAuthPrompted(true);
        openAuthModal('signup');
      }
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const result = await fetchGalleryItems(filters, accessToken);

    if ('error' in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setItems(result.items);
    setTotal(result.total);
    setLoading(false);
  }, [authPrompted, filters, openAuthModal, sessionAccessToken]);

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setFiltersMounted(showFilters);
      setFiltersPanelState(showFilters ? 'open' : 'closed');
      return;
    }

    if (showFilters) {
      setFiltersMounted(true);
    } else {
      setFiltersPanelState((current) => (current === 'closed' ? current : 'closing'));
    }
  }, [prefersReducedMotion, showFilters]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    if (!filtersMounted || !showFilters) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setFiltersPanelState((current) => {
        if (current === 'open' || current === 'opening') {
          return current;
        }
        return 'opening';
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [filtersMounted, prefersReducedMotion, showFilters]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    if (!filtersMounted) return;
    const contentNode = filtersContentRef.current;
    if (!contentNode) return;

    const measure = () => {
      setFiltersHeight(contentNode.offsetHeight);
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(contentNode);
    return () => observer.disconnect();
  }, [filtersMounted]);

  const handleFiltersTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'max-height') {
      return;
    }
    if (filtersPanelState === 'opening') {
      setFiltersPanelState('open');
    } else if (filtersPanelState === 'closing') {
      setFiltersPanelState('closed');
      setFiltersMounted(false);
    }
  };

  const openLightbox = useCallback((item: GalleryItem) => {
    if (lightboxTimerRef.current) {
      window.clearTimeout(lightboxTimerRef.current);
      lightboxTimerRef.current = null;
    }
    setLightboxState({ item, mode: 'open' });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxState((current) => {
      if (!current.item || current.mode === 'closing') {
        return current;
      }
      return { ...current, mode: 'closing' };
    });
  }, []);

  useEffect(() => {
    if (lightboxState.mode !== 'closing' || !lightboxState.item) {
      return;
    }

    lightboxTimerRef.current = window.setTimeout(() => {
      setLightboxState({ item: null, mode: 'open' });
      lightboxTimerRef.current = null;
    }, prefersReducedMotion ? 0 : LIGHTBOX_ANIMATION_MS);

    return () => {
      if (lightboxTimerRef.current) {
        window.clearTimeout(lightboxTimerRef.current);
        lightboxTimerRef.current = null;
      }
    };
  }, [LIGHTBOX_ANIMATION_MS, lightboxState.item, lightboxState.mode, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (lightboxTimerRef.current) {
        window.clearTimeout(lightboxTimerRef.current);
      }
    };
  }, []);

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this from your gallery?')) {
      return;
    }

    const accessToken = sessionAccessToken || null;
    const result = await deleteGalleryItem(itemId, accessToken);

    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setTotal((prev) => prev - 1);
      showToast({
        title: 'Removed from gallery',
        description: 'The preview has been deleted.',
        variant: 'success',
      });
    } else {
      showToast({
        title: 'Delete failed',
        description: result.error ?? 'Unable to delete this gallery item.',
        variant: 'error',
      });
    }
  };

  const handleToggleFavorite = async (item: GalleryItem) => {
    const accessToken = sessionAccessToken || null;
    const newFavoriteState = !item.isFavorited;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isFavorited: newFavoriteState } : i))
    );

    const result = await toggleGalleryFavorite(item.id, newFavoriteState, accessToken);

    if (!result.success) {
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isFavorited: !newFavoriteState } : i))
      );
      showToast({
        title: 'Update failed',
        description: result.error ?? 'Unable to update favorite status.',
        variant: 'error',
      });
    }
  };

  const handleDownload = async (item: GalleryItem) => {
    if (requiresWatermark) {
      showUpgradeModal({
        title: 'Unlock Clean Downloads',
        description: 'Upgrade your Wondertone plan to download watermark-free canvases.',
        ctaLabel: 'View Plans',
        onCta: () => {
          window.open('/pricing', '_self');
        },
        secondaryLabel: 'Maybe later',
      });
    }

    // Track download
    const accessToken = sessionAccessToken || null;
    await incrementGalleryDownload(item.id, accessToken);

    let downloadUrl: string;
    try {
      downloadUrl = await getGalleryDownloadUrl(item, requiresWatermark, accessToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to prepare download.';
      showToast({
        title: 'Download failed',
        description: message,
        variant: 'error',
      });
      return;
    }

    // Trigger download
    try {
      const response = await fetch(downloadUrl, {
        // Signed URLs should not require credentials, but ensure consistent caching behavior
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch download (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `wondertone-${item.styleName}-${item.orientation}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download preview.';
      showToast({
        title: 'Download failed',
        description: message,
        variant: 'error',
      });
      return;
    }

    // Update local state
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, downloadCount: i.downloadCount + 1, lastDownloadedAt: new Date().toISOString() }
          : i
      )
    );
  };

  const handleReorder = (_item: GalleryItem) => {
    // TODO: Pre-fill studio configurator with this preview's settings
    // For now, just navigate to create
    navigate('/create');
  };

  const orientationLabels: Record<string, string> = {
    horizontal: 'Landscape',
    vertical: 'Portrait',
    square: 'Square',
  };
  const activeLightbox = lightboxState.item;
  const lightboxDataState = lightboxState.mode === 'closing' ? 'closing' : 'open';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Studio</span>
            </button>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-indigo" />
              <h1 className="text-xl font-semibold text-white">My Gallery</h1>
            </div>
            <Badge variant="glass">{total} saved</Badge>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      {(filtersMounted || filtersPanelState === 'closing' || (prefersReducedMotion && showFilters)) && (
        <div
          ref={filtersWrapperRef}
          className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm gallery-filters-panel"
          data-state={filtersPanelState}
          data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
          style={
            prefersReducedMotion
              ? undefined
              : ({ '--filters-height': `${filtersHeight}px` } as CSSProperties)
          }
          onTransitionEnd={prefersReducedMotion ? undefined : handleFiltersTransitionEnd}
        >
          <div ref={filtersContentRef} className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-white/60">Sort:</label>
                <select
                  value={filters.sort || 'newest'}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value as 'newest' | 'oldest' | 'downloads', offset: 0 })}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="downloads">Most Downloaded</option>
                </select>
              </div>

              {/* Orientation */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-white/60">Orientation:</label>
                <select
                  value={filters.orientation || 'all'}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      orientation: e.target.value === 'all' ? undefined : (e.target.value as 'horizontal' | 'vertical' | 'square'),
                      offset: 0,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                >
                  <option value="all">All</option>
                  <option value="horizontal">Landscape</option>
                  <option value="vertical">Portrait</option>
                  <option value="square">Square</option>
                </select>
              </div>

              {/* Favorites Only */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.favorites || false}
                  onChange={(e) => setFilters({ ...filters, favorites: e.target.checked, offset: 0 })}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-brand-indigo focus:ring-brand-indigo"
                />
                <span className="text-sm text-white/80">Favorites Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand-indigo/30 border-t-brand-indigo rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading your gallery...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-300">{error}</p>
            <Button onClick={() => loadGallery()} variant="primary" className="mt-4">
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No saved previews yet</h2>
            <p className="text-white/60 mb-6">
              Start creating AI art and save your favorites to your gallery
            </p>
            <Button onClick={() => navigate('/create')} variant="primary">
              Create Art
            </Button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={clsx(
                  'group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-brand-indigo/50 transition-all',
                  !prefersReducedMotion && 'gallery-card-animate'
                )}
                data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
                style={
                  prefersReducedMotion
                    ? undefined
                    : ({ animationDelay: `${Math.min(index, 6) * 40}ms` } as CSSProperties)
                }
              >
                {/* Preview Image */}
                <div className="aspect-square relative overflow-hidden">
                  <button
                    onClick={() => openLightbox(item)}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/70 text-white/80 hover:text-white hover:bg-slate-900/90 transition-colors"
                    title="Expand preview"
                    aria-label="Expand preview"
                  >
                    <Expand className="w-4 h-4" />
                  </button>
                  <img
                    src={item.displayUrl}
                    alt={item.styleName}
                    className="w-full h-full object-cover"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <GalleryActionButton
                        onClick={() => handleDownload(item)}
                        icon={Download}
                        label="Download"
                        disabled={requiresWatermark}
                      />
                      <GalleryActionButton
                        onClick={() => handleToggleFavorite(item)}
                        icon={Heart}
                        label={item.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                        active={item.isFavorited}
                        activeClass="bg-red-500/25 text-red-200"
                      />
                      <GalleryActionButton
                        onClick={() => handleDelete(item.id)}
                        icon={Trash2}
                        label="Delete"
                        destructive
                      />
                    </div>
                  </div>

                  {/* Favorite Badge */}
                  {item.isFavorited && (
                    <div className="absolute top-3 right-3">
                      <Heart className="w-5 h-5 text-red-400 fill-current drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-medium text-white truncate">{item.styleName}</h3>
                    <Badge variant="brand" className="px-2 py-1 text-[10px] uppercase tracking-wide bg-white/10 text-white/70">
                      {orientationLabels[item.orientation]}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleDownload(item)}
                      className="w-full rounded-full px-6 py-3 text-sm font-semibold bg-gradient-cta text-white shadow-glow-purple hover:shadow-glow-purple transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Image
                    </button>
                    <button
                      onClick={() => handleReorder(item)}
                      className="w-full px-4 py-2 rounded-lg bg-brand-indigo/10 hover:bg-brand-indigo/20 text-brand-indigo font-medium transition-colors text-sm"
                    >
                      Re-order Canvas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {renderFeedback()}

      {activeLightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur gallery-lightbox-overlay"
          data-state={lightboxDataState}
          data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
        >
          <div
            className="absolute inset-0"
            onClick={closeLightbox}
            aria-hidden="true"
          />
          <div
            className="relative z-[101] w-[92vw] max-w-4xl bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden gallery-lightbox-content"
            data-state={lightboxDataState}
            data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close preview"
            >
              <span className="text-lg leading-none">×</span>
            </button>
            <img
              src={requiresWatermark ? activeLightbox.displayUrl : activeLightbox.imageUrl}
              alt={activeLightbox.styleName}
              className="w-full h-auto object-contain max-h-[70vh] bg-slate-900"
            />
            <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-white font-semibold">{activeLightbox.styleName}</p>
                <p className="text-white/60 text-sm">{orientationLabels[activeLightbox.orientation]}</p>
              </div>
              <Button
                onClick={() => {
                  void handleDownload(activeLightbox);
                }}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
