import { Suspense, lazy } from 'react';
import { clsx } from 'clsx';
import { ENABLE_STUDIO_V2_INSIGHTS_RAIL } from '@/config/featureFlags';
import { useStudioExperienceContext } from '@/sections/studio/experience/context';
import { useStudioPreviewState } from '@/store/hooks/studio/useStudioPreviewState';
import { useStudioEntitlementState } from '@/store/hooks/studio/useStudioEntitlementState';

const StickyOrderRailLazy = lazy(() => import('@/components/studio/StickyOrderRail'));
const CanvasInRoomPreview = lazy(() => import('@/components/studio/CanvasInRoomPreview'));
const InsightsRailLazy = lazy(() => import('@/components/studio/InsightsRail'));

const CanvasPreviewFallback = () => (
  <div className="h-[360px] w-full animate-pulse rounded-[2.5rem] border border-white/10 bg-slate-800/60" />
);

const StickyOrderRailFallback = () => (
  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
    <div className="flex flex-col gap-4">
      <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-10 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-10 animate-pulse rounded-2xl bg-white/5" />
      </div>
      <div className="h-12 animate-pulse rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30" />
    </div>
  </div>
);

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
  onChangeOrientation: () => void;
  onCanvasConfigToggle: () => void;
  canvasConfigExpanded: boolean;
};

const RightRail = ({
  onRequestCanvas,
  onChangeOrientation: _onChangeOrientation,
  onCanvasConfigToggle: _onCanvasConfigToggle,
  canvasConfigExpanded,
}: RightRailProps) => {
  const { showToast, showUpgradeModal } = useStudioExperienceContext();
  const { currentStyle, hasCroppedImage, orientation, preview } = useStudioPreviewState();
  const { entitlements } = useStudioEntitlementState();

  const previewUrl = preview?.data?.previewUrl ?? null;
  const previewReadyWithUrl = preview?.status === 'ready' && Boolean(previewUrl);

  if (ENABLE_STUDIO_V2_INSIGHTS_RAIL) {
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
  }

  return (
    <aside
      className={clsx(
        'w-full transition-opacity duration-200 lg:w-[360px] lg:flex-shrink-0',
        !hasCroppedImage && 'pointer-events-none opacity-50'
      )}
      aria-disabled={!hasCroppedImage}
    >
      <div className="px-4 py-6 lg:sticky lg:top-[57px] lg:p-6">
        <div className="space-y-6 lg:max-h-[calc(100vh-88px)] lg:overflow-y-auto lg:pr-3 lg:-mr-3">
          {!hasCroppedImage && (
            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Upload a photo to customize canvas options and checkout.
            </div>
          )}
          <Suspense fallback={<StickyOrderRailFallback />}>
            <StickyOrderRailLazy
              canvasConfigExpanded={canvasConfigExpanded}
              mobileRoomPreview={
                <div className="w-full lg:hidden">
                  <div className="mb-4 space-y-1 px-4 text-center">
                    <h3 className="text-xl font-bold text-white">See It In Your Space</h3>
                    <p className="mx-auto max-w-md text-xs text-white/60">
                      Visualize how your canvas will look in a real living room
                    </p>
                  </div>
                  <Suspense fallback={<CanvasPreviewFallback />}>
                    <CanvasInRoomPreview showDimensions={false} />
                  </Suspense>
                </div>
              }
            />
          </Suspense>
        </div>
      </div>
    </aside>
  );
};

export default RightRail;
