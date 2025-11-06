import { Suspense, lazy } from 'react';
import { useStudioExperienceContext } from '@/sections/studio/experience/context';
import { useStudioPreviewState } from '@/store/hooks/studio/useStudioPreviewState';
import { useStudioEntitlementState } from '@/store/hooks/studio/useStudioEntitlementState';

const InsightsRailLazy = lazy(() => import('@/components/studio/InsightsRail'));

const InsightsRailFallback = () => (
  <aside className="w-full px-4 py-6 lg:w-[360px] lg:flex-shrink-0 lg:p-6">
    <div className="space-y-4">
      <div className="h-6 w-48 animate-pulse rounded-full bg-white/10" />
      <div className="h-4 w-64 animate-pulse rounded-full bg-white/5" />
      <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
    </div>
  </aside>
);

type RightRailProps = {
  onRequestCanvas: (source: 'center' | 'rail') => void;
};

const RightRail = ({ onRequestCanvas }: RightRailProps) => {
  const { showToast, showUpgradeModal } = useStudioExperienceContext();
  const { currentStyle, hasCroppedImage, orientation, preview } = useStudioPreviewState();
  const { entitlements } = useStudioEntitlementState();

  const previewUrl = preview?.data?.previewUrl ?? null;
  const previewReadyWithUrl = preview?.status === 'ready' && Boolean(previewUrl);

  return (
    <Suspense fallback={<InsightsRailFallback />}>
      <InsightsRailLazy
        hasCroppedImage={hasCroppedImage}
        currentStyle={currentStyle ?? null}
        entitlements={entitlements}
        previewReady={previewReadyWithUrl}
        previewUrl={previewUrl}
        orientation={orientation}
        onRequestCanvas={onRequestCanvas}
        onToast={showToast}
        onGatePrompt={showUpgradeModal}
      />
    </Suspense>
  );
};

export default RightRail;
