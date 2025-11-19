/**
 * Stock Category Selector
 *
 * Premium hero card grid for category selection.
 * Matches reference design exactly: 8 cards in 2×4 grid.
 *
 * Cards:
 * 1. Browse All (collage)
 * 2-8. Category cards (Nature, Animals, People, Food, Abstract, Sci-Fi, Classic)
 *
 * Design:
 * - Full-bleed background images
 * - Serif text overlays with shadows
 * - Glassmorphism borders
 * - Hover scale animation (1.02)
 * - Premium transitions
 */

import { useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useStockLibraryFilters, useStockLibraryModal } from '@/store/hooks/useStockLibraryStore';
import { STOCK_CATEGORIES, type StockCategory } from '@/store/founder/storeTypes';
import { trackStockCategorySelected } from '@/utils/stockLibraryTelemetry';

type CategoryCard = {
  id: StockCategory;
  name: string;
  description: string;
  imageSrc: string;
};

const StockCategorySelector = () => {
  const { setCategory } = useStockLibraryFilters();
  const { setView } = useStockLibraryModal();

  // Build category cards
  const categories = useMemo<CategoryCard[]>(() => {
    // First card: Browse All
    const browseAll: CategoryCard = {
      id: 'all',
      name: 'Browse\nAll',
      description: 'Explore our entire collection',
      imageSrc: '/stock-categories/all.webp',
    };

    // Remaining 7 category cards
    const categoryCards: CategoryCard[] = Object.values(STOCK_CATEGORIES).map((cat) => ({
      id: cat.id,
      name: cat.name.replace(' & ', '\n& '),
      description: cat.description,
      imageSrc: `/stock-categories/${cat.id}.webp`,
    }));

    return [browseAll, ...categoryCards];
  }, []);

  const handleCategoryClick = (categoryId: StockCategory) => {
    // Track selection
    trackStockCategorySelected({
      category: categoryId,
      source: 'category_card',
    });

    // Set category in store
    setCategory(categoryId);

    // Transition to grid browser
    setView('grid-browser');
  };

  return (
    <div className="flex items-center justify-center min-h-full">
      <LayoutGroup>
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              layout
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.3,
                ease: 'easeOut',
              }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2, ease: 'easeOut' },
              }}
              whileTap={{
                scale: 0.98,
                transition: { duration: 0.1 },
              }}
              className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-lg transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img
                  src={category.imageSrc}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

              {/* Text overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <h3
                  className="whitespace-pre-line text-center text-3xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:text-4xl"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {category.name}
                </h3>
              </div>

              {/* Hover glow effect */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
};

export default StockCategorySelector;
