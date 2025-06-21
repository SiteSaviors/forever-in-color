
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Product from "./pages/Product";
import ClassicOilPainting from "./pages/ClassicOilPainting";
import CalmWatercolor from "./pages/CalmWatercolor";
import WatercolorDreams from "./pages/WatercolorDreams";
import PastelBliss from "./pages/PastelBliss";
import ArtisanCharcoal from "./pages/ArtisanCharcoal";
import NeonSplash from "./pages/NeonSplash";
import PopArtBurst from "./pages/PopArtBurst";
import ElectricBloom from "./pages/ElectricBloom";
import ThreeDStorybook from "./pages/ThreeDStorybook";
import DecoLuxe from "./pages/DecoLuxe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product" element={<Product />} />
          <Route path="/art-styles/classic-oil-painting" element={<ClassicOilPainting />} />
          <Route path="/art-styles/calm-watercolor" element={<CalmWatercolor />} />
          <Route path="/art-styles/watercolor-dreams" element={<WatercolorDreams />} />
          <Route path="/art-styles/pastel-bliss" element={<PastelBliss />} />
          <Route path="/art-styles/artisan-charcoal" element={<ArtisanCharcoal />} />
          <Route path="/art-styles/neon-splash" element={<NeonSplash />} />
          <Route path="/art-styles/pop-art-burst" element={<PopArtBurst />} />
          <Route path="/art-styles/electric-bloom" element={<ElectricBloom />} />
          <Route path="/art-styles/3d-storybook" element={<ThreeDStorybook />} />
          <Route path="/art-styles/deco-luxe" element={<DecoLuxe />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
