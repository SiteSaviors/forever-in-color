
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

// Performance utilities
import { CodeSplitter } from "./utils/codeSplitting";
import { ImageCompressor } from "./utils/imageCompression";
import { initializePerformanceMonitoring } from "./utils/performanceUtils";

// Code-split page imports with intelligent preloading
const Index = CodeSplitter.createRouteComponent(
  () => import("./pages/Index.tsx"),
  'home'
);

const Product = CodeSplitter.createRouteComponent(
  () => import("./pages/Product.tsx"),
  'product'
);

const PaymentSuccess = CodeSplitter.createRouteComponent(
  () => import("./pages/PaymentSuccess.tsx"),
  'payment-success'
);

const Auth = CodeSplitter.createRouteComponent(
  () => import("./pages/Auth.tsx"),
  'auth'
);

const NotFound = CodeSplitter.createRouteComponent(
  () => import("./pages/NotFound.tsx"),
  'not-found'
);

// Style pages with lazy loading
const ClassicOilPainting = CodeSplitter.createRouteComponent(
  () => import("./pages/ClassicOilPainting.tsx"),
  'classic-oil-painting'
);

const WatercolorDreams = CodeSplitter.createRouteComponent(
  () => import("./pages/WatercolorDreams.tsx"),
  'watercolor-dreams'
);

const PastelBliss = CodeSplitter.createRouteComponent(
  () => import("./pages/PastelBliss.tsx"),
  'pastel-bliss'
);

const GemstonePoly = CodeSplitter.createRouteComponent(
  () => import("./pages/GemstonePoly.tsx"),
  'gemstone-poly'
);

const ThreeDStorybook = CodeSplitter.createRouteComponent(
  () => import("./pages/ThreeDStorybook.tsx"),
  '3d-storybook'
);

const ArtisanCharcoal = CodeSplitter.createRouteComponent(
  () => import("./pages/ArtisanCharcoal.tsx"),
  'artisan-charcoal'
);

const PopArtBurst = CodeSplitter.createRouteComponent(
  () => import("./pages/PopArtBurst.tsx"),
  'pop-art-burst'
);

const NeonSplash = CodeSplitter.createRouteComponent(
  () => import("./pages/NeonSplash.tsx"),
  'neon-splash'
);

const ElectricBloom = CodeSplitter.createRouteComponent(
  () => import("./pages/ElectricBloom.tsx"),
  'electric-bloom'
);

const AbstractFusion = CodeSplitter.createRouteComponent(
  () => import("./pages/AbstractFusion.tsx"),
  'abstract-fusion'
);

const DecoLuxe = CodeSplitter.createRouteComponent(
  () => import("./pages/DecoLuxe.tsx"),
  'deco-luxe'
);

const OriginalStyle = CodeSplitter.createRouteComponent(
  () => import("./pages/OriginalStyle.tsx"),
  'original'
);

const ARExperience = CodeSplitter.createRouteComponent(
  () => import("./pages/ARExperience.tsx"),
  'ar-experience'
);

// Enhanced Query Client with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Service Worker registration
async function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
}

// Initialize performance monitoring and optimizations
function initializePerformanceOptimizations() {
  // Initialize performance monitoring
  initializePerformanceMonitoring();
  
  // Initialize image compression worker
  ImageCompressor.initWorker();
  
  // Preload critical feature bundles based on current route
  const currentPath = window.location.pathname;
  if (currentPath.includes('product')) {
    CodeSplitter.preloadFeatureBundle('photo-editing');
    CodeSplitter.preloadFeatureBundle('style-preview');
  }
  
  // Preload likely next routes
  const routeName = currentPath.slice(1) || 'home';
  CodeSplitter.preloadLikelyRoutes(routeName);
}

// App initialization
async function initializeApp() {
  // Register service worker first
  await registerServiceWorker();
  
  // Initialize performance optimizations
  initializePerformanceOptimizations();
  
  // Render app
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Index />} />
              <Route path="product" element={<Product />} />
              <Route path="payment-success" element={<PaymentSuccess />} />
              <Route path="auth" element={<Auth />} />
              
              {/* Style landing pages */}
              <Route path="classic-oil-painting" element={<ClassicOilPainting />} />
              <Route path="watercolor-dreams" element={<WatercolorDreams />} />
              <Route path="pastel-bliss" element={<PastelBliss />} />
              <Route path="gemstone-poly" element={<GemstonePoly />} />
              <Route path="3d-storybook" element={<ThreeDStorybook />} />
              <Route path="artisan-charcoal" element={<ArtisanCharcoal />} />
              <Route path="pop-art-burst" element={<PopArtBurst />} />
              <Route path="neon-splash" element={<NeonSplash />} />
              <Route path="electric-bloom" element={<ElectricBloom />} />
              <Route path="abstract-fusion" element={<AbstractFusion />} />
              <Route path="deco-luxe" element={<DecoLuxe />} />
              <Route path="original" element={<OriginalStyle />} />
              <Route path="ar-experience" element={<ARExperience />} />
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
}

// Start the app
initializeApp();
