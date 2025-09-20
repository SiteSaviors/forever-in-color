import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export const usePerformanceMonitor = (componentName: string, enabled: boolean = true) => {
  const renderStartTime = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  useEffect(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (!enabled) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    
    const metric: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now()
    };
    
    metricsRef.current.push(metric);
    
    // Log slow renders
    if (renderTime > 16) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
    
    // Keep only last 50 metrics
    if (metricsRef.current.length > 50) {
      metricsRef.current = metricsRef.current.slice(-50);
    }
  });

  const getAverageRenderTime = () => {
    if (metricsRef.current.length === 0) return 0;
    const total = metricsRef.current.reduce((sum, m) => sum + m.renderTime, 0);
    return total / metricsRef.current.length;
  };

  const getSlowRenders = () => {
    return metricsRef.current.filter(m => m.renderTime > 16);
  };

  return {
    metrics: metricsRef.current,
    averageRenderTime: getAverageRenderTime(),
    slowRenders: getSlowRenders()
  };
};
