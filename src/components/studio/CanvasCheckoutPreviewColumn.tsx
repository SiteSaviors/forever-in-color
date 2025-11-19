import { memo, Suspense, lazy, useMemo, useRef } from 'react';
import { clsx } from 'clsx';
import { useCanvasConfigState } from '@/store/hooks/useFounderCanvasStore';
import { useUploadState } from '@/store/hooks/useUploadStore';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import TrustSignal from '@/components/checkout/TrustSignals';
import CanvasQualityAssurance from '@/components/studio/CanvasQualityAssurance';
import { CANVAS_PREVIEW_ASSETS } from '@/utils/canvasPreviewAssets';
import type { StyleOption } from '@/store/founder/storeTypes';

const CanvasInRoomPreview = lazy(() => import('@/components/studio/CanvasInRoomPreview'));

type CanvasCheckoutPreviewColumnProps = {
  currentStyle?: StyleOption;
  triggerFrameShimmer: boolean;
  isSuccessStep: boolean;
  showStaticTestimonials: boolean;
  previewRoomAssetSrc?: string;
  previewArtRectPct?: ArtRect;
};

const CanvasCheckoutPreviewColumnComponent = ({
  currentStyle,
  triggerFrameShimmer,
  isSuccessStep,
  showStaticTestimonials,
  previewRoomAssetSrc,
  previewArtRectPct,
}: CanvasCheckoutPreviewColumnProps) => {
  const { selectedCanvasSize, selectedFrame } = useCanvasConfigState((state) => ({
    selectedCanvasSize: state.selectedCanvasSize,
    selectedFrame: state.selectedFrame,
  }));
  const { orientationPreviewPending } = useUploadState();
  const previewHeaderRef = useRef<HTMLDivElement>(null);
  const showStickyGuarantee = useScrollVisibility(previewHeaderRef, 0.65);

  const previewAsset = useMemo(() => {
    if (!selectedCanvasSize) return null;
    return CANVAS_PREVIEW_ASSETS[selectedCanvasSize] ?? null;
  }, [selectedCanvasSize]);

  const frameKey = selectedFrame ?? 'none';

  const derivedRoomSrc = useMemo(() => {
    if (!previewAsset) return undefined;
    return previewAsset.roomSrc[frameKey] ?? previewAsset.roomSrc.none;
  }, [previewAsset, frameKey]);

  const derivedArtRect = useMemo(() => {
    if (!previewAsset) return undefined;
    return previewAsset.artRectPct[frameKey] ?? previewAsset.artRectPct.none;
  }, [previewAsset, frameKey]);

  const roomAssetSrc = previewRoomAssetSrc ?? derivedRoomSrc;
  const artRectPct = previewArtRectPct ?? derivedArtRect;

  return (
    <div className="hidden w-full border-b border-white/10 bg-slate-950/80 px-6 py-8 lg:block lg:w-[44%] lg:border-b-0 lg:border-r lg:max-h-[80vh] lg:overflow-y-auto scrollbar-hide">
      <div className="space-y-6">
        <div ref={previewHeaderRef} className="flex items-center gap-3">
          {currentStyle?.thumbnail ? (
            <img
              src={currentStyle.thumbnail}
              alt={`${currentStyle.name} thumbnail`}
              className="h-12 w-12 rounded-2xl border border-white/15 object-cover"
            />
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">Current Style</p>
            <p className="text-base font-semibold text-white">
              {currentStyle?.name ?? 'Wondertone Canvas'}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className={clsx('relative', triggerFrameShimmer && 'frame-shimmer')}>
            <Suspense fallback={<div className="h-64 rounded-3xl bg-white/5" />}>
              <CanvasInRoomPreview
                enableHoverEffect
                showDimensions={false}
                customRoomAssetSrc={roomAssetSrc}
                customArtRectPct={artRectPct}
              />
            </Suspense>
            {orientationPreviewPending && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-950/70 text-sm font-semibold text-white/80">
                Adapting preview…
              </div>
            )}
            {isSuccessStep && !orientationPreviewPending && (
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80 p-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-[0_0_25px_rgba(16,185,129,0.45)]">
                  <span className="text-[10px]">✦</span> Ordered & in production
                </div>
                <p className="text-xs text-white/80">Tracking will arrive once it ships.</p>
              </div>
            )}
          </div>

          {showStaticTestimonials && (
            <CanvasQualityAssurance
              className="mt-8"
              productionImages={{
                canvasTexture: '/images/quality/canvas-texture.webp',
                handStretching: '/images/quality/hand-stretching.webp',
                backHardware: '/images/quality/back-hardware.webp',
              }}
            />
          )}

          <TrustSignal
            context="sticky_guarantee"
            style={{ opacity: showStickyGuarantee ? 1 : 0 }}
          />
        </div>
      </div>
    </div>
  );
};

const CanvasCheckoutPreviewColumn = memo(CanvasCheckoutPreviewColumnComponent);

export default CanvasCheckoutPreviewColumn;
