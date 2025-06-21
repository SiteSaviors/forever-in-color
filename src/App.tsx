
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
