import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { StylePreviewStatus, StyleOption } from '@/store/useFounderStore';
import type { Orientation } from '@/utils/imageUtils';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import { ENABLE_STORY_LAYER } from '@/config/featureFlags';
import type { EntitlementState } from '@/store/founder/entitlementSlice';
import type { StudioToastPayload, UpgradePromptPayload } from '@/hooks/useStudioFeedback';
import StudioEmptyState from './StudioEmptyState';
import ConfidenceFooter from '@/components/studio/story-layer/ConfidenceFooter';
import { trackStoryCtaClick } from '@/utils/storyLayerAnalytics';
import ActionRow from '@/components/studio/ActionRow';

const CanvasInRoomPreview = lazy(() => import('@/components/studio/CanvasInRoomPreview'));
const StyleForgeOverlay = lazy(() => import('@/components/studio/StyleForgeOverlay'));
const StoryLayer = lazy(() => import('@/components/studio/story-layer/StoryLayer'));

const CanvasPreviewFallback = () => (
  <div className="w-full h-[360px] rounded-[2.5rem] bg-slate-800/60 border border-white/10 animate-pulse" />
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
  orientationMismatch: boolean;
  previewOrientationLabel: string | null;
  croppedImage: string | null;
  currentStyle?: StyleOption;
  onSaveToGallery: () => void;
  savingToGallery: boolean;
  savedToGallery: boolean;
  canRefreshPreview: boolean;
  onRefreshPreview: () => void;
  launchpadExpanded: boolean;
  onOpenLaunchflow: () => void;
  onBrowseStyles: () => void;
  entitlements?: EntitlementState;
  onStoryToast?: (payload: StudioToastPayload) => void;
  onStoryUpgradePrompt?: (payload: UpgradePromptPayload) => void;
  onStoryCreateCanvas?: () => void;
  // ActionRow props
  onDownloadClick: () => void;
  downloadingHD: boolean;
  isPremiumUser: boolean;
  canvasConfigExpanded: boolean;
  onCanvasConfigToggle: () => void;
  downloadDisabled?: boolean;
  canvasLocked?: boolean;
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
  orientationMismatch,
  previewOrientationLabel,
  croppedImage,
  currentStyle,
  onSaveToGallery,
  savingToGallery,
  savedToGallery,
  canRefreshPreview,
  onRefreshPreview,
  launchpadExpanded,
  onOpenLaunchflow,
  onBrowseStyles,
  entitlements,
  onStoryToast,
  onStoryUpgradePrompt,
  onStoryCreateCanvas,
  onDownloadClick,
  downloadingHD,
  isPremiumUser,
  canvasConfigExpanded,
  onCanvasConfigToggle,
  downloadDisabled = false,
  canvasLocked = false,
}: CanvasPreviewPanelProps) => {
  const orientationMeta = ORIENTATION_PRESETS[orientation];
  const shouldRenderStoryLayer =
    ENABLE_STORY_LAYER &&
    previewStateStatus === 'ready' &&
    currentStyle &&
    currentStyle.id !== 'original-image' &&
    Boolean(displayPreviewUrl) &&
    Boolean(entitlements);
  const storyLayerOrientation = orientation as Orientation;

  const [showStoryHint, setShowStoryHint] = useState(false);
  const [storyLayerNode, setStoryLayerNode] = useState<HTMLDivElement | null>(null);

  const setStoryLayerRef = useCallback((node: HTMLDivElement | null) => {
    setStoryLayerNode(node);
  }, []);

  useEffect(() => {
    if (!shouldRenderStoryLayer) {
      setShowStoryHint(false);
      return;
    }

    const timer = window.setTimeout(() => setShowStoryHint(true), 600);
    return () => window.clearTimeout(timer);
  }, [shouldRenderStoryLayer]);

  useEffect(() => {
    if (!shouldRenderStoryLayer || !storyLayerNode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowStoryHint(false);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(storyLayerNode);
    return () => observer.disconnect();
  }, [shouldRenderStoryLayer, storyLayerNode]);

  useEffect(() => {
    if (!showStoryHint) return;
    const timer = window.setTimeout(() => setShowStoryHint(false), 8000);
    return () => window.clearTimeout(timer);
  }, [showStoryHint]);

  const analyticsContext = useMemo(() => {
    if (!currentStyle || !entitlements) return null;
    return {
      styleId: currentStyle.id,
      tone: currentStyle.tone ?? null,
      userTier: entitlements.tier,
      orientation,
    } as const;
  }, [currentStyle, entitlements, orientation]);

  const handleConfidenceUnlock = useCallback(() => {
    onStoryUpgradePrompt?.({
      title: 'Unlock the Full Studio',
      description: 'Upgrade for premium styles, watermark-free downloads, and creator-only Wondertone benefits.',
      ctaLabel: 'View Plans',
    });
    if (analyticsContext) {
      trackStoryCtaClick({ ...analyticsContext, cta: 'unlock_studio' });
    }
  }, [analyticsContext, onStoryUpgradePrompt]);

  const handleConfidenceCreate = useCallback(() => {
    onStoryCreateCanvas?.();
    if (analyticsContext) {
      trackStoryCtaClick({ ...analyticsContext, cta: 'create_canvas' });
    }
  }, [analyticsContext, onStoryCreateCanvas]);

  return (
    <main className="w-full lg:flex-1 px-4 py-6 lg:p-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-preview-bg shadow-2xl transition-all mx-auto"
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
          <div className="mt-6 w-full max-w-2xl">
            <ActionRow
              onDownloadClick={onDownloadClick}
              onCanvasClick={onCanvasConfigToggle}
              downloadingHD={downloadingHD}
              isPremiumUser={isPremiumUser}
              canvasConfigExpanded={canvasConfigExpanded}
              downloadDisabled={downloadDisabled}
              canvasLocked={canvasLocked}
              onSaveToGallery={onSaveToGallery}
              savingToGallery={savingToGallery}
              savedToGallery={savedToGallery}
            />
          </div>
        )}
      </div>

      <div className="hidden lg:block w-full max-w-2xl mt-8">
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

      {shouldRenderStoryLayer && entitlements && (
        <div className="w-full max-w-2xl mt-10">
          <ConfidenceFooter onUnlock={handleConfidenceUnlock} onCreateCanvas={handleConfidenceCreate} />
        </div>
      )}

      {shouldRenderStoryLayer && displayPreviewUrl && currentStyle && entitlements && (
        <div className="w-full max-w-2xl mt-12">
          {showStoryHint && (
            <div
              className="mb-6 flex justify-center motion-safe:animate-bounce-subtle"
              aria-hidden="true"
            >
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 shadow-glow-soft">
                Discover the story
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 14a1 1 0 01-.7-.29l-4-4a1 1 0 011.4-1.42L10 11.59l3.3-3.3a1 1 0 111.4 1.42l-4 4A1 1 0 0110 14z" />
                </svg>
              </div>
            </div>
          )}
          <Suspense fallback={null}>
            <StoryLayer
              ref={setStoryLayerRef}
              style={currentStyle}
              previewUrl={displayPreviewUrl}
              croppedImage={croppedImage}
              orientation={storyLayerOrientation}
              entitlements={entitlements}
              onToast={onStoryToast}
              onUpgradePrompt={onStoryUpgradePrompt}
            />
          </Suspense>
        </div>
      )}
    </main>
  );
};

export default CanvasPreviewPanel;
