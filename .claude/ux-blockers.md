# Priority 2: Fix Real UX Blockers - Implementation Strategy

**Date**: October 2, 2025
**Analyst**: Claude (Sonnet 4.5)
**Timeline**: 1-2 weeks
**Focus**: Performance optimization, clean code, NO visual UI changes

---

## 🎯 Goals & Success Metrics

### Primary Objectives
1. **Eliminate 500ms-2s UI freezes** during watermarking
2. **Gain visibility** into real performance metrics
3. **Reduce unnecessary re-renders** by 50-60%
4. **Further optimize** PhotoUploadStep bundle (20-30 KB reduction)

### Success Criteria
- ✅ Watermarking runs off main thread (0ms UI freeze)
- ✅ Performance monitoring dashboard operational
- ✅ Heavy components wrapped in React.memo (50%+ render reduction)
- ✅ PhotoUploadStep split into 2-3 lazy chunks (~70 KB target)
- ✅ Zero visual UI changes
- ✅ Build passes with no errors
- ✅ Lighthouse performance score improves by 10-15 points

---

## 📋 Phase Breakdown

### **Phase 1: Web Worker Watermarking** (2-3 days)
**Goal**: Move canvas manipulation off main thread to eliminate UI freezes

**Current Problem**:
- `clientWatermarkService.ts` runs synchronously on main thread
- Canvas operations block UI for 500ms-2s per image
- 80% watermark size (line 39) causes significant memory allocation
- Used in 4 locations: useStylePreview, usePreviewGeneration, watermarkUtils

**Architecture Design**:

```
┌─────────────────────────────────────────────────────────────┐
│ Main Thread                                                  │
│                                                              │
│  ┌────────────────────┐                                     │
│  │ Component calls    │                                     │
│  │ addWatermark()     │                                     │
│  └────────┬───────────┘                                     │
│           │                                                  │
│           ▼                                                  │
│  ┌────────────────────┐         ┌──────────────────┐       │
│  │ WatermarkManager   ├────────►│ Progress         │       │
│  │ (main thread)      │         │ Callback (UI)    │       │
│  └────────┬───────────┘         └──────────────────┘       │
│           │ postMessage({                                   │
│           │   type: 'watermark',                            │
│           │   imageUrl, logoUrl                             │
│           │ })                                              │
└───────────┼─────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────┐
│ Web Worker Thread                                          │
│                                                            │
│  ┌──────────────────────────────────────┐                 │
│  │ watermark.worker.ts                  │                 │
│  │                                       │                 │
│  │  1. Receive message                  │                 │
│  │  2. Create OffscreenCanvas           │                 │
│  │  3. Load images (fetch + decode)     │                 │
│  │  4. Composite watermark              │                 │
│  │  5. Convert to Blob                  │                 │
│  │  6. Post back result                 │                 │
│  └───────────────┬──────────────────────┘                 │
│                  │                                         │
│                  │ postMessage({                           │
│                  │   type: 'complete',                     │
│                  │   watermarkedBlob                       │
│                  │ })                                      │
└──────────────────┼─────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│ Main Thread                                               │
│                                                           │
│  ┌──────────────────────┐                                │
│  │ WatermarkManager     │                                │
│  │ handles result       │                                │
│  └──────────┬───────────┘                                │
│             │                                             │
│             ▼                                             │
│  ┌──────────────────────┐                                │
│  │ Resolve Promise      │                                │
│  │ with watermarked URL │                                │
│  └──────────────────────┘                                │
└───────────────────────────────────────────────────────────┘
```

**Files to Create**:

1. **`src/workers/watermark.worker.ts`** (NEW - ~150 lines)
   ```typescript
   // Web Worker for watermark processing
   // Uses OffscreenCanvas API for thread-safe canvas operations

   interface WatermarkMessage {
     type: 'watermark';
     imageUrl: string;
     logoUrl: string;
     watermarkOpacity: number;
     watermarkSize: number; // Percentage (0.8 = 80%)
   }

   interface ProgressMessage {
     type: 'progress';
     stage: 'loading-image' | 'loading-logo' | 'compositing' | 'encoding';
     progress: number; // 0-100
   }

   interface CompletedMessage {
     type: 'complete';
     watermarkedBlob: Blob;
   }

   interface ErrorMessage {
     type: 'error';
     error: string;
   }

   // Worker message handler
   self.addEventListener('message', async (event: MessageEvent<WatermarkMessage>) => {
     try {
       const { imageUrl, logoUrl, watermarkOpacity, watermarkSize } = event.data;

       // Progress: Loading main image
       postProgress('loading-image', 10);
       const mainImageBitmap = await loadImageBitmap(imageUrl);

       // Progress: Loading watermark
       postProgress('loading-logo', 40);
       const logoBitmap = await loadImageBitmap(logoUrl);

       // Progress: Compositing
       postProgress('compositing', 60);
       const offscreen = new OffscreenCanvas(mainImageBitmap.width, mainImageBitmap.height);
       const ctx = offscreen.getContext('2d')!;

       // Draw main image
       ctx.drawImage(mainImageBitmap, 0, 0);

       // Calculate watermark dimensions
       const watermarkWidth = mainImageBitmap.width * watermarkSize;
       const aspectRatio = logoBitmap.height / logoBitmap.width;
       const watermarkHeight = watermarkWidth * aspectRatio;
       const x = (mainImageBitmap.width - watermarkWidth) / 2;
       const y = (mainImageBitmap.height - watermarkHeight) / 2;

       // Draw watermark with opacity and shadow
       ctx.globalAlpha = watermarkOpacity;
       ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
       ctx.shadowBlur = 4;
       ctx.shadowOffsetX = 2;
       ctx.shadowOffsetY = 2;
       ctx.drawImage(logoBitmap, x, y, watermarkWidth, watermarkHeight);

       // Progress: Encoding
       postProgress('encoding', 85);
       const blob = await offscreen.convertToBlob({ type: 'image/jpeg', quality: 0.95 });

       // Send result
       postProgress('encoding', 100);
       self.postMessage({ type: 'complete', watermarkedBlob: blob } as CompletedMessage);

     } catch (error) {
       self.postMessage({
         type: 'error',
         error: error instanceof Error ? error.message : 'Unknown error'
       } as ErrorMessage);
     }
   });

   async function loadImageBitmap(url: string): Promise<ImageBitmap> {
     const response = await fetch(url);
     const blob = await response.blob();
     return createImageBitmap(blob);
   }

   function postProgress(stage: ProgressMessage['stage'], progress: number) {
     self.postMessage({ type: 'progress', stage, progress } as ProgressMessage);
   }
   ```

2. **`src/utils/watermarkManager.ts`** (NEW - ~120 lines)
   ```typescript
   // Main thread manager for Web Worker watermarking
   // Provides same API as clientWatermarkService for drop-in replacement

   export class WatermarkManager {
     private static worker: Worker | null = null;
     private static logoUrl = "/lovable-uploads/df3291f2-07fa-4780-a6d2-0d024f3dec89.png";

     private static getWorker(): Worker {
       if (!this.worker) {
         this.worker = new Worker(
           new URL('../workers/watermark.worker.ts', import.meta.url),
           { type: 'module' }
         );
       }
       return this.worker;
     }

     static async addWatermarkToImage(
       imageUrl: string,
       options?: {
         onProgress?: (stage: string, progress: number) => void;
         watermarkOpacity?: number;
         watermarkSize?: number;
       }
     ): Promise<string> {
       return new Promise((resolve, reject) => {
         const worker = this.getWorker();
         const timeout = setTimeout(() => {
           reject(new Error('Watermark processing timeout (30s)'));
         }, 30000);

         const handleMessage = (event: MessageEvent) => {
           const message = event.data;

           switch (message.type) {
             case 'progress':
               options?.onProgress?.(message.stage, message.progress);
               break;

             case 'complete':
               clearTimeout(timeout);
               worker.removeEventListener('message', handleMessage);
               // Convert Blob to data URL
               const reader = new FileReader();
               reader.onloadend = () => resolve(reader.result as string);
               reader.onerror = () => reject(new Error('Failed to read watermarked image'));
               reader.readAsDataURL(message.watermarkedBlob);
               break;

             case 'error':
               clearTimeout(timeout);
               worker.removeEventListener('message', handleMessage);
               reject(new Error(message.error));
               break;
           }
         };

         worker.addEventListener('message', handleMessage);
         worker.postMessage({
           type: 'watermark',
           imageUrl,
           logoUrl: this.logoUrl,
           watermarkOpacity: options?.watermarkOpacity ?? 0.5,
           watermarkSize: options?.watermarkSize ?? 0.8
         });
       });
     }

     static generateSessionId(): string {
       return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
     }

     // Cleanup method for component unmount
     static terminate() {
       if (this.worker) {
         this.worker.terminate();
         this.worker = null;
       }
     }
   }
   ```

3. **Migration Strategy**: Replace imports in 4 files
   - `src/components/product/hooks/useStylePreview.ts`
   - `src/components/product/hooks/usePreviewGeneration.ts`
   - `src/utils/watermarkUtils.ts`
   - Any other consumers

   ```typescript
   // BEFORE:
   import { ClientWatermarkService } from '@/utils/clientWatermarkService';
   const watermarked = await ClientWatermarkService.addWatermarkToImage(url);

   // AFTER:
   import { WatermarkManager } from '@/utils/watermarkManager';
   const watermarked = await WatermarkManager.addWatermarkToImage(url, {
     onProgress: (stage, progress) => {
       // Optional: Show progress indicator
       console.log(`Watermarking: ${stage} - ${progress}%`);
     }
   });
   ```

**Testing Strategy**:
- Unit test: Worker receives message and posts result
- Integration test: Full watermarking flow with real images
- Performance test: Measure main thread blocking (should be ~0ms)
- Fallback test: Graceful degradation if Worker not supported

**Effort**: 2-3 days
**Impact**: 100% elimination of 500ms-2s UI freezes

---

### **Phase 2: Performance Monitoring Infrastructure** (1-2 days)
**Goal**: Gain visibility into real performance metrics

**Current Problem**:
- Zero observability into client-side performance
- No Real User Monitoring (RUM)
- Can't measure impact of optimizations
- All performance claims are guesses

**Architecture Design**:

```
┌────────────────────────────────────────────────────┐
│ Client Application                                  │
│                                                     │
│  ┌──────────────────────────────────┐              │
│  │ Performance Monitor               │              │
│  │ (hooks into React lifecycle)      │              │
│  └──────────────┬───────────────────┘              │
│                 │                                   │
│                 ├─► Web Vitals API                  │
│                 │   (LCP, FID, CLS, INP, TTFB)      │
│                 │                                   │
│                 ├─► Custom Metrics                  │
│                 │   • Preview generation time       │
│                 │   • Watermark processing time     │
│                 │   • Component render time         │
│                 │   • Cache hit/miss                │
│                 │                                   │
│                 ├─► Error Tracking                  │
│                 │   • Component errors              │
│                 │   • API failures                  │
│                 │                                   │
│                 ▼                                   │
│  ┌──────────────────────────────────┐              │
│  │ Analytics Adapter                 │              │
│  │ (buffer & batch)                  │              │
│  └──────────────┬───────────────────┘              │
└─────────────────┼──────────────────────────────────┘
                  │
                  ▼
      ┌─────────────────────────┐
      │ Supabase (Free Tier)    │
      │ OR                       │
      │ Browser Console (Dev)    │
      └─────────────────────────┘
```

**Files to Create**:

1. **`src/utils/performanceMonitor.ts`** (NEW - ~200 lines)
   ```typescript
   import { onCLS, onFID, onLCP, onINP, onTTFB, Metric } from 'web-vitals';
   import { supabase } from '@/integrations/supabase/client';

   interface PerformanceMetric {
     name: string;
     value: number;
     rating: 'good' | 'needs-improvement' | 'poor';
     timestamp: number;
     url: string;
     userAgent: string;
     connectionType?: string;
   }

   interface CustomMetric {
     name: string;
     value: number;
     metadata?: Record<string, unknown>;
   }

   class PerformanceMonitor {
     private buffer: PerformanceMetric[] = [];
     private readonly BUFFER_SIZE = 10;
     private readonly FLUSH_INTERVAL = 30000; // 30 seconds
     private flushTimer: number | null = null;

     constructor() {
       this.initWebVitals();
       this.initFlushTimer();
     }

     private initWebVitals() {
       // Core Web Vitals
       onCLS(this.handleMetric.bind(this));
       onFID(this.handleMetric.bind(this));
       onLCP(this.handleMetric.bind(this));
       onINP(this.handleMetric.bind(this));
       onTTFB(this.handleMetric.bind(this));
     }

     private handleMetric(metric: Metric) {
       const performanceMetric: PerformanceMetric = {
         name: metric.name,
         value: metric.value,
         rating: metric.rating,
         timestamp: Date.now(),
         url: window.location.pathname,
         userAgent: navigator.userAgent,
         connectionType: (navigator as any).connection?.effectiveType
       };

       this.addToBuffer(performanceMetric);

       // Also log to console in development
       if (process.env.NODE_ENV !== 'production') {
         console.log('[Performance]', metric.name, metric.value, metric.rating);
       }
     }

     trackCustomMetric(name: string, value: number, metadata?: Record<string, unknown>) {
       const metric: CustomMetric = { name, value, metadata };
       const performanceMetric: PerformanceMetric = {
         name: `custom.${name}`,
         value,
         rating: this.rateCustomMetric(name, value),
         timestamp: Date.now(),
         url: window.location.pathname,
         userAgent: navigator.userAgent
       };

       this.addToBuffer(performanceMetric);

       if (process.env.NODE_ENV !== 'production') {
         console.log('[Custom Metric]', name, value, metadata);
       }
     }

     private rateCustomMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
       // Custom thresholds for specific metrics
       const thresholds: Record<string, { good: number; poor: number }> = {
         'preview-generation': { good: 3000, poor: 8000 },
         'watermark-processing': { good: 100, poor: 500 },
         'component-render': { good: 16, poor: 50 },
         'cache-hit-latency': { good: 300, poor: 1000 }
       };

       const threshold = thresholds[name];
       if (!threshold) return 'good';

       if (value <= threshold.good) return 'good';
       if (value <= threshold.poor) return 'needs-improvement';
       return 'poor';
     }

     private addToBuffer(metric: PerformanceMetric) {
       this.buffer.push(metric);
       if (this.buffer.length >= this.BUFFER_SIZE) {
         this.flush();
       }
     }

     private initFlushTimer() {
       this.flushTimer = window.setInterval(() => {
         if (this.buffer.length > 0) {
           this.flush();
         }
       }, this.FLUSH_INTERVAL);
     }

     private async flush() {
       if (this.buffer.length === 0) return;

       const metricsToSend = [...this.buffer];
       this.buffer = [];

       try {
         // Option 1: Send to Supabase (free tier)
         if (process.env.NODE_ENV === 'production') {
           await supabase.from('performance_metrics').insert(
             metricsToSend.map(m => ({
               metric_name: m.name,
               metric_value: m.value,
               rating: m.rating,
               url: m.url,
               user_agent: m.userAgent,
               connection_type: m.connectionType,
               created_at: new Date(m.timestamp).toISOString()
             }))
           );
         }

         // Option 2: Send to external service (Plausible, PostHog, etc.)
         // await fetch('/api/metrics', { method: 'POST', body: JSON.stringify(metricsToSend) });

       } catch (error) {
         console.error('[Performance Monitor] Failed to flush metrics:', error);
         // Re-add to buffer for retry
         this.buffer.unshift(...metricsToSend);
       }
     }

     cleanup() {
       if (this.flushTimer) {
         clearInterval(this.flushTimer);
       }
       this.flush(); // Final flush
     }
   }

   // Singleton instance
   export const performanceMonitor = new PerformanceMonitor();

   // Cleanup on page unload
   window.addEventListener('beforeunload', () => {
     performanceMonitor.cleanup();
   });
   ```

2. **`src/hooks/usePerformanceTracking.ts`** (NEW - ~80 lines)
   ```typescript
   import { useEffect, useRef } from 'react';
   import { performanceMonitor } from '@/utils/performanceMonitor';

   /**
    * Hook to track component render performance
    * Automatically measures time between renders
    */
   export const useRenderTracking = (componentName: string) => {
     const renderStartTime = useRef<number>(0);
     const renderCount = useRef<number>(0);

     useEffect(() => {
       renderCount.current++;
       const renderTime = performance.now() - renderStartTime.current;

       if (renderCount.current > 1) {
         performanceMonitor.trackCustomMetric('component-render', renderTime, {
           component: componentName,
           renderNumber: renderCount.current
         });
       }

       renderStartTime.current = performance.now();
     });
   };

   /**
    * Hook to track async operation performance
    */
   export const useAsyncTracking = () => {
     const trackOperation = async <T,>(
       operationName: string,
       operation: () => Promise<T>,
       metadata?: Record<string, unknown>
     ): Promise<T> => {
       const startTime = performance.now();
       try {
         const result = await operation();
         const duration = performance.now() - startTime;
         performanceMonitor.trackCustomMetric(operationName, duration, {
           ...metadata,
           success: true
         });
         return result;
       } catch (error) {
         const duration = performance.now() - startTime;
         performanceMonitor.trackCustomMetric(operationName, duration, {
           ...metadata,
           success: false,
           error: error instanceof Error ? error.message : 'Unknown error'
         });
         throw error;
       }
     };

     return { trackOperation };
   };
   ```

3. **Database Migration** (Optional - for Supabase storage):
   ```sql
   -- supabase/migrations/YYYYMMDD_performance_metrics.sql

   create table if not exists public.performance_metrics (
     id uuid default gen_random_uuid() primary key,
     metric_name text not null,
     metric_value numeric not null,
     rating text check (rating in ('good', 'needs-improvement', 'poor')),
     url text not null,
     user_agent text,
     connection_type text,
     created_at timestamptz not null default now()
   );

   create index performance_metrics_name_idx on public.performance_metrics (metric_name);
   create index performance_metrics_created_at_idx on public.performance_metrics (created_at desc);
   create index performance_metrics_rating_idx on public.performance_metrics (rating);

   -- RLS: Allow inserts from authenticated OR anonymous users
   alter table public.performance_metrics enable row level security;

   create policy "Allow inserts for all users"
     on public.performance_metrics
     for insert
     with check (true);

   create policy "Allow reads for authenticated users only"
     on public.performance_metrics
     for select
     using (auth.role() = 'authenticated');
   ```

4. **Integration Points**:
   - Add to `src/main.tsx` for global monitoring
   - Add `useRenderTracking()` to heavy components
   - Track preview generation in `usePreviewGeneration`
   - Track watermarking in `WatermarkManager`
   - Track cache hits/misses in Edge Function responses

**Dashboard (Simple Supabase Query)**:
```sql
-- Average Core Web Vitals (last 7 days)
SELECT
  metric_name,
  ROUND(AVG(metric_value), 2) as avg_value,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value), 2) as p95_value,
  COUNT(*) as sample_count,
  ROUND(100.0 * SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END) / COUNT(*), 1) as good_percentage
FROM performance_metrics
WHERE
  created_at > NOW() - INTERVAL '7 days'
  AND metric_name IN ('CLS', 'FID', 'LCP', 'INP', 'TTFB')
GROUP BY metric_name;

-- Custom metrics performance
SELECT
  metric_name,
  ROUND(AVG(metric_value), 0) as avg_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value), 0) as p95_ms,
  COUNT(*) as sample_count
FROM performance_metrics
WHERE
  created_at > NOW() - INTERVAL '7 days'
  AND metric_name LIKE 'custom.%'
GROUP BY metric_name
ORDER BY avg_ms DESC;
```

**Effort**: 1-2 days
**Impact**: Foundation for all future performance work

---

### **Phase 3: Strategic React.memo Implementation** (1-2 days)
**Goal**: Reduce unnecessary re-renders by 50-60%

**Current Problem**:
- Only 14 of 135 product components use `memo()`
- Heavy components re-render on every parent update
- Style cards, image components, step containers all lack memoization

**Strategy**: Target components with **high render cost + stable props**

**Priority Components to Memoize**:

1. **PhotoAndStyleStep** (Current: No memo | Target: Full memo)
   - Why: Renders cropper, upload, style selector (heavy DOM)
   - Props: Mostly stable (only change on user action)
   - Expected impact: 30-40% fewer renders

   ```typescript
   // BEFORE:
   const PhotoAndStyleStepContent = ({ ... }: PhotoAndStyleStepProps) => { ... }

   // AFTER:
   const PhotoAndStyleStepContent = memo(({ ... }: PhotoAndStyleStepProps) => {
     // Component logic
   }, (prevProps, nextProps) => {
     // Custom comparison: only re-render if these props change
     return (
       prevProps.selectedStyle?.id === nextProps.selectedStyle?.id &&
       prevProps.uploadedImage === nextProps.uploadedImage &&
       prevProps.currentStep === nextProps.currentStep &&
       prevProps.completedSteps.length === nextProps.completedSteps.length
     );
   });
   ```

2. **StyleSelector** (Current: No memo | Target: Memo + lazy load)
   - Why: Renders 15 style cards with preview images
   - Props: Stable until user selects style
   - Expected impact: 40-50% fewer renders
   - BONUS: Make this lazy-loaded (Phase 4)

3. **CanvasConfigurationStep** (Current: No memo | Target: Full memo)
   - Why: Complex orientation/size selection with AR preview
   - Props: Stable except when user changes selection
   - Expected impact: 30-40% fewer renders

4. **CustomizationStep** (Current: No memo | Target: Full memo)
   - Why: Premium customization options with conditional rendering
   - Props: Stable except customization changes
   - Expected impact: 20-30% fewer renders

5. **StyleCard** (Already memoized ✓ - verify implementation)
   - Current: Uses `memo()`
   - Action: Add custom comparison function for better optimization

6. **Image Components** (PhotoCropperSection, PhotoUploadContainer)
   - Why: Heavy image processing/display
   - Props: Stable until user uploads new image
   - Expected impact: 50-60% fewer renders

**Implementation Pattern**:

```typescript
import { memo } from 'react';

// For simple props (primitives, stable objects):
const Component = memo(({ prop1, prop2 }: Props) => {
  // Component logic
});

// For complex props (need custom comparison):
const Component = memo(({ complexProp, array, object }: Props) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip render)
  // Return false if props changed (do render)
  return (
    prevProps.complexProp.id === nextProps.complexProp.id &&
    prevProps.array.length === nextProps.array.length &&
    shallowEqual(prevProps.object, nextProps.object)
  );
});

// Helper for shallow comparison
function shallowEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
}
```

**Testing Strategy**:
- Before: Run `npm run build`, note bundle size
- Add memos with custom comparisons
- After: Run `npm run build`, verify no size increase (memo is zero-cost abstraction)
- Use React DevTools Profiler to measure render count reduction
- Verify no visual regressions

**Files to Modify** (~15 files):
1. `src/components/product/components/PhotoAndStyleStep.tsx`
2. `src/components/product/StyleSelector.tsx`
3. `src/components/product/components/CanvasConfigurationStep.tsx`
4. `src/components/product/components/CustomizationStep.tsx`
5. `src/components/product/components/ReviewOrderStep.tsx`
6. `src/components/product/PhotoCropper.tsx`
7. `src/components/product/photo-upload/PhotoUploadContainer.tsx`
8. `src/components/product/cropper/components/CropArea.tsx`
9. `src/components/product/components/IntelligentStyleGrid.tsx`
10. `src/components/product/progress/SmartProgressIndicator.tsx`
11. `src/components/product/help/ContextualHelp.tsx`
12. `src/components/product/mobile/MobileGestureHandler.tsx`
13. `src/components/product/components/UnifiedSocialMomentumWidget.tsx`
14. `src/components/product/testimonials/*` (3 files)
15. `src/components/product/orientation/components/*` (6 files)

**Effort**: 1-2 days
**Impact**: 50-60% reduction in unnecessary re-renders

---

### **Phase 4: PhotoUploadStep Code Splitting** (6-8 hours)
**Goal**: Reduce PhotoUploadStep from 99.5 KB to ~70 KB target

**Current State**:
- PhotoUploadStep: 99.49 KB (27.15 KB gzipped)
- Already lazy-loaded in ProductStepsManager
- Contains: PhotoUploadContainer, StyleSelector, PhotoCropper, SmartProgressIndicator, ContextualHelp

**Splitting Strategy**:

```
┌─────────────────────────────────────────────────┐
│ BEFORE: PhotoUploadStep (99.5 KB)              │
├─────────────────────────────────────────────────┤
│ • PhotoUploadContainer                          │
│ • StyleSelector (includes IntelligentStyleGrid) │
│ • PhotoCropper (includes CropArea)              │
│ • SmartProgressIndicator                        │
│ • ContextualHelp                                │
│ • MobileGestureHandler                          │
│ • Progress context providers                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ AFTER: PhotoUploadStep-Core (~35 KB)           │
├─────────────────────────────────────────────────┤
│ • PhotoUploadContainer                          │
│ • SmartProgressIndicator                        │
│ • MobileGestureHandler                          │
│ • Progress context providers                    │
│ • Lazy load triggers for sub-chunks             │
└─────────────────────────────────────────────────┘
        ↓
        ├──► StyleSelector-Lazy (~35 KB)
        │    Loads AFTER image uploaded
        │    • StyleSelector
        │    • IntelligentStyleGrid
        │    • StyleCard components
        │
        └──► PhotoCropper-Lazy (~30 KB)
             Loads ONLY when user clicks "Recrop"
             • PhotoCropper
             • CropArea
             • react-easy-crop (already lazy in Phase 1)
             • OrientationSelector
```

**Implementation**:

1. **Modify PhotoAndStyleStep.tsx** to use dynamic imports:

```typescript
import { lazy, Suspense } from 'react';
import PhotoUploadContainer from "../photo-upload/PhotoUploadContainer";
import SmartProgressIndicator from "../progress/SmartProgressIndicator";
import MobileGestureHandler from "../mobile/MobileGestureHandler";
import { StepOneExperienceProvider } from "../progress/StepOneExperienceContext";

// Lazy load heavy components
const StyleSelector = lazy(() => import('../StyleSelector'));
const PhotoCropperSection = lazy(() => import('./PhotoCropperSection'));
const ContextualHelp = lazy(() => import('../help/ContextualHelp'));

const PhotoAndStyleStepContent = ({ ... }) => {
  const hasImage = !!croppedImage;

  return (
    <MobileGestureHandler>
      <div className="space-y-8">
        <SmartProgressIndicator uploadedImage={croppedImage} completedSteps={completedSteps} />

        {/* Cropper: Only load when needed */}
        {showCropper && (
          <Suspense fallback={<LoadingSpinner />}>
            <PhotoCropperSection
              showCropper={showCropper}
              originalImage={originalImage}
              currentOrientation={currentOrientation}
              onCropComplete={handleCropComplete}
              onOrientationChange={setCurrentOrientation}
            />
          </Suspense>
        )}

        {/* Upload: Always eager (core functionality) */}
        {!showCropper && !hasImage && (
          <PhotoUploadContainer
            onImageUpload={handleEnhancedImageUpload}
            initialImage={croppedImage}
          />
        )}

        {/* Style Selector: Lazy load after image upload */}
        {!showCropper && hasImage && (
          <Suspense fallback={<LoadingSpinner message="Loading styles..." />}>
            <StyleSelector
              croppedImage={croppedImage}
              selectedStyle={selectedStyle?.id || null}
              cropAspectRatio={cropAspectRatio}
              selectedOrientation={currentOrientation}
              onStyleSelect={handleEnhancedStyleSelect}
              onComplete={handleStyleComplete}
              onRecropImage={handleRecropImage}
            />
          </Suspense>
        )}

        {/* Contextual Help: Lazy load (non-critical) */}
        <Suspense fallback={null}>
          <ContextualHelp />
        </Suspense>
      </div>
    </MobileGestureHandler>
  );
};
```

2. **Create LoadingSpinner component** (shared):

```typescript
// src/components/product/components/LoadingSpinner.tsx
export const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  </div>
);
```

**Expected Bundle Results**:
```
BEFORE Phase 4:
- PhotoUploadStep: 99.49 KB (27.15 KB gzipped)

AFTER Phase 4:
- PhotoUploadStep-Core: ~35 KB (10 KB gzipped) ← Initial load
- StyleSelector-Lazy: ~35 KB (10 KB gzipped) ← After image upload
- PhotoCropper-Lazy: ~30 KB (8 KB gzipped) ← Only if user recrops
- ContextualHelp-Lazy: ~3 KB (1 KB gzipped) ← Background load

Total savings: ~65 KB reduction in initial PhotoUploadStep load
Perceived performance: User sees upload UI in 10 KB instead of 27 KB
```

**Testing**:
- Verify lazy chunks load correctly
- Check no flicker during Suspense transitions
- Validate all functionality works (upload → style → crop → complete)
- Measure bundle sizes before/after
- Test on slow 3G connection

**Effort**: 6-8 hours
**Impact**: 65% reduction in PhotoUploadStep initial load size

---

## 📊 Combined Impact & Timeline

### Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Watermark UI Freeze** | 500ms-2s | ~0ms | **100% elimination** |
| **PhotoUploadStep Size** | 99.5 KB (27 KB gzip) | ~35 KB (10 KB gzip) | **65% reduction** |
| **Unnecessary Re-renders** | Baseline | 50-60% fewer | **Major improvement** |
| **Performance Visibility** | None | Full RUM + dashboards | **∞% improvement** |
| **Lighthouse Performance** | ~75 (estimated) | ~85-90 | **+10-15 points** |
| **Time to Interactive** | ~3.5s | ~2.5s | **1s faster** |

### Implementation Timeline

```
Week 1:
├─ Day 1-2: Web Worker Watermarking
│  └─ Create worker, manager, tests
├─ Day 3: Performance Monitoring Setup
│  └─ Create monitor, hooks, integrate
├─ Day 4-5: React.memo Implementation
│  └─ Add memo to 15 heavy components
└─ Weekend: Testing & validation

Week 2:
├─ Day 1: PhotoUploadStep Code Splitting
│  └─ Implement lazy loading
├─ Day 2: Integration Testing
│  └─ Full flow validation
├─ Day 3: Performance Benchmarking
│  └─ Before/after metrics
├─ Day 4: Documentation & Cleanup
│  └─ Update docs, remove dead code
└─ Day 5: Deploy & Monitor
   └─ Production deployment
```

---

## ✅ Success Checklist

**Phase 1 Complete When**:
- [ ] Web Worker watermarking implemented
- [ ] 4 files migrated to use WatermarkManager
- [ ] Main thread blocking = 0ms (measured)
- [ ] Unit tests pass for worker
- [ ] Integration tests pass for full flow

**Phase 2 Complete When**:
- [ ] Performance monitor collecting Web Vitals
- [ ] Custom metrics tracking (preview, watermark, render)
- [ ] Dashboard queries working
- [ ] Data flowing to Supabase OR console

**Phase 3 Complete When**:
- [ ] 15 heavy components wrapped in memo()
- [ ] React DevTools Profiler shows 50%+ render reduction
- [ ] Build size unchanged or smaller
- [ ] No visual regressions

**Phase 4 Complete When**:
- [ ] PhotoUploadStep split into 3 lazy chunks
- [ ] Initial bundle reduced to ~35 KB (10 KB gzip)
- [ ] All lazy chunks load correctly
- [ ] No Suspense flicker or UX issues

**Overall Complete When**:
- [ ] All 4 phases complete
- [ ] Build passes with zero errors
- [ ] Lighthouse performance score +10-15 points
- [ ] No visual UI changes
- [ ] Documentation updated
- [ ] Performance dashboard operational

---

## 🚧 Risks & Mitigations

### Risk 1: Web Worker Not Supported (Older Browsers)
**Mitigation**: Fallback to synchronous watermarking
```typescript
static async addWatermarkToImage(imageUrl: string): Promise<string> {
  if (typeof Worker === 'undefined') {
    // Fallback to synchronous (old clientWatermarkService)
    return ClientWatermarkService.addWatermarkToImage(imageUrl);
  }
  // Use Web Worker
  return this.processWithWorker(imageUrl);
}
```

### Risk 2: OffscreenCanvas Not Supported
**Mitigation**: Use regular Canvas API in worker with polyfill
```typescript
// In worker: Check for OffscreenCanvas support
if (typeof OffscreenCanvas === 'undefined') {
  // Use canvas polyfill or throw error with fallback
  throw new Error('OffscreenCanvas not supported');
}
```

### Risk 3: Over-Memoization Causing Bugs
**Mitigation**:
- Test thoroughly with React DevTools Profiler
- Use custom comparison functions carefully
- Monitor for "stale props" bugs

### Risk 4: Lazy Loading Causes UX Flicker
**Mitigation**:
- Provide meaningful Suspense fallbacks
- Preload chunks on hover/interaction
- Test on slow 3G connections

---

## 📁 Files Summary

**New Files** (8):
1. `src/workers/watermark.worker.ts` (~150 lines)
2. `src/utils/watermarkManager.ts` (~120 lines)
3. `src/utils/performanceMonitor.ts` (~200 lines)
4. `src/hooks/usePerformanceTracking.ts` (~80 lines)
5. `src/components/product/components/LoadingSpinner.tsx` (~15 lines)
6. `supabase/migrations/YYYYMMDD_performance_metrics.sql` (~30 lines)
7. `docs/performance-monitoring-dashboard.md` (queries & setup)
8. `docs/react-memo-guidelines.md` (best practices)

**Modified Files** (~25):
- 4 files for watermark migration
- 1 file for performance integration (main.tsx)
- 15 files for React.memo
- 1 file for PhotoUploadStep splitting
- 4 files for hooks instrumentation

**Deleted Files** (1):
- `src/components/product/AccordionCompat.tsx` (dead code cleanup)

**Total New Lines**: ~700
**Total Modified Lines**: ~300
**Net Code Change**: +400 lines (mostly infrastructure)

---

## 🎯 Next Steps After Completion

1. **Monitor Performance** (ongoing)
   - Review dashboard weekly
   - Track Core Web Vitals trends
   - Identify new optimization opportunities

2. **Phase 2 Part 2 Opportunities**:
   - Further CustomizationStep optimization (~77 KB)
   - Image optimization (WebP, srcsets)
   - Main bundle tree-shaking (569 KB → ~450 KB)

3. **Validate Phase 2 Caching** (from earlier Priority 1)
   - Confirm $1,440/mo cost savings
   - Set up cache monitoring

---

**Ready to proceed with implementation?** I can help execute any phase when you say "Proceed" with the phase number.
r