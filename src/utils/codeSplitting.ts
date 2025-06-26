
// Advanced code splitting and lazy loading utilities
import { lazy, ComponentType } from 'react';

interface LazyLoadOptions {
  fallback?: ComponentType;
  retry?: number;
  timeout?: number;
  preload?: boolean;
}

export class CodeSplitter {
  private static loadedChunks = new Set<string>();
  private static preloadQueue = new Map<string, Promise<any>>();

  // Enhanced lazy loading with retry and preloading
  static createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: LazyLoadOptions = {}
  ): ComponentType<any> {
    const {
      retry = 3,
      timeout = 10000,
      preload = false
    } = options;

    const lazyComponent = lazy(() => 
      this.withRetry(importFn, retry, timeout)
    );

    // Preload if requested
    if (preload) {
      this.preloadComponent(importFn);
    }

    return lazyComponent;
  }

  // Retry mechanism for failed imports
  private static async withRetry<T>(
    importFn: () => Promise<T>,
    retries: number,
    timeout: number
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Import timeout')), timeout);
        });

        return await Promise.race([importFn(), timeoutPromise]);
      } catch (error) {
        lastError = error as Error;
        
        if (i < retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError!;
  }

  // Preload component for faster rendering
  static preloadComponent(importFn: () => Promise<any>): Promise<any> {
    const key = importFn.toString();
    
    if (!this.preloadQueue.has(key)) {
      const promise = importFn().catch(error => {
        console.warn('Preload failed:', error);
        this.preloadQueue.delete(key);
        return null;
      });
      
      this.preloadQueue.set(key, promise);
    }

    return this.preloadQueue.get(key)!;
  }

  // Route-based code splitting
  static createRouteComponent(
    importFn: () => Promise<{ default: ComponentType<any> }>,
    routeName: string
  ): ComponentType<any> {
    return this.createLazyComponent(importFn, {
      preload: this.shouldPreloadRoute(routeName),
      retry: 2,
      timeout: 15000
    });
  }

  // Determine if route should be preloaded
  private static shouldPreloadRoute(routeName: string): boolean {
    const highPriorityRoutes = ['product', 'home', 'auth'];
    return highPriorityRoutes.includes(routeName);
  }

  // Preload likely next routes based on current route
  static preloadLikelyRoutes(currentRoute: string): void {
    const routeMap: Record<string, string[]> = {
      'home': ['product', 'auth'],
      'product': ['payment-success', 'auth'],
      'auth': ['product', 'home'],
      'payment-success': ['home', 'product']
    };

    const likelyRoutes = routeMap[currentRoute] || [];
    
    likelyRoutes.forEach(route => {
      // Only preload if not already loaded
      if (!this.loadedChunks.has(route)) {
        this.requestIdleCallback(() => {
          this.preloadRoute(route);
        });
      }
    });
  }

  // Preload specific route
  private static preloadRoute(routeName: string): void {
    const routeImports: Record<string, () => Promise<any>> = {
      'product': () => import('@/pages/Product'),
      'auth': () => import('@/pages/Auth'),
      'payment-success': () => import('@/pages/PaymentSuccess'),
      'classic-oil-painting': () => import('@/pages/ClassicOilPainting'),
      'watercolor-dreams': () => import('@/pages/WatercolorDreams'),
      'pastel-bliss': () => import('@/pages/PastelBliss')
    };

    const importFn = routeImports[routeName];
    if (importFn) {
      this.preloadComponent(importFn);
      this.loadedChunks.add(routeName);
    }
  }

  // Component-based splitting for heavy components
  static createHeavyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    componentName: string
  ): ComponentType<any> {
    return this.createLazyComponent(importFn, {
      preload: this.shouldPreloadComponent(componentName),
      retry: 3,
      timeout: 8000
    });
  }

  // Determine if component should be preloaded
  private static shouldPreloadComponent(componentName: string): boolean {
    const criticalComponents = [
      'PhotoUpload',
      'StyleSelector',
      'OrientationSelector',
      'PriceCalculator'
    ];
    
    return criticalComponents.includes(componentName);
  }

  // Bundle splitting based on feature sets
  static preloadFeatureBundle(featureName: string): void {
    const featureBundles: Record<string, (() => Promise<any>)[]> = {
      'photo-editing': [
        () => import('@/components/product/PhotoCropper'),
        () => import('@/components/product/photo-upload/PhotoUploadContainer'),
        () => import('@/utils/imageCompression')
      ],
      'style-preview': [
        () => import('@/components/product/StyleCard'),
        () => import('@/components/product/StyleGrid'),
        () => import('@/components/product/MockupCanvas')
      ],
      'payment': [
        () => import('@/components/product/PaymentForm'),
        () => import('@/components/product/OrderSummary'),
        () => import('@/components/product/hooks/useStripePayment')
      ]
    };

    const bundles = featureBundles[featureName] || [];
    bundles.forEach(importFn => {
      this.preloadComponent(importFn);
    });
  }

  // Utility for requestIdleCallback with fallback
  private static requestIdleCallback(callback: () => void): void {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 100);
    }
  }

  // Resource hints injection
  static injectResourceHints(): void {
    const hints = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      { rel: 'dns-prefetch', href: 'https://api.replicate.com' },
      { rel: 'dns-prefetch', href: 'https://replicate.delivery' },
      { rel: 'prefetch', href: '/lovable-uploads/3e752087-b61d-463b-87ca-313d878c43c1.png' },
      { rel: 'prefetch', href: '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png' }
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      Object.assign(link, hint);
      document.head.appendChild(link);
    });
  }
}

// Auto-initialize resource hints
if (typeof document !== 'undefined') {
  CodeSplitter.injectResourceHints();
}
