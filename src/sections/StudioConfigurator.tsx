import { Suspense, lazy, useCallback } from 'react';
import { OrientationBridgeProvider } from '@/components/studio/orientation/OrientationBridgeProvider';
import { useStudioFeedback } from '@/hooks/useStudioFeedback';
import type { CheckoutNotice } from '@/sections/studio/components/StudioHeader';
import { StudioExperienceProvider } from '@/sections/studio/experience/context';

const StudioExperience = lazy(() => import('@/sections/studio/experience/StudioExperience'));

type StudioConfiguratorProps = {
  checkoutNotice?: CheckoutNotice | null;
  onDismissCheckoutNotice?: () => void;
};

const StudioSkeleton = () => (
  <section className="bg-slate-900" data-studio-section id="studio">
    <div className="mx-auto flex max-w-[1800px] flex-col gap-6 px-4 py-10 lg:flex-row">
      <div className="hidden w-full max-w-[280px] space-y-4 lg:block">
        <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="h-6 w-52 animate-pulse rounded-full bg-white/10" />
        <div className="h-[420px] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      </div>
      <div className="flex-1 space-y-6">
        <div className="h-12 w-64 animate-pulse rounded-full bg-white/10" />
        <div className="h-[420px] animate-pulse rounded-[2.5rem] border border-white/10 bg-white/5" />
      </div>
      <div className="hidden w-full max-w-[310px] space-y-4 lg:block">
        <div className="h-6 w-48 animate-pulse rounded-full bg-white/10" />
        <div className="h-6 w-40 animate-pulse rounded-full bg-white/5" />
        <div className="h-[420px] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      </div>
    </div>
  </section>
);

const StudioConfigurator = ({ checkoutNotice, onDismissCheckoutNotice }: StudioConfiguratorProps) => {
  const { showToast, showUpgradeModal, renderFeedback } = useStudioFeedback();

  const handleOrientationToast = useCallback(
    (orientationLabel: string) => {
      showToast({
        title: `${orientationLabel} crop ready`,
        description: 'Preview updated to match your new orientation.',
        variant: 'success',
        duration: 2800,
      });
    },
    [showToast]
  );

  return (
    <OrientationBridgeProvider onOrientationToast={handleOrientationToast}>
      <StudioExperienceProvider value={{ showToast, showUpgradeModal, renderFeedback }}>
        <Suspense fallback={<StudioSkeleton />}>
          <StudioExperience
            checkoutNotice={checkoutNotice}
            onDismissCheckoutNotice={onDismissCheckoutNotice}
          />
        </Suspense>
      </StudioExperienceProvider>
    </OrientationBridgeProvider>
  );
};

export default StudioConfigurator;
