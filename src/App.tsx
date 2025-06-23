
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Product from "@/pages/Product";
import Auth from "@/pages/Auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SessionTimeoutWarning from "@/components/auth/SessionTimeoutWarning";
import NotFound from "@/pages/NotFound";

// Style pages
import OriginalStyle from "@/pages/OriginalStyle";
import ClassicOilPainting from "@/pages/ClassicOilPainting";
import WatercolorDreams from "@/pages/WatercolorDreams";
import PopArtBurst from "@/pages/PopArtBurst";
import AbstractFusion from "@/pages/AbstractFusion";
import NeonSplash from "@/pages/NeonSplash";
import ArtisanCharcoal from "@/pages/ArtisanCharcoal";
import ElectricBloom from "@/pages/ElectricBloom";
import PastelBliss from "@/pages/PastelBliss";
import DecoLuxe from "@/pages/DecoLuxe";
import GemstonePoly from "@/pages/GemstonePoly";
import ThreeDStorybook from "@/pages/ThreeDStorybook";
import ARExperience from "@/pages/ARExperience";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <SessionTimeoutWarning />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/product" element={<Product />} />
          
          {/* Style pages - public */}
          <Route path="/original" element={<OriginalStyle />} />
          <Route path="/classic-oil-painting" element={<ClassicOilPainting />} />
          <Route path="/watercolor-dreams" element={<WatercolorDreams />} />
          <Route path="/pop-art-burst" element={<PopArtBurst />} />
          <Route path="/abstract-fusion" element={<AbstractFusion />} />
          <Route path="/neon-splash" element={<NeonSplash />} />
          <Route path="/artisan-charcoal" element={<ArtisanCharcoal />} />
          <Route path="/electric-bloom" element={<ElectricBloom />} />
          <Route path="/pastel-bliss" element={<PastelBliss />} />
          <Route path="/deco-luxe" element={<DecoLuxe />} />
          <Route path="/gemstone-poly" element={<GemstonePoly />} />
          <Route path="/three-d-storybook" element={<ThreeDStorybook />} />
          <Route path="/ar-experience" element={<ARExperience />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
