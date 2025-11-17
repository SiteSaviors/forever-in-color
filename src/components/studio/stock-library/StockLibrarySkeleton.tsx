/**
 * Stock Library Skeleton
 *
 * Loading states for stock library modal views.
 * Provides skeleton placeholders for:
 * 1. Category selector (8 hero cards)
 * 2. Grid browser (infinite scroll grid)
 *
 * Design: Matches actual component dimensions with subtle pulse animation
 */

type StockLibrarySkeletonProps = {
  variant: 'category-selector' | 'grid-browser';
};

const StockLibrarySkeleton = ({ variant }: StockLibrarySkeletonProps) => {
  if (variant === 'category-selector') {
    return <CategorySelectorSkeleton />;
  }

  return <GridBrowserSkeleton />;
};

/**
 * Category Selector Skeleton
 * 8 hero cards in 2×4 grid matching StockCategorySelector layout
 */
const CategorySelectorSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/5"
          >
            {/* Shimmer background */}
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 via-white/5 to-transparent" />

            {/* Text placeholder (centered) */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="h-8 w-32 rounded-lg bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Grid Browser Skeleton
 * Masonry-style grid matching StockImageGrid layout (Phase 4)
 */
const GridBrowserSkeleton = () => {
  return (
    <div className="w-full">
      {/* Grid container */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, index) => {
          // Randomize heights slightly for masonry effect
          const heightVariant = index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]';

          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${heightVariant}`}
            >
              {/* Shimmer background */}
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Loading more indicator (bottom) */}
      <div className="mt-8 flex items-center justify-center">
        <div className="h-10 w-32 rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
  );
};

export default StockLibrarySkeleton;
