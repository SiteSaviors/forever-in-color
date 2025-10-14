import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './styles/tailwind.css';
import LandingPage from './pages/LandingPage';
import StudioPage from './pages/StudioPage';
import PricingPage from './pages/PricingPage';
import UsagePage from './pages/UsagePage';
import GalleryPage from './pages/GalleryPage';
import AuthProvider from './providers/AuthProvider';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<StudioPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/studio/usage" element={<UsagePage />} />
      <Route path="/studio/gallery" element={<GalleryPage />} />
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
