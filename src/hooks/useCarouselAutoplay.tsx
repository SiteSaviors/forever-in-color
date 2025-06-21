
import { useState, useEffect } from 'react';
import { artStyles } from '@/data/artStyles';

export const useCarouselAutoplay = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hasInitialRotated, setHasInitialRotated] = useState(false);

  // Initial auto-rotate on load to showcase interaction
  useEffect(() => {
    if (!hasInitialRotated) {
      const initialRotateTimeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % artStyles.length);
        setHasInitialRotated(true);
      }, 4000);

      return () => clearTimeout(initialRotateTimeout);
    }
  }, [hasInitialRotated]);

  // Auto-play functionality with smoother timing
  useEffect(() => {
    if (!isAutoPlaying || !hasInitialRotated) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artStyles.length);
    }, 4000); // Slightly longer for premium feel

    return () => clearInterval(interval);
  }, [isAutoPlaying, hasInitialRotated]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + artStyles.length) % artStyles.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % artStyles.length);
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return {
    currentIndex,
    handlePrevious,
    handleNext,
    handleIndicatorClick
  };
};
