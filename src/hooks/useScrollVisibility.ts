import { useEffect, useState, RefObject } from 'react';

/**
 * Hook to track element visibility using Intersection Observer
 * Returns true when the trigger element is OUT of view (scrolled past)
 *
 * @param triggerRef - Reference to the element to observe
 * @param threshold - Intersection ratio threshold (0.0 to 1.0), default 0.65
 * @returns boolean - true when trigger is out of view
 *
 * @example
 * ```tsx
 * const headerRef = useRef<HTMLDivElement>(null);
 * const showSticky = useScrollVisibility(headerRef, 0.65);
 *
 * return (
 *   <>
 *     <div ref={headerRef}>Header content</div>
 *     <div style={{ opacity: showSticky ? 1 : 0 }}>Sticky element</div>
 *   </>
 * );
 * ```
 */
export function useScrollVisibility(
  triggerRef: RefObject<HTMLElement>,
  threshold = 0.65
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    // Guard for SSR/environments without IntersectionObserver
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Visible when trigger is OUT of view (not intersecting)
        setIsVisible(!entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [triggerRef, threshold]);

  return isVisible;
}
