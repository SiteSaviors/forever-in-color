import { useEffect, useRef, useState } from 'react';

type UseDeferredRenderOptions = IntersectionObserverInit & {
  /**
   * When true (default), the observer disconnects after the first intersection.
   */
  once?: boolean;
};

export const useDeferredRender = (options: UseDeferredRenderOptions = {}): [React.RefObject<HTMLElement>, boolean] => {
  const { once = true, ...observerOptions } = options;
  const targetRef = useRef<HTMLElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady && once) {
      return;
    }
    const element = targetRef.current;
    if (!element || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsReady(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsReady(true);
          if (once) {
            observer.disconnect();
          }
        }
      });
    }, observerOptions);

    observer.observe(element);

    return () => observer.disconnect();
  }, [isReady, once, observerOptions.root, observerOptions.rootMargin, observerOptions.threshold]);

  return [targetRef, isReady];
};

export default useDeferredRender;
