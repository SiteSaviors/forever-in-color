import { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ProductHeroSection from '@/sections/ProductHeroSection';
import FounderNavigation from '@/components/navigation/FounderNavigation';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useStyleCatalogActions, useStyleCatalogState } from '@/store/hooks/useStyleCatalogStore';
import { useEntitlementsActions } from '@/store/hooks/useEntitlementsStore';
import InstantBreadthStrip from '@/sections/studio/InstantBreadthStrip';

const LaunchflowAccordionLazy = lazy(() => import('@/sections/LaunchpadLayout'));
const StudioConfiguratorLazy = lazy(() => import('@/sections/StudioConfigurator'));

const LaunchflowSkeleton = () => (
  <section className="border-b border-white/10 bg-slate-950/60 py-16">
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6">
      <div className="h-16 rounded-3xl bg-white/5 animate-pulse" />
    </div>
  </section>
);

const StudioConfiguratorSkeleton = () => (
  <section className="bg-slate-900 py-16">
    <div className="mx-auto flex max-w-[1800px] flex-col gap-6 px-6">
      <div className="h-10 w-48 rounded-full bg-white/5 animate-pulse" />
      <div className="h-[360px] rounded-[2.5rem] bg-white/5 animate-pulse" />
    </div>
  </section>
);

const StudioPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { preselectedStyleId } = useStyleCatalogState();
  const { setPreselectedStyle } = useStyleCatalogActions();
  const { hydrateEntitlements } = useEntitlementsActions();
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
    <LazyMotion features={domAnimation}>
      <div className="bg-slate-950 min-h-screen text-white">
        <FounderNavigation />
        <ProductHeroSection />
        <Suspense fallback={<LaunchflowSkeleton />}>
          <LaunchflowAccordionLazy />
        </Suspense>
        <Suspense fallback={<StudioConfiguratorSkeleton />}>
          <StudioConfiguratorLazy
            checkoutNotice={checkoutNotice}
            onDismissCheckoutNotice={() => setCheckoutNotice(null)}
          />
        </Suspense>
        <InstantBreadthStrip />
      </div>
    </LazyMotion>
  );
};

export default StudioPage;
