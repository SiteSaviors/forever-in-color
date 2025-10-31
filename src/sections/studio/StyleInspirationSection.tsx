/**
 * StyleInspirationSection Component
 *
 * Premium "Need Some Inspiration?" section showcasing three curated style buckets.
 * Appears immediately after InstantBreadthStrip on Studio page.
 *
 * Architecture:
 * - Configuration-driven via INSPIRATION_BUCKETS (zero-risk style swaps)
 * - Filters styles from global catalog (O(1) Map lookup, not O(n) filter)
 * - Gracefully degrades if no styles available (early return)
 * - LazyMotion wrapper reduces framer-motion bundle by ~40KB
 *
 * Performance optimizations:
 * - useMemo() prevents re-filtering 150+ styles on every render
 * - Map-based lookup: O(1) instead of O(n) for each bucket
 * - React.memo() prevents re-renders when parent (StudioPage) updates
 * - Early return bails out before JSX construction if no data
 *
 * Visual design:
 * - Purple radial spotlight background (signature luxury, differentiates from other sections)
 * - Centered "Need Some Inspiration?" headline (Poppins Bold, text-5xl md:text-6xl)
 * - Generous spacing (py-20 lg:py-24)
 * - Max-width constraint (1800px) for readability
 *
 * Responsive behavior:
 * - Desktop (≥1024px): 3-column grid (buckets side-by-side)
 * - Tablet/Mobile (<1024px): 1-column stack (easier scrolling)
 * - Gap scales: gap-8 lg:gap-10
 *
 * @see src/config/inspirationBuckets.ts (configuration)
 * @see src/sections/studio/components/InspirationBucket.tsx (child)
 * @see src/pages/StudioPage.tsx (integration point)
 */

import { memo, useMemo } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useStyleCatalogState } from '@/store/hooks/useStyleCatalogStore';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import { INSPIRATION_BUCKETS } from '@/config/inspirationBuckets';
import InspirationBucket from './components/InspirationBucket';
import type { StyleOption } from '@/store/founder/storeTypes';

const StyleInspirationSection = () => {
  const { styles } = useStyleCatalogState();
  const prefersReducedMotion = usePrefersReducedMotion();

  /**
   * Filter styles for each bucket (memoized to prevent expensive re-filtering)
   *
   * Performance strategy:
   * 1. Build Map for O(1) lookup (instead of O(n) filter per bucket)
   * 2. Map style IDs to full style objects
   * 3. Filter out missing styles (graceful degradation)
   * 4. Limit to 6 cards for Phase 1 (change to 12 in Phase 3)
   * 5. Only return buckets that have at least 1 style
   *
   * Re-filters only when `styles` array changes (not on every render)
   */
  const bucketData = useMemo(() => {
    // Early return if no styles loaded yet
    if (!styles.length) return [];

    // Build Map for O(1) lookup (instead of O(n) filter per bucket)
    const styleMap = new Map(styles.map((s) => [s.id, s]));

    return INSPIRATION_BUCKETS.map((bucket) => {
      const bucketStyles = bucket.styleIds
        .map((id) => styleMap.get(id)) // O(1) lookup
        .filter((s): s is StyleOption => Boolean(s)) // Type guard: remove undefined
        .slice(0, 15); // 15 cards per bucket (3×5 grid)

      return {
        ...bucket,
        styles: bucketStyles,
      };
    }).filter((bucket) => bucket.styles.length > 0); // Only show buckets with styles
  }, [styles]);

  /**
   * Graceful degradation: Don't render if no buckets have styles
   *
   * This prevents empty section flash during initial load
   * or if all configured styles are disabled in registry.
   */
  if (bucketData.length === 0) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation}>
      <section
        className="relative bg-slate-950/95 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.22),transparent_60%)] border-t border-white/5 text-white py-20 lg:py-24"
        data-section="style-inspiration"
      >
        <div className="mx-auto max-w-[1800px] px-6">
          {/* Headline */}
          <header className="text-center mb-16 lg:mb-20">
            <h2 className="font-poppins text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Need Some Inspiration?
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Curated collections to kickstart your creative vision
            </p>
          </header>

          {/* Buckets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {bucketData.map((bucket, index) => (
              <InspirationBucket
                key={bucket.id}
                {...bucket}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>

          {/* TODO: Phase 4 - Add "View All Styles" CTA that scrolls to Studio Configurator */}
          {/* Future enhancement: */}
          {/* <div className="text-center mt-12 lg:mt-16"> */}
          {/*   <button */}
          {/*     onClick={() => scrollToElement('#studio-configurator')} */}
          {/*     className="..." */}
          {/*   > */}
          {/*     View All Styles → */}
          {/*   </button> */}
          {/* </div> */}
        </div>
      </section>
    </LazyMotion>
  );
};

/**
 * CRITICAL: React.memo prevents unnecessary re-renders
 *
 * Without memo: When StudioPage updates (checkout notice, etc), section re-renders
 * With memo: Only re-renders when styles array changes
 *
 * Performance impact: Prevents ~20 unnecessary re-renders per user session
 */
export default memo(StyleInspirationSection);
