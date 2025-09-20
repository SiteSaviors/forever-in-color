
import { useCallback, useMemo, useRef } from 'react';
import { debounce } from '@/utils/performanceUtils';

interface UseComponentPerformanceOptions {
  debounceMs?: number;
  enableVirtualization?: boolean;
  maxItemsBeforeVirtualization?: number;
}

export const useComponentPerformance = ({
  debounceMs = 300,
  enableVirtualization = true,
  maxItemsBeforeVirtualization = 20
}: UseComponentPerformanceOptions = {}) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  // Debounced callback factory
  const createDebouncedCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = debounceMs
  ) => {
    return debounce(callback, delay);
  }, [debounceMs]);

  // Memoized render tracking
  const trackRender = useMemo(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component render #${renderCountRef.current}, time since last: ${timeSinceLastRender}ms`);
    }
    
    return {
      renderCount: renderCountRef.current,
      timeSinceLastRender
    };
  }, []);

  // Virtualization decision helper
  const shouldVirtualize = useCallback((itemCount: number) => {
    return enableVirtualization && itemCount > maxItemsBeforeVirtualization;
  }, [enableVirtualization, maxItemsBeforeVirtualization]);

  // Performance metrics
  const getPerformanceMetrics = useCallback(() => ({
    totalRenders: renderCountRef.current,
    averageRenderTime: renderCountRef.current > 0 ? 
      (Date.now() - (lastRenderTimeRef.current - renderCountRef.current * 16)) / renderCountRef.current : 0
  }), []);

  return {
    createDebouncedCallback,
    trackRender,
    shouldVirtualize,
    getPerformanceMetrics
  };
};
