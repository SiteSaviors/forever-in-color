import { useEffect, useRef, useCallback } from 'react';
import { debounce } from '@/utils/performanceUtils';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  debounceMs?: number;
  enableVirtualization?: boolean;
  maxItemsBeforeVirtualization?: number;
}

export const usePerformanceMonitor = (
  componentName: string, 
  options: UsePerformanceMonitorOptions = {}
) => {
  const {
    enabled = true,
    debounceMs = 300,
    enableVirtualization = true,
    maxItemsBeforeVirtualization = 20
  } = options;

  const renderStartTime = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (!enabled) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;
    
    const metric: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: now
    };
    
    metricsRef.current.push(metric);
    
    // Log slow renders
    if (renderTime > 16) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCountRef.current}, time since last: ${timeSinceLastRender}ms`);
    }
    
    // Keep only last 50 metrics
    if (metricsRef.current.length > 50) {
      metricsRef.current = metricsRef.current.slice(-50);
    }
  });

  // Debounced callback factory
  const createDebouncedCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = debounceMs
  ) => {
    return debounce(callback, delay);
  }, [debounceMs]);

  // Virtualization decision helper
  const shouldVirtualize = useCallback((itemCount: number) => {
    return enableVirtualization && itemCount > maxItemsBeforeVirtualization;
  }, [enableVirtualization, maxItemsBeforeVirtualization]);

  const getAverageRenderTime = useCallback(() => {
    if (metricsRef.current.length === 0) return 0;
    const total = metricsRef.current.reduce((sum, m) => sum + m.renderTime, 0);
    return total / metricsRef.current.length;
  }, []);

  const getSlowRenders = useCallback(() => {
    return metricsRef.current.filter(m => m.renderTime > 16);
  }, []);

  // Performance metrics
  const getPerformanceMetrics = useCallback(() => ({
    totalRenders: renderCountRef.current,
    averageRenderTime: getAverageRenderTime(),
    timeSinceLastRender: Date.now() - lastRenderTimeRef.current
  }), [getAverageRenderTime]);

  return {
    metrics: metricsRef.current,
    averageRenderTime: getAverageRenderTime(),
    slowRenders: getSlowRenders(),
    createDebouncedCallback,
    shouldVirtualize,
    getPerformanceMetrics
  };
};
