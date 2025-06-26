
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Index from "./pages/Index";
import Product from "./pages/Product";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

// Style landing pages
import OriginalStyle from "./pages/OriginalStyle";
import AbstractFusion from "./pages/AbstractFusion";
import ArtisanCharcoal from "./pages/ArtisanCharcoal";
import ClassicOilPainting from "./pages/ClassicOilPainting";
import DecoLuxe from "./pages/DecoLuxe";
import ElectricBloom from "./pages/ElectricBloom";
import GemstonePoly from "./pages/GemstonePoly";
import NeonSplash from "./pages/NeonSplash";
import PastelBliss from "./pages/PastelBliss";
import PopArtBurst from "./pages/PopArtBurst";
import ThreeDStorybook from "./pages/ThreeDStorybook";
import WatercolorDreams from "./pages/WatercolorDreams";
import ARExperience from "./pages/ARExperience";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "product",
        element: <Product />,
      },
      {
        path: "auth",
        element: <Auth />,
      },
      {
        path: "payment-success",
        element: <PaymentSuccess />,
      },
      // Style landing pages
      {
        path: "original",
        element: <OriginalStyle />,
      },
      {
        path: "abstract-fusion",
        element: <AbstractFusion />,
      },
      {
        path: "artisan-charcoal",
        element: <ArtisanCharcoal />,
      },
      {
        path: "classic-oil",
        element: <ClassicOilPainting />,
      },
      {
        path: "deco-luxe",
        element: <DecoLuxe />,
      },
      {
        path: "electric-bloom",
        element: <ElectricBloom />,
      },
      {
        path: "gemstone-poly",
        element: <GemstonePoly />,
      },
      {
        path: "neon-splash",
        element: <NeonSplash />,
      },
      {
        path: "pastel-bliss",
        element: <PastelBliss />,
      },
      {
        path: "pop-art-burst",
        element: <PopArtBurst />,
      },
      {
        path: "three-d-storybook",
        element: <ThreeDStorybook />,
      },
      {
        path: "watercolor-dreams",
        element: <WatercolorDreams />,
      },
      {
        path: "ar-experience",
        element: <ARExperience />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
