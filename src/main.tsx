import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './styles/tailwind.css';
import AppShellSkeleton from '@/components/skeletons/AppShellSkeleton';
import StudioShellSkeleton from '@/components/skeletons/StudioShellSkeleton';
import StudioProviders from '@/routes/StudioProviders';
import AuthProvider from '@/providers/AuthProvider';

const MarketingRoutes = lazy(() => import('@/routes/MarketingRoutes'));
const StudioRoutes = lazy(() => import('@/routes/StudioRoutes'));

const MarketingContainer = () => (
  <AuthProvider>
    <Suspense fallback={<AppShellSkeleton />}>
      <MarketingRoutes />
    </Suspense>
  </AuthProvider>
);

const StudioContainer = () => (
  <StudioProviders>
    <Suspense fallback={<StudioShellSkeleton />}>
      <StudioRoutes />
    </Suspense>
  </StudioProviders>
);

const App = () => {
  return (
    <Routes>
      <Route path="/create/*" element={<StudioContainer />} />
      <Route path="/studio/usage/*" element={<StudioContainer />} />
      <Route path="/checkout/*" element={<StudioContainer />} />
      <Route path="/*" element={<MarketingContainer />} />
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
