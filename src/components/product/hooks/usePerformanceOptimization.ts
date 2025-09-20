import { useEffect, useCallback, useRef } from 'react';

// Performance monitoring interface
interface PerformanceMetrics {
  animationStartTime: number;
  animationEndTime?: number;
  duration?: number;
  fps?: number;
  memoryUsage?: number;
  renderCount: number;
}

// Performance optimization hook
export const usePerformanceOptimization = (
  elementRef: React.RefObject<HTMLElement>,
  options: {
    enableWillChange?: boolean;
    enablePerformanceMonitoring?: boolean;
    animationDuration?: number;
    threshold?: number;
  } = {}
) => {
  const {
    enableWillChange = true,
    enablePerformanceMonitoring = process.env.NODE_ENV === 'development',
    animationDuration = 300,
    threshold = 16.67 // 60fps threshold
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    animationStartTime: 0,
    renderCount: 0
  });

  const animationFrameRef = useRef<number>();
  const willChangeTimeoutRef = useRef<NodeJS.Timeout>();

  // Enable will-change for animation performance
  const enableWillChangeOptimization = useCallback((properties: string[] = ['transform', 'opacity']) => {
    if (!enableWillChange || !elementRef.current) return;

    const element = elementRef.current;
    const willChangeValue = properties.join(', ');
    
    // Add will-change only during animation
    element.style.willChange = willChangeValue;
    element.classList.add('perf-animating');

    // Remove will-change after animation completes
    if (willChangeTimeoutRef.current) {
      clearTimeout(willChangeTimeoutRef.current);
    }

    willChangeTimeoutRef.current = setTimeout(() => {
      if (element) {
        element.style.willChange = 'auto';
        element.classList.remove('perf-animating');
        element.classList.add('perf-cleanup');
      }
    }, animationDuration + 50); // Add buffer for cleanup

  }, [enableWillChange, elementRef, animationDuration]);

  // Disable will-change immediately
  const disableWillChangeOptimization = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    element.style.willChange = 'auto';
    element.classList.remove('perf-animating');
    element.classList.add('perf-cleanup');

    if (willChangeTimeoutRef.current) {
      clearTimeout(willChangeTimeoutRef.current);
    }
  }, [elementRef]);

  // Performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    if (!enablePerformanceMonitoring) return;

    metricsRef.current.animationStartTime = performance.now();
    metricsRef.current.renderCount = 0;

    // Monitor FPS during animation
    const monitorFrame = () => {
      metricsRef.current.renderCount++;
      animationFrameRef.current = requestAnimationFrame(monitorFrame);
    };

    monitorFrame();
  }, [enablePerformanceMonitoring]);

  const endPerformanceMonitoring = useCallback(() => {
    if (!enablePerformanceMonitoring) return;

    const endTime = performance.now();
    const duration = endTime - metricsRef.current.animationStartTime;
    const fps = (metricsRef.current.renderCount / duration) * 1000;

    metricsRef.current.animationEndTime = endTime;
    metricsRef.current.duration = duration;
    metricsRef.current.fps = fps;

    // Get memory usage if available
    if ('memory' in performance) {
      metricsRef.current.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    // Cancel monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Log performance metrics
    console.group('🚀 Performance Metrics');
    console.log('Duration:', `${duration.toFixed(2)}ms`);
    console.log('FPS:', `${fps.toFixed(1)}`);
    console.log('Render Count:', metricsRef.current.renderCount);
    if (metricsRef.current.memoryUsage) {
      console.log('Memory Usage:', `${(metricsRef.current.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Warn if performance is below threshold
    if (fps < threshold) {
      console.warn(`⚠️ Animation performance below ${threshold}fps threshold`);
    }
    console.groupEnd();

    return metricsRef.current;
  }, [enablePerformanceMonitoring, threshold]);

  // Combined animation optimization
  const startAnimation = useCallback((properties?: string[]) => {
    enableWillChangeOptimization(properties);
    startPerformanceMonitoring();
  }, [enableWillChangeOptimization, startPerformanceMonitoring]);

  const endAnimation = useCallback(() => {
    const metrics = endPerformanceMonitoring();
    disableWillChangeOptimization();
    return metrics;
  }, [endPerformanceMonitoring, disableWillChangeOptimization]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (willChangeTimeoutRef.current) {
        clearTimeout(willChangeTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      disableWillChangeOptimization();
    };
  }, [disableWillChangeOptimization]);

  return {
    startAnimation,
    endAnimation,
    enableWillChangeOptimization,
    disableWillChangeOptimization,
    startPerformanceMonitoring,
    endPerformanceMonitoring,
    metrics: metricsRef.current
  };
};

// Utility hook for automatic performance optimization
export const useAutoPerformanceOptimization = (
  elementRef: React.RefObject<HTMLElement>,
  isAnimating: boolean,
  properties: string[] = ['transform', 'opacity']
) => {
  const { startAnimation, endAnimation } = usePerformanceOptimization(elementRef);

  useEffect(() => {
    if (isAnimating) {
      startAnimation(properties);
    } else {
      endAnimation();
    }
  }, [isAnimating, startAnimation, endAnimation, properties]);
};

// Global performance utilities
export const performanceUtils = {
  // Remove all will-change properties from the page
  cleanupWillChange: () => {
    const elementsWithWillChange = document.querySelectorAll('[style*="will-change"]');
    elementsWithWillChange.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.willChange = 'auto';
      }
    });
  },

  // Monitor overall page performance
  monitorPagePerformance: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    console.group('📊 Page Performance Metrics');
    console.log('DOM Content Loaded:', `${navigation.domContentLoadedEventEnd}ms`);
    console.log('Load Complete:', `${navigation.loadEventEnd}ms`);
    
    paint.forEach(entry => {
      console.log(`${entry.name}:`, `${entry.startTime.toFixed(2)}ms`);
    });
    
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('JS Heap Size:', `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log('JS Heap Limit:', `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
    }
    console.groupEnd();
  },

  // Create performance observer for long tasks
  observeLongTasks: (callback?: (entries: PerformanceEntry[]) => void) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn(`🐌 Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        });
        callback?.(entries);
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
        return observer;
      } catch (e) {
        console.warn('Long task observation not supported');
      }
    }
    return null;
  }
};