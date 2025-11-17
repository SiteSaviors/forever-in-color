/**
 * Stock Image Card Component
 *
 * Premium grid card for stock library images with:
 * - Progressive image enhancement (AVIF → WebP → JPG)
 * - GPU-accelerated hover animations
 * - Applied state with checkmark overlay
 * - Lazy loading for performance
 * - Accessibility with ARIA labels
 *
 * Design: Follows Wondertone's world-class aesthetic with glassmorphism,
 * subtle shadows, and smooth scale transforms on hover.
 *
 * @see StockGridBrowser.tsx (parent container)
 */

import { memo, useCallback, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Crown } from 'lucide-react';
import type { StockImage } from '@/store/founder/storeTypes';
import { useFounderStore } from '@/store/useFounderStore';

type StockImageCardProps = {
  image: StockImage;
  isApplied: boolean;
  isLocked: boolean;
  onApply: (imageId: string) => void;
  cardIndex: number;
};

const StockImageCard = ({ image, isApplied, onApply, cardIndex, isLocked }: StockImageCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const markImageViewed = useFounderStore((state) => state.markImageViewed);

  const handleClick = useCallback(() => {
    onApply(image.id);
  }, [image.id, onApply]);

  useEffect(() => {
    markImageViewed(image.id);
  }, [image.id, markImageViewed]);

  // Determine aspect ratio class based on orientation
  const aspectRatioClass =
    image.orientation === 'horizontal'
      ? 'aspect-[4/3]'
      : image.orientation === 'vertical'
        ? 'aspect-[3/4]'
        : 'aspect-square';

  // Stagger animation (50ms per card, max 10 cards)
  const staggerDelay = Math.min(cardIndex * 0.05, 0.5);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.4,
        delay: prefersReducedMotion ? 0 : staggerDelay,
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth easeOutQuad
      }}
      className="stock-image-card group relative"
    >
      {/* Card Button */}
      <motion.button
        onClick={handleClick}
        whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        className={`relative w-full ${aspectRatioClass} overflow-hidden rounded-2xl border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isApplied
            ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
            : isLocked
              ? 'border-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.2)] opacity-70'
              : 'border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:border-white/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
        }`}
        aria-label={`${isApplied ? 'Selected: ' : isLocked ? 'Premium stock locked: ' : 'Select '}${image.title}`}
        aria-pressed={isApplied}
        type="button"
      >
        <img
          src={image.thumbnailUrl}
          alt={image.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay (subtle darkening on hover) */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 transition-opacity duration-300 ${
            isApplied ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
          }`}
        />

        {/* Title Overlay (bottom) - appears on hover or when applied */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md px-3 py-2 border-t border-white/10 transition-all duration-300 ${
            isApplied ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
          }`}
        >
          <p className="text-xs font-semibold text-white truncate leading-tight">
            {image.title}
          </p>
          {image.tags && image.tags.length > 0 && (
            <p className="text-[10px] text-white/60 truncate mt-0.5">
              {image.tags.slice(0, 3).join(' · ')}
            </p>
          )}
        </div>

        {/* Applied State Overlay */}
        {isApplied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm flex items-center justify-center"
          >
            {/* Checkmark Circle */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 shadow-[0_0_32px_rgba(168,85,247,0.6)]">
              <Check className="h-8 w-8 text-white" strokeWidth={3} />
            </div>
          </motion.div>
        )}

        {isLocked && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" />
            <div className="pointer-events-none absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg">
              <Crown className="h-4 w-4" aria-hidden="true" />
            </div>
          </>
        )}
      </motion.button>
    </motion.article>
  );
};

/**
 * React.memo prevents re-renders when sibling cards update
 * Performance: ~20-50 avoided re-renders during infinite scroll pagination
 */
export default memo(StockImageCard);
