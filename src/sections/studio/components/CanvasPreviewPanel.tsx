import { Suspense, lazy } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { EntitlementState, StylePreviewStatus, StyleOption } from '@/store/founder/storeTypes';
// Orientation type no longer needed in this module
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import StudioEmptyState from './StudioEmptyState';
import ActionGrid from '@/components/studio/ActionGrid';
import GalleryQuickview from '@/sections/studio/experience/GalleryQuickview';

const CanvasInRoomPreview = lazy(() => import('@/components/studio/CanvasInRoomPreview'));
const StyleForgeOverlay = lazy(() => import('@/components/studio/StyleForgeOverlay'));
// Center-rail narrative modules removed; keep only preview + selling points

const CanvasPreviewFallback = () => (
  <div className="w-full h-[360px] rounded-[2.5rem] bg-slate-800/60 border border-white/10 animate-pulse" />
);

const SellingPointsPanel = ({ onCreateCanvas }: { onCreateCanvas: () => void }) => (
  <div className="rounded-[32px] border border-white/12 bg-slate-950/65 px-8 py-10 shadow-[0_24px_80px_rgba(8,14,32,0.5)] backdrop-blur">
    <div className="flex flex-col gap-6 text-left md:flex-row md:items-center md:justify-between">
      <div className="space-y-4 md:max-w-md">
        <p className="text-xs uppercase tracking-[0.38em] text-white/45">Museum-Quality Art</p>
        <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
          Crafted to last a lifetime
        </h3>
        <ul className="space-y-4 text-sm text-white/75">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
            <span>Hand-stretched on gallery-grade frames with archival inks.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
            <span>Ships in 5 days with protective packaging and tracking.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
            <span>100% satisfaction guarantee—every canvas reprinted if needed.</span>
          </li>
        </ul>
      </div>
      <button
        type="button"
        onClick={onCreateCanvas}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-purple-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-glow-purple transition hover:shadow-glow-purple/70"
      >
        Create Canvas
      </button>
    </div>
  </div>
);

export type CanvasPreviewPanelProps = {
  overlayStyleName: string;
  overlayStatus: Exclude<StylePreviewStatus, 'idle'>;
  stylePreviewStatus: StylePreviewStatus;
  stylePreviewMessage: string | null;
  stylePreviewError: string | null;
  hasCroppedImage: boolean;
  displayPreviewUrl?: string;
  previewHasData: boolean;
  previewStateStatus?: 'idle' | 'loading' | 'ready' | 'error';
  orientation: keyof typeof ORIENTATION_PRESETS;
  orientationPreviewPending: boolean;
  orientationChanging: boolean;
  orientationMismatch: boolean;
  previewOrientationLabel: string | null;
  croppedImage: string | null;
  currentStyle?: StyleOption;
  onSaveToGallery: () => void;
  savingToGallery: boolean;
  savedToGallery: boolean;
  launchpadExpanded: boolean;
  onOpenLaunchflow: () => void;
  onBrowseStyles: () => void;
  // entitlements retained in signature historically, but not used in center rail now
  entitlements?: EntitlementState;
  // Action grid props
  onDownloadClick: () => void;
  downloadingHD: boolean;
  isPremiumUser: boolean;
  onCreateCanvas: () => void;
  onChangeOrientation: () => void;
  downloadDisabled?: boolean;
  canvasLocked?: boolean;
  previewLocked?: boolean;
};

const CanvasPreviewPanel = ({
  overlayStyleName,
  overlayStatus,
  stylePreviewStatus,
  stylePreviewMessage,
  stylePreviewError,
  hasCroppedImage,
  displayPreviewUrl,
  previewHasData,
  previewStateStatus,
  orientation,
  orientationPreviewPending,
  orientationChanging,
  orientationMismatch,
  previewOrientationLabel,
  croppedImage,
  currentStyle,
  onSaveToGallery,
  savingToGallery,
  savedToGallery,
  launchpadExpanded,
  onOpenLaunchflow,
  onBrowseStyles,
  // entitlements not used
  _entitlements,
  onDownloadClick,
  downloadingHD,
  isPremiumUser,
  onCreateCanvas,
  onChangeOrientation,
  downloadDisabled = false,
  canvasLocked = false,
  previewLocked = false,
}: CanvasPreviewPanelProps) => {
  const orientationMeta = ORIENTATION_PRESETS[orientation];
  const orientationActionDisabled =
    !hasCroppedImage || orientationPreviewPending || orientationChanging || previewLocked;
  const orientationDisabledReason = previewLocked
    ? 'Preview in progress – orientation controls will unlock once rendering completes.'
    : orientationPreviewPending || orientationChanging
    ? 'Orientation update already in progress'
    : !hasCroppedImage
    ? 'Upload & crop a photo first'
    : undefined;

  return (
    <main className="w-full lg:flex-1 lg:min-w-0 px-4 py-6 lg:p-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-[720px] mx-auto">
        {previewLocked && (
          <div
            className="mb-4 w-full rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            Wondertone is rendering your preview…
          </div>
        )}
        <div
          className="relative rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-preview-bg shadow-2xl transition-colors mx-auto"
          style={{
            aspectRatio: orientationMeta.ratio,
            maxHeight: orientation === 'vertical' ? '85vh' : undefined,
          }}
        >
          {hasCroppedImage ? (
            <>
              {stylePreviewStatus !== 'idle' && (
                <Suspense fallback={<div className="absolute inset-0" />}>
                  <StyleForgeOverlay
                    status={overlayStatus}
                    styleName={overlayStyleName}
                    message={stylePreviewMessage}
                    isError={stylePreviewStatus === 'error'}
                    errorMessage={stylePreviewError}
                  />
                </Suspense>
              )}

              {displayPreviewUrl ? (
                <img
                  src={displayPreviewUrl}
                  alt={currentStyle?.name ?? 'Preview'}
                  className="h-full w-full object-cover select-none"
                  onContextMenu={(event) => event.preventDefault()}
                  onDragStart={(event) => event.preventDefault()}
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-center p-8">
                  <div>
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Select a style from the left to see your transformed image</p>
                  </div>
                </div>
              )}

              <div className="absolute top-3 left-3 lg:top-6 lg:left-6 px-2 py-1 lg:px-4 lg:py-2 rounded-full bg-white/10 text-[10px] lg:text-xs font-semibold uppercase tracking-[0.2em] lg:tracking-[0.3em] text-white/80 backdrop-blur">
                {orientationMeta.label}
              </div>

              {stylePreviewStatus === 'ready' && currentStyle && currentStyle.id !== 'original-image' && !orientationPreviewPending && !orientationMismatch && (
                <div className="absolute top-3 right-3 lg:top-6 lg:right-6 px-2 py-1 lg:px-4 lg:py-2 rounded-full bg-purple-500/95 text-white text-xs lg:text-sm font-semibold shadow-glow-soft backdrop-blur-sm animate-scaleIn">
                  <span className="flex items-center gap-1 lg:gap-2">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hidden sm:inline">Ready to print</span>
                    <span className="sm:hidden">Ready</span>
                  </span>
                </div>
              )}

              {orientationPreviewPending && (
                <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur animate-pulse">
                  Adapting to {orientationMeta.label}
                </div>
              )}

              {!orientationPreviewPending && orientationMismatch && previewOrientationLabel && (
                <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-amber-500/90 text-slate-900 text-xs font-semibold shadow-glow-soft backdrop-blur-sm">
                  {`Preview uses ${previewOrientationLabel} crop • Refresh to update`}
                </div>
              )}

              {!previewHasData && croppedImage && (
                <div className="pointer-events-none absolute bottom-6 left-1/2 w-[90%] max-w-sm -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/70 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  Choose a style to transform your photo
                </div>
              )}
            </>
          ) : (
            <StudioEmptyState
              onUpload={onOpenLaunchflow}
              onBrowseStyles={onBrowseStyles}
              launchflowOpen={launchpadExpanded}
            />
          )}
        </div>

        {previewStateStatus === 'ready' && currentStyle && (
          <div className="mt-6 w-full max-w-[720px]">
            <ActionGrid
              onDownload={onDownloadClick}
              onCreateCanvas={onCreateCanvas}
              onChangeOrientation={onChangeOrientation}
              onSaveToGallery={onSaveToGallery}
              downloading={downloadingHD}
              downloadDisabled={downloadDisabled}
              createCanvasDisabled={canvasLocked}
              orientationDisabled={orientationActionDisabled}
              orientationDisabledReason={orientationDisabledReason}
              savingToGallery={savingToGallery}
              savedToGallery={savedToGallery}
              isPremiumUser={isPremiumUser}
              orientationLabel={orientationMeta.label}
            />
          </div>
        )}

        <GalleryQuickview />
      </div>

      <div className="hidden lg:block w-full max-w-[720px] mt-8">
        <div className="mb-6 text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">See It In Your Space</h3>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            Visualize how your canvas will look in a real living room
          </p>
        </div>
        <Suspense fallback={<CanvasPreviewFallback />}>
          <CanvasInRoomPreview enableHoverEffect showDimensions={false} />
        </Suspense>
      </div>

      {previewStateStatus === 'ready' && currentStyle && (
        <div className="w-full max-w-[720px] mt-8">
          <SellingPointsPanel onCreateCanvas={onCreateCanvas} />
        </div>
      )}

      {/* Center-rail story/narrative modules intentionally omitted */}
    </main>
  );
};

export default CanvasPreviewPanel;
