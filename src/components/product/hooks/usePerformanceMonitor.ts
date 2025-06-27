
import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  props?: any;
}

export const usePerformanceMonitor = (componentName: string, props?: any) => {
  const renderStartTime = useRef<number>();
  const renderCount = useRef(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 Performance [${componentName}]:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          props: props ? Object.keys(props).length : 0
        });
        
        // Warn about slow renders
        if (renderTime > 16) { // 60fps threshold
          console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    }
  });

  const logCustomMetric = useCallback((metricName: string, value: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Custom Metric [${componentName}] ${metricName}:`, value);
    }
  }, [componentName]);

  return { logCustomMetric };
};

// Hook for measuring async operations
export const useAsyncPerformanceMonitor = () => {
  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ Async Operation [${operationName}]: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Failed Async Operation [${operationName}]: ${duration.toFixed(2)}ms`, error);
      }
      
      throw error;
    }
  }, []);

  return { measureAsync };
};
