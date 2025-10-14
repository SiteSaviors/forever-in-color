import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import LaunchpadLayout from '@/sections/LaunchpadLayout';
import StudioConfigurator from '@/sections/StudioConfigurator';
import ProductHeroSection from '@/sections/ProductHeroSection';
import { useFounderStore } from '@/store/useFounderStore';
import FounderNavigation from '@/components/navigation/FounderNavigation';

const StudioPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedStyleId = useFounderStore((state) => state.preselectedStyleId);
  const setPreselectedStyle = useFounderStore((state) => state.setPreselectedStyle);
  const hydrateEntitlements = useFounderStore((state) => state.hydrateEntitlements);
  const [checkoutNotice, setCheckoutNotice] = useState<{ variant: 'success' | 'warning'; message: string } | null>(null);

  useEffect(() => {
    const queryValue = searchParams.get('preselected_style');
    const stateValue = (location.state as { preselectedStyle?: string } | undefined)?.preselectedStyle;
    const candidate = (queryValue ?? stateValue ?? '').trim();
    if (!candidate) return;

    const normalized = candidate.toLowerCase();
    if (preselectedStyleId && preselectedStyleId === normalized) return;

    setPreselectedStyle(normalized);
  }, [location.state, preselectedStyleId, searchParams, setPreselectedStyle]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutStatus = params.get('checkout');

    if (checkoutStatus === 'success') {
      setCheckoutNotice({
        variant: 'success',
        message: 'Order confirmed! Your Wondertone receipt is on the way.',
      });
      void hydrateEntitlements();
    } else if (checkoutStatus === 'cancelled') {
      setCheckoutNotice({
        variant: 'warning',
        message: 'Checkout was cancelled. Adjust your canvas and try again whenever you’re ready.',
      });
    }

    if (checkoutStatus) {
      params.delete('checkout');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.pathname, location.search, hydrateEntitlements, navigate]);

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <FounderNavigation />
      <ProductHeroSection />
      <LaunchpadLayout />
      <StudioConfigurator
        checkoutNotice={checkoutNotice}
        onDismissCheckoutNotice={() => setCheckoutNotice(null)}
      />
    </div>
  );
};

export default StudioPage;
