/**
 * Performance Monitoring System
 * Tracks Web Vitals (CLS, INP, LCP, FCP, TTFB) and custom metrics
 */

import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userId?: string;
  sessionId: string;
}

export interface CustomMetric {
  name: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

type MetricCallback = (metric: PerformanceMetric) => void;

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private callbacks: MetricCallback[] = [];
  private sessionId: string;
  private userId?: string;
  private readonly bufferSize = 10; // Send metrics in batches of 10
  private readonly flushInterval = 30000; // Flush every 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  /**
   * Initialize Web Vitals monitoring
   */
  initWebVitals(): void {
    // Core Web Vitals
    onCLS(this.handleWebVital.bind(this));
    onINP(this.handleWebVital.bind(this));
    onLCP(this.handleWebVital.bind(this));

    // Other important metrics
    onFCP(this.handleWebVital.bind(this));
    onTTFB(this.handleWebVital.bind(this));
  }

  /**
   * Handle Web Vitals metric
   */
  private handleWebVital(metric: Metric): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.pathname,
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.recordMetric(performanceMetric);
  }

  /**
   * Track custom performance metric (e.g., API call duration, component render time)
   */
  trackCustomMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const performanceMetric: PerformanceMetric = {
      name: `custom.${name}`,
      value,
      rating: this.getRatingForCustomMetric(name, value),
      timestamp: Date.now(),
      url: window.location.pathname,
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.recordMetric(performanceMetric);
  }

  /**
   * Start a performance measurement
   */
  startMeasure(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.trackCustomMetric(name, duration);
      return duration;
    };
  }

  /**
   * Measure async operation
   */
  async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const endMeasure = this.startMeasure(name);
    try {
      const result = await operation();
      endMeasure();
      return result;
    } catch (error) {
      endMeasure();
      throw error;
    }
  }

  /**
   * Set user ID for attribution
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Clear user ID (on logout)
   */
  clearUserId(): void {
    this.userId = undefined;
  }

  /**
   * Subscribe to metric events
   */
  onMetric(callback: MetricCallback): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Record metric and notify subscribers
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Notify all callbacks
    this.callbacks.forEach((callback) => {
      try {
        callback(metric);
      } catch (error) {
        console.error('[PerformanceMonitor] Error in metric callback:', error);
      }
    });

    // Auto-flush if buffer is full
    if (this.metrics.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary
   */
  getSummary(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const summary: Record<string, { count: number; total: number; min: number; max: number }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      const s = summary[metric.name];
      s.count++;
      s.total += metric.value;
      s.min = Math.min(s.min, metric.value);
      s.max = Math.max(s.max, metric.value);
    });

    // Convert total to average
    return Object.fromEntries(
      Object.entries(summary).map(([name, data]) => [
        name,
        {
          count: data.count,
          avg: data.total / data.count,
          min: data.min,
          max: data.max,
        },
      ])
    );
  }

  /**
   * Flush metrics to subscribers (for persistence)
   */
  flush(): PerformanceMetric[] {
    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    // Emit flush event
    if (metricsToFlush.length > 0) {
      this.emitFlush(metricsToFlush);
    }

    return metricsToFlush;
  }

  /**
   * Emit flush event to notify subscribers
   */
  private emitFlush(metrics: PerformanceMetric[]): void {
    window.dispatchEvent(
      new CustomEvent('performance-metrics-flush', {
        detail: { metrics },
      })
    );
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop flush timer and flush remaining metrics
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get rating for custom metric based on thresholds
   */
  private getRatingForCustomMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    // Define thresholds for common custom metrics
    const thresholds: Record<string, { good: number; poor: number }> = {
      'watermark.duration': { good: 100, poor: 500 }, // Watermarking < 100ms good, > 500ms poor
      'preview.generation': { good: 2000, poor: 5000 }, // Preview < 2s good, > 5s poor
      'api.call': { good: 200, poor: 1000 }, // API < 200ms good, > 1s poor
      'component.render': { good: 16, poor: 50 }, // Render < 16ms good, > 50ms poor
    };

    const threshold = thresholds[name] || { good: 100, poor: 1000 };

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize Web Vitals
if (typeof window !== 'undefined') {
  performanceMonitor.initWebVitals();
}
