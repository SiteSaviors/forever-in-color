/**
 * Stock Grid Browser Component
 *
 * Infinite scroll grid for browsing stock library images with:
 * - Responsive masonry-style layout (2-4 columns)
 * - IntersectionObserver-based infinite scroll
 * - Premium loading, empty, and error states
 * - Cursor-based pagination (scalable to millions)
 * - Integrated search and category filtering
 *
 * Performance optimizations:
 * - Lazy image loading (browser-native)
 * - React.memo on child cards prevents unnecessary re-renders
 * - IntersectionObserver fires once per page load
 * - Debounced search (300ms) prevents excessive API calls
 *
 * @see StockImageCard.tsx (grid item)
 * @see stockLibrarySlice.ts (state management)
 * @see stockLibraryApi.ts (API client)
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ImageOff, Loader2, Search } from 'lucide-react';
import { useFounderStore } from '@/store/useFounderStore';
import { useStudioEntitlementState } from '@/store/hooks/studio/useStudioEntitlementState';
import { useStudioFeedback } from '@/hooks/useStudioFeedback';
import StockImageCard from './StockImageCard';
import StockLibrarySkeleton from './StockLibrarySkeleton';

const TIER_ORDER: Record<string, number> = {
  free: 0,
  creator: 1,
  plus: 2,
  pro: 3,
  dev: 4,
};

const isTierSatisfied = (
  current: string | null,
  required: 'free' | 'creator' | 'plus' | 'pro'
) => {
  const currentScore = current ? TIER_ORDER[current] ?? -1 : -1;
  const requiredScore = TIER_ORDER[required] ?? Number.MAX_SAFE_INTEGER;
  return currentScore >= requiredScore;
};

const StockGridBrowser = () => {
  const stockImages = useFounderStore((state) => state.stockImages);
  const stockStatus = useFounderStore((state) => state.stockStatus);
  const stockError = useFounderStore((state) => state.stockError);
  const hasNextPage = useFounderStore((state) => state.hasNextPage);
  const selectedCategory = useFounderStore((state) => state.selectedCategory);
  const searchQuery = useFounderStore((state) => state.searchQuery);
  const appliedStockImageId = useFounderStore((state) => state.appliedStockImageId);
  const accessFilters = useFounderStore((state) => state.accessFilters);
  const orientationFilters = useFounderStore((state) => state.orientationFilters);
  const resetFilters = useFounderStore((state) => state.resetFilters);

  const fetchStockImages = useFounderStore((state) => state.fetchStockImages);
  const fetchNextPage = useFounderStore((state) => state.fetchNextPage);
  const applyStockImage = useFounderStore((state) => state.applyStockImage);
  const clearAppliedStockImage = useFounderStore((state) => state.clearAppliedStockImage);
  const retryFetch = useFounderStore((state) => state.retryFetch);
  const { userTier } = useStudioEntitlementState();
  const { showUpgradeModal } = useStudioFeedback();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initial fetch when category, search, or filters change
  useEffect(() => {
    void fetchStockImages();
  }, [selectedCategory, searchQuery, accessFilters, orientationFilters, fetchStockImages]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || stockStatus === 'loading') {
      return;
    }

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && stockStatus === 'idle') {
            void fetchNextPage();
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '200px', // Trigger 200px before reaching bottom
        threshold: 0.1,
      }
    );

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, stockStatus, fetchNextPage]);

  const handleApplyImage = useCallback(
    (imageId: string) => {
      const image = stockImages.find((img) => img.id === imageId);
      if (!image) return;

      const requiredTier = (image.requiredTier ?? 'free') as 'free' | 'creator' | 'plus' | 'pro';
      const locked =
        requiredTier !== 'free' && !isTierSatisfied(userTier ?? 'free', requiredTier);

      if (locked) {
        const label =
          requiredTier === 'creator'
            ? 'Creator'
            : requiredTier === 'plus'
              ? 'Plus'
              : 'Pro';
        showUpgradeModal({
          title: 'Premium Stock Image',
          description: `Upgrade to ${label} to unlock this premium stock photo and hundreds more.`,
          ctaLabel: `Upgrade to ${label}`,
        });
        return;
      }

      if (appliedStockImageId === imageId) {
        clearAppliedStockImage();
        return;
      }

      applyStockImage(image);
    },
    [stockImages, applyStockImage, appliedStockImageId, clearAppliedStockImage, userTier, showUpgradeModal]
  );

  const filteredImages = stockImages.filter((image) => {
    const requiredTier = (image.requiredTier ?? 'free') as 'free' | 'creator' | 'plus' | 'pro';
    const isPremiumImage = requiredTier !== 'free';
    const accessAllowed = isPremiumImage ? accessFilters.premium : accessFilters.free;
    const orientationAllowed = orientationFilters[image.orientation];
    return accessAllowed && orientationAllowed;
  });

  // Loading state (initial fetch)
  if (stockStatus === 'loading' && stockImages.length === 0) {
    return <StockLibrarySkeleton variant="grid-browser" />;
  }

  // Error state
  if (stockStatus === 'error' && stockError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-semibold text-white">Unable to load images</h3>
          <p className="text-sm text-white/70">{stockError}</p>
        </div>
        <button
          onClick={retryFetch}
          className="mt-2 rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          type="button"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state (no results from fetch)
  if (stockStatus === 'idle' && stockImages.length === 0) {
    const isSearchActive = searchQuery.trim().length > 0;

    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          {isSearchActive ? (
            <Search className="h-10 w-10 text-white/40" />
          ) : (
            <ImageOff className="h-10 w-10 text-white/40" />
          )}
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {isSearchActive ? 'No results found' : 'No images available'}
          </h3>
          <p className="text-sm text-white/70">
            {isSearchActive
              ? `We couldn't find any images matching "${searchQuery}". Try adjusting your search or browse a different category.`
              : 'This category is currently empty. Check back soon for new images.'}
          </p>
        </div>
      </div>
    );
  }

  if (filteredImages.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <ImageOff className="h-10 w-10 text-white/40" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-semibold text-white">No images match your filters</h3>
          <p className="text-sm text-white/70">
            Try turning filters back on or reset them to see all available stock images.
          </p>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-full border border-white/30 px-6 py-2 text-sm font-semibold text-white/80 transition hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Reset filters
        </button>
      </div>
    );
  }

  // Grid view
  return (
    <div className="w-full pb-8">
      {/* Results count */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <p
            className="text-xl font-semibold text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Showing{' '}
            <motion.span
              key={filteredImages.length}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="inline-block"
            >
              {filteredImages.length}
            </motion.span>{' '}
            {filteredImages.length === 1 ? 'Result' : 'Results'}
            {searchQuery && (
              <span className="text-white/60"> for "{searchQuery}"</span>
            )}
          </p>
          <div className="h-px w-32 bg-gradient-to-r from-purple-500/30 via-white/10 to-transparent" />
        </div>
      </div>

      {/* Image Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${searchQuery}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:gap-6"
        >
          {filteredImages.map((image, index) => {
            const requiredTier = (image.requiredTier ?? 'free') as 'free' | 'creator' | 'plus' | 'pro';
            const isLocked =
              requiredTier !== 'free' && !isTierSatisfied(userTier ?? 'free', requiredTier);
            return (
            <StockImageCard
              key={image.id}
              image={image}
              isApplied={appliedStockImageId === image.id}
              isLocked={isLocked}
              onApply={handleApplyImage}
              cardIndex={index}
              gridColumns={4}
            />
          );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Infinite Scroll Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="mt-8 flex items-center justify-center py-8">
          {stockStatus === 'loading' ? (
            <div className="flex items-center gap-3 text-white/60">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading more images...</span>
            </div>
          ) : (
            <div className="h-8 w-32 rounded-full bg-white/5 animate-pulse" />
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasNextPage && stockImages.length > 0 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="rounded-full border border-white/10 bg-white/5 px-6 py-2">
            <p className="text-xs font-medium text-white/60">You've reached the end</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockGridBrowser;
