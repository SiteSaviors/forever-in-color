import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import LaunchpadLayout from '@/sections/LaunchpadLayout';
import StudioConfigurator from '@/sections/StudioConfigurator';
import ProductHeroSection from '@/sections/ProductHeroSection';
import { useFounderStore } from '@/store/useFounderStore';
import FounderNavigation from '@/components/navigation/FounderNavigation';

const StudioPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const preselectedStyleId = useFounderStore((state) => state.preselectedStyleId);
  const setPreselectedStyle = useFounderStore((state) => state.setPreselectedStyle);

  useEffect(() => {
    const queryValue = searchParams.get('preselected_style');
    const stateValue = (location.state as { preselectedStyle?: string } | undefined)?.preselectedStyle;
    const candidate = (queryValue ?? stateValue ?? '').trim();
    if (!candidate) return;

    const normalized = candidate.toLowerCase();
    if (preselectedStyleId && preselectedStyleId === normalized) return;

    setPreselectedStyle(normalized);
  }, [location.state, preselectedStyleId, searchParams, setPreselectedStyle]);

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <FounderNavigation />
      <ProductHeroSection />
      <LaunchpadLayout />
      <StudioConfigurator />
    </div>
  );
};

export default StudioPage;
