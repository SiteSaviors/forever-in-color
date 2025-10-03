/**
 * React hook for performance tracking and persistence
 */

import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor, PerformanceMetric } from '@/utils/performanceMonitor';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/useAuthStore';

interface UsePerformanceTrackingOptions {
  /**
   * Enable automatic persistence to Supabase
   */
  persistToSupabase?: boolean;

  /**
   * Custom handler for metrics (e.g., send to analytics service)
   */
  onMetric?: (metric: PerformanceMetric) => void;

  /**
   * Batch size for Supabase persistence (default: 10)
   */
  batchSize?: number;
}

export const usePerformanceTracking = (options: UsePerformanceTrackingOptions = {}) => {
  const { persistToSupabase = true, onMetric, batchSize = 10 } = options;
  const { user } = useAuthStore();
  const metricsBuffer = useRef<PerformanceMetric[]>([]);

  /**
   * Persist metrics to Supabase
   */
  const persistMetrics = useCallback(async (metrics: PerformanceMetric[]) => {
    if (!persistToSupabase || metrics.length === 0) return;

    try {
      // Transform metrics to database format
      const records = metrics.map((metric) => ({
        metric_name: metric.name,
        metric_value: metric.value,
        rating: metric.rating,
        url: metric.url,
        user_id: metric.userId || null,
        session_id: metric.sessionId,
        timestamp: new Date(metric.timestamp).toISOString(),
      }));

      const { error } = await supabase.from('performance_metrics').insert(records);

      if (error) {
        console.error('[usePerformanceTracking] Failed to persist metrics:', error);
      }
    } catch (error) {
      console.error('[usePerformanceTracking] Error persisting metrics:', error);
    }
  }, [persistToSupabase]);

  /**
   * Handle metric flush events
   */
  useEffect(() => {
    const handleFlush = (event: CustomEvent<{ metrics: PerformanceMetric[] }>) => {
      const { metrics } = event.detail;

      // Add to buffer
      metricsBuffer.current.push(...metrics);

      // Persist if buffer is full
      if (metricsBuffer.current.length >= batchSize) {
        persistMetrics(metricsBuffer.current);
        metricsBuffer.current = [];
      }
    };

    window.addEventListener('performance-metrics-flush', handleFlush as EventListener);

    return () => {
      window.removeEventListener('performance-metrics-flush', handleFlush as EventListener);

      // Flush remaining metrics on unmount
      if (metricsBuffer.current.length > 0) {
        persistMetrics(metricsBuffer.current);
        metricsBuffer.current = [];
      }
    };
  }, [batchSize, persistMetrics]);

  /**
   * Subscribe to individual metrics
   */
  useEffect(() => {
    if (!onMetric) return;

    const unsubscribe = performanceMonitor.onMetric(onMetric);
    return unsubscribe;
  }, [onMetric]);

  /**
   * Update user ID when auth state changes
   */
  useEffect(() => {
    if (user?.id) {
      performanceMonitor.setUserId(user.id);
    } else {
      performanceMonitor.clearUserId();
    }
  }, [user?.id]);

  /**
   * Listen for watermark performance events
   */
  useEffect(() => {
    const handleWatermarkPerformance = (event: CustomEvent<{ duration: number }>) => {
      performanceMonitor.trackCustomMetric('watermark.duration', event.detail.duration);
    };

    window.addEventListener('watermark-performance', handleWatermarkPerformance as EventListener);

    return () => {
      window.removeEventListener('watermark-performance', handleWatermarkPerformance as EventListener);
    };
  }, []);

  /**
   * Track custom metric
   */
  const trackMetric = useCallback((name: string, value: number, metadata?: Record<string, unknown>) => {
    performanceMonitor.trackCustomMetric(name, value, metadata);
  }, []);

  /**
   * Start a measurement
   */
  const startMeasure = useCallback((name: string) => {
    return performanceMonitor.startMeasure(name);
  }, []);

  /**
   * Measure async operation
   */
  const measureAsync = useCallback(async <T,>(name: string, operation: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsync(name, operation);
  }, []);

  /**
   * Get current metrics summary
   */
  const getSummary = useCallback(() => {
    return performanceMonitor.getSummary();
  }, []);

  /**
   * Manually flush metrics
   */
  const flush = useCallback(() => {
    const metrics = performanceMonitor.flush();
    if (metrics.length > 0) {
      persistMetrics(metrics);
    }
  }, [persistMetrics]);

  return {
    trackMetric,
    startMeasure,
    measureAsync,
    getSummary,
    flush,
  };
};
