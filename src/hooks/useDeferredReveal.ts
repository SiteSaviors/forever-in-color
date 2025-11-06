import { useEffect, useRef, useState } from 'react';

type UseDeferredRevealOptions = IntersectionObserverInit & {
  /**
   * Disconnect after the first intersection. Defaults to true.
   */
  once?: boolean;
  /**
   * When true, disables the observer entirely (useful for SSR fallbacks).
   */
  disabled?: boolean;
};

const useDeferredReveal = <T extends HTMLElement>(
  options: UseDeferredRevealOptions = {}
): [React.RefObject<T>, boolean] => {
  const { once = true, disabled = false, ...observerOptions } = options;
  const targetRef = useRef<T>(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    if (disabled) {
      setHasRevealed(true);
      return;
    }
    if (hasRevealed && once) {
      return;
    }
    const element = targetRef.current;
    if (!element || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setHasRevealed(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          if (once) {
            observer.disconnect();
            break;
          }
        }
      }
    }, observerOptions);

    observer.observe(element);

    return () => observer.disconnect();
  }, [
    disabled,
    hasRevealed,
    observerOptions.root,
    observerOptions.rootMargin,
    observerOptions.threshold,
    once,
  ]);

  return [targetRef, hasRevealed];
};

export default useDeferredReveal;

