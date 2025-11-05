import { memo, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { SpotlightStory } from '@/config/socialProofContent';

type SpotlightCardProps = {
  story: SpotlightStory;
  prefersReducedMotion: boolean;
  onCtaClick?: (story: SpotlightStory) => void;
};

const BADGE_LABEL: Record<SpotlightStory['product'], string> = {
  digital: 'Creator Pro',
  canvas: 'Canvas Print',
  hybrid: 'Creator + Canvas',
};

const BADGE_ICON: Record<SpotlightStory['product'], string> = {
  digital: '📱',
  canvas: '🖼️',
  hybrid: '⚡️',
};

const SpotlightCard = ({ story, prefersReducedMotion, onCtaClick }: SpotlightCardProps) => {
  const [beforeWeight, setBeforeWeight] = useState(0); // 0 → fully after, 1 → fully before
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = useCallback(() => {
    setBeforeWeight((prev) => (prev > 0.9 ? 0 : 1));
  }, []);

  const handlePointerEnter = () => {
    if (!prefersReducedMotion) {
      setBeforeWeight(1);
    }
  };

  const handlePointerLeave = () => {
    if (!prefersReducedMotion) {
      setBeforeWeight(0);
    }
  };

  const beforeWidthPercent = Math.min(100, Math.max(0, beforeWeight * 100));
  const toggleLabel = beforeWidthPercent > 12 ? 'Show After' : 'Show Before';

  useEffect(() => {
    if (!prefersReducedMotion) {
      setIsAnimating(true);
      const id = window.setTimeout(() => setIsAnimating(false), 600);
      return () => window.clearTimeout(id);
    }
    setIsAnimating(false);
  }, [beforeWeight, prefersReducedMotion]);

  return (
    <motion.article
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md"
      layout
    >
      <div className="flex items-center gap-2 px-6 pt-6 pb-4 text-xs uppercase tracking-[0.3em] text-white/50">
        <span aria-hidden="true">{BADGE_ICON[story.product]}</span>
        <span>{BADGE_LABEL[story.product]}</span>
      </div>

      <div
        className="relative mx-6 mb-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900"
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onFocus={handlePointerEnter}
        onBlur={handlePointerLeave}
      >
        {/* After image */}
        <img
          src={story.afterImage}
          alt={`${story.title} after transformation`}
          loading="lazy"
          className="h-full w-full object-cover"
        />

        {/* Before overlay */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden border-r border-white/15 shadow-[8px_0_20px_rgba(0,0,0,0.35)] transition-[width] duration-500"
          style={{
            width: beforeWidthPercent === 0 ? '0%' : `${beforeWidthPercent}%`,
            borderRightWidth: beforeWidthPercent >= 99.9 ? 0 : undefined,
          }}
          aria-hidden="true"
        >
          <img
            src={story.beforeImage}
            alt={beforeWidthPercent > 0 ? `${story.title} original upload` : ''}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {beforeWidthPercent > 0 && !prefersReducedMotion && (
            <div
              className={`absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-amber-200/80 via-amber-200/20 to-transparent blur-lg transition-opacity duration-500 ${
                isAnimating ? 'opacity-70' : 'opacity-0'
              }`}
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
        >
          {toggleLabel}
        </button>
      </div>

      <div className="flex flex-col gap-2 px-6 pb-5">
        <p className="text-lg font-semibold text-white">{story.quote}</p>
        {story.metric ? (
          <p className="text-sm font-medium text-amber-300/90">{story.metric}</p>
        ) : null}
        <p className="text-sm text-white/60">— {story.author}</p>
      </div>

      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={() => onCtaClick?.(story)}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-amber-300/60 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
        >
          <span>Preview this style</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </motion.article>
  );
};

export default memo(SpotlightCard);
