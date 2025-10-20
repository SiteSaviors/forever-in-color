import { lazy, type ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));

const MarketingRoutes = (): ReactElement => {
  const element = useRoutes([
    { path: '/', element: <LandingPage /> },
    { path: '/pricing', element: <PricingPage /> },
    { path: '/studio/gallery', element: <GalleryPage /> },
    { path: '*', element: <LandingPage /> },
  ]);

  return element ?? <LandingPage />;
};

export default MarketingRoutes;
