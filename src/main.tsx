
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

// Import pages
import Index from "./pages/Index.tsx";
import Product from "./pages/Product.tsx";
import PaymentSuccess from "./pages/PaymentSuccess.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

// Style pages
import ClassicOilPainting from "./pages/ClassicOilPainting.tsx";
import WatercolorDreams from "./pages/WatercolorDreams.tsx";
import PastelBliss from "./pages/PastelBliss.tsx";
import GemstonePoly from "./pages/GemstonePoly.tsx";
import ThreeDStorybook from "./pages/ThreeDStorybook.tsx";
import ArtisanCharcoal from "./pages/ArtisanCharcoal.tsx";
import PopArtBurst from "./pages/PopArtBurst.tsx";
import NeonSplash from "./pages/NeonSplash.tsx";
import ElectricBloom from "./pages/ElectricBloom.tsx";
import AbstractFusion from "./pages/AbstractFusion.tsx";
import DecoLuxe from "./pages/DecoLuxe.tsx";
import OriginalStyle from "./pages/OriginalStyle.tsx";
import ARExperience from "./pages/ARExperience.tsx";

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
