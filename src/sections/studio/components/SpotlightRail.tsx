import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SpotlightStory } from '@/config/socialProofContent';
import { SPOTLIGHTS } from '@/config/socialProofContent';
import useMediaQuery from '@/hooks/useMediaQuery';
import SpotlightCard from './SpotlightCard';
import { trackSocialProofEvent } from '@/utils/telemetry';

type SpotlightRailProps = {
  prefersReducedMotion: boolean;
  onSpotlightCta?: (story: SpotlightStory) => void;
};

const AUTO_ADVANCE_INTERVAL = 6000;

const SpotlightRail = ({ prefersReducedMotion, onSpotlightCta }: SpotlightRailProps) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const cardsPerView = isDesktop ? 3 : 1;
  const totalPages = Math.max(1, Math.ceil(SPOTLIGHTS.length / cardsPerView));

  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<'auto' | 'manual'>('auto');

  const visibleStories = useMemo(() => {
    const start = currentPage * cardsPerView;
    return SPOTLIGHTS.slice(start, start + cardsPerView);
  }, [currentPage, cardsPerView]);

  const goToPage = useCallback(
    (page: number, interaction: 'auto' | 'manual') => {
      if (page === currentPage || page < 0 || page >= totalPages) return;
      setDirection(page > currentPage ? 1 : -1);
      lastInteractionRef.current = interaction;
      setCurrentPage(page);
    },
    [currentPage, totalPages]
  );

  const handleNext = useCallback(
    (interaction: 'auto' | 'manual' = 'manual') => {
      if (totalPages <= 1) return;
      const nextPage = (currentPage + 1) % totalPages;
      goToPage(nextPage, interaction);
    },
    [currentPage, goToPage, totalPages]
  );

  const handlePrev = useCallback(() => {
    if (totalPages <= 1) return;
    const prevPage = currentPage === 0 ? totalPages - 1 : currentPage - 1;
    goToPage(prevPage, 'manual');
  }, [currentPage, goToPage, totalPages]);

  const handleDotSelect = useCallback(
    (index: number) => {
      goToPage(index, 'manual');
    },
    [goToPage]
  );

  useEffect(() => {
    if (totalPages <= 1 || prefersReducedMotion) return;

    if (isPaused) return;

    const id = window.setInterval(() => {
      handleNext('auto');
    }, AUTO_ADVANCE_INTERVAL);

    return () => window.clearInterval(id);
  }, [handleNext, isPaused, prefersReducedMotion, totalPages]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const nextPage = (currentPage + 1) % totalPages;
    const toPreload: SpotlightStory[] = [
      ...SPOTLIGHTS.slice(currentPage * cardsPerView, (currentPage + 1) * cardsPerView),
      ...SPOTLIGHTS.slice(nextPage * cardsPerView, (nextPage + 1) * cardsPerView),
    ];

    toPreload.forEach((story) => {
      [story.beforeImage, story.afterImage].forEach((src) => {
        const image = new Image();
        image.src = src;
      });
    });
  }, [cardsPerView, currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(0);
  }, [cardsPerView]);

  useEffect(() => {
    visibleStories.forEach((story) => {
      trackSocialProofEvent({
        type: 'social_proof_spotlight_interaction',
        storyId: story.id,
        product: story.product,
        interaction: lastInteractionRef.current,
      });
    });
  }, [visibleStories]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrev();
    }
  };

  const animationVariants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir < 0 ? 60 : -60,
      opacity: 0,
    }),
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Creator success spotlight carousel"
    >
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={animationVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: 'easeInOut' }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {visibleStories.map((story) => (
              <SpotlightCard
                key={story.id}
                story={story}
                prefersReducedMotion={prefersReducedMotion}
                onCtaClick={onSpotlightCta}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous spotlight stories"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur-lg transition hover:border-white/35 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next spotlight stories"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur-lg transition hover:border-white/35 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const isActive = index === currentPage;
              return (
                <button
                  key={`spotlight-dot-${index}`}
                  onClick={() => handleDotSelect(index)}
                  aria-label={`Go to spotlight set ${index + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    isActive ? 'bg-amber-300' : 'bg-white/20 hover:bg-white/35'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotlightRail;
