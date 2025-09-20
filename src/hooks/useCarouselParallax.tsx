
import { useRef } from 'react';
import { useScrollParallax } from '@/components/product/hooks/useScrollParallax';

export const useCarouselParallax = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollY = useScrollParallax();

  const getParallaxOffset = () => {
    if (!sectionRef.current) return { background: 0, cards: 0, header: 0 };
    
    const rect = sectionRef.current.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;
    
    // Only apply parallax when element is in viewport
    if (rect.bottom < 0 || rect.top > windowHeight) {
      return { background: 0, cards: 0, header: 0 };
    }
    
    const scrollProgress = (scrollY - elementTop + windowHeight) / (elementHeight + windowHeight);
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
    
    return {
      background: (clampedProgress - 0.5) * 50,
      cards: (clampedProgress - 0.5) * 25,
      header: (clampedProgress - 0.5) * 15,
    };
  };

  return { sectionRef, parallaxOffset: getParallaxOffset() };
};
