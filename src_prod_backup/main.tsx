
import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

// Import pages
import Index from "./pages/Index.tsx";

const Product = lazy(() => import("./pages/Product"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Style pages
const ClassicOilPainting = lazy(() => import("./pages/ClassicOilPainting"));
const WatercolorDreams = lazy(() => import("./pages/WatercolorDreams"));
const PastelBliss = lazy(() => import("./pages/PastelBliss"));
const GemstonePoly = lazy(() => import("./pages/GemstonePoly"));
const ThreeDStorybook = lazy(() => import("./pages/ThreeDStorybook"));
const ArtisanCharcoal = lazy(() => import("./pages/ArtisanCharcoal"));
const PopArtBurst = lazy(() => import("./pages/PopArtBurst"));
const NeonSplash = lazy(() => import("./pages/NeonSplash"));
const ElectricBloom = lazy(() => import("./pages/ElectricBloom"));
const AbstractFusion = lazy(() => import("./pages/AbstractFusion"));
const DecoLuxe = lazy(() => import("./pages/DecoLuxe"));
const OriginalStyle = lazy(() => import("./pages/OriginalStyle"));
const ARExperience = lazy(() => import("./pages/ARExperience"));

const queryClient = new QueryClient();

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
