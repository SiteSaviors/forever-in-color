import { useEffect, useState, RefObject } from 'react';

/**
 * Hook to reveal element on scroll using Intersection Observer
 * Returns true when element first comes into view, stays true afterward
 *
 * @param elementRef - Reference to the element to observe
 * @param threshold - Intersection ratio threshold (0.0 to 1.0), default 0.2
 * @param rootMargin - Margin around root (e.g., '0px 0px -10% 0px')
 * @returns boolean - true when element has been revealed
 *
 * @example
 * ```tsx
 * const iconRef = useRef<HTMLSpanElement>(null);
 * const isRevealed = useScrollReveal(iconRef, 0.2);
 *
 * return (
 *   <span ref={iconRef} className={clsx(isRevealed && 'animate-scale-in')}>
 *     🛡️
 *   </span>
 * );
 * ```
 */
export function useScrollReveal(
  elementRef: RefObject<HTMLElement>,
  threshold = 0.2,
  rootMargin = '0px 0px -10% 0px'
): boolean {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Guard for SSR/environments without IntersectionObserver
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback: reveal immediately in unsupported environments
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isRevealed) {
          setIsRevealed(true);
          // Once revealed, disconnect observer (performance optimization)
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, rootMargin, isRevealed]);

  return isRevealed;
}
