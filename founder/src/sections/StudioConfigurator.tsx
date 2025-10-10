import Section from '@/components/layout/Section';
import { useFounderStore, StylePreviewStatus } from '@/store/useFounderStore';
import StickyOrderRail from '@/components/studio/StickyOrderRail';
import LivingCanvasModal from '@/components/studio/LivingCanvasModal';
import CanvasInRoomPreview from '@/components/studio/CanvasInRoomPreview';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';
import StyleForgeOverlay from '@/components/studio/StyleForgeOverlay';

const StudioConfigurator = () => {
  const styles = useFounderStore((state) => state.styles);
  const selectedStyleId = useFounderStore((state) => state.selectedStyleId);
  const selectStyle = useFounderStore((state) => state.selectStyle);
  const previews = useFounderStore((state) => state.previews);
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const preview = currentStyle ? previews[currentStyle.id] : undefined;
  const generationCount = useFounderStore((state) => state.generationCount);
  const getGenerationLimit = useFounderStore((state) => state.getGenerationLimit);
  const canGenerateMore = useFounderStore((state) => state.canGenerateMore);
  const setPreviewState = useFounderStore((state) => state.setPreviewState);
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const orientation = useFounderStore((state) => state.orientation);
  const orientationChanging = useFounderStore((state) => state.orientationChanging);
  const pendingStyleId = useFounderStore((state) => state.pendingStyleId);
  const stylePreviewStatus = useFounderStore((state) => state.stylePreviewStatus);
  const stylePreviewMessage = useFounderStore((state) => state.stylePreviewMessage);
  const stylePreviewError = useFounderStore((state) => state.stylePreviewError);
  const startStylePreview = useFounderStore((state) => state.startStylePreview);
  const cachedPreviewEntry = useFounderStore((state) => {
    const styleId = state.selectedStyleId;
    if (!styleId) return null;
    return state.stylePreviewCache[styleId]?.[state.orientation] ?? null;
  });
  const orientationMeta = ORIENTATION_PRESETS[orientation];

  const handleStyleClick = (styleId: string) => {
    selectStyle(styleId);
    const style = styles.find((item) => item.id === styleId);
    if (!style) return;

    if (style.id === 'original-image' && croppedImage) {
      setPreviewState('original-image', {
        status: 'ready',
        data: {
          previewUrl: croppedImage,
          watermarkApplied: false,
          startedAt: Date.now(),
          completedAt: Date.now(),
        },
      });
      return;
    }

    if (!canGenerateMore()) {
      return;
    }

    void startStylePreview(style);
  };

  const limit = getGenerationLimit();
  const remaining = limit === Infinity ? '∞' : Math.max(0, limit - generationCount);
  type OverlayStatus = Exclude<StylePreviewStatus, 'idle'>;
  const overlayStatus: OverlayStatus = stylePreviewStatus === 'idle' ? 'animating' : stylePreviewStatus;
  const canRefreshPreview =
    Boolean(currentStyle) &&
    currentStyle?.id !== 'original-image' &&
    !pendingStyleId &&
    stylePreviewStatus === 'idle' &&
    Boolean(cachedPreviewEntry || preview?.status === 'ready');

  return (
    <section
      className="bg-slate-900 min-h-screen relative"
      data-studio-section
      data-founder-anchor="studio"
      id="studio"
    >
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-indigo" />
              <span className="text-sm text-brand-indigo uppercase tracking-[0.3em]">Studio</span>
            </div>
          </div>
          <div className="text-white/70 text-sm">
            {currentStyle?.name || 'Select a style'}
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout: Left Sidebar | Center Canvas | Right Sidebar */}
      <div className="flex max-w-[1800px] mx-auto">
        {/* LEFT SIDEBAR: Style Selection (Fixed Width) */}
        <aside className="w-80 bg-slate-950/50 border-r border-white/10 h-screen sticky top-[57px] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-xl font-bold text-white">All Styles</h3>
              <p className="text-xs text-white/60 mt-1">Click to preview</p>
            </div>

            {/* Generation counter */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/70 mb-1">Generations Remaining</p>
              <p className="text-2xl font-bold text-white">{remaining} left today</p>
              <p className="text-xs text-white/60 mt-2">Create an account for 5 more</p>
            </div>

            {/* Style list */}
            <div className="space-y-3">
              {styles.map((style) => {
                const isSelected = style.id === selectedStyleId;
                const stylePreview = previews[style.id];
                const isReady = stylePreview?.status === 'ready';

                const isLocked = Boolean(pendingStyleId && pendingStyleId !== style.id) || stylePreviewStatus === 'error' && pendingStyleId !== style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleClick(style.id)}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
                        : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={style.thumbnail} alt={style.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-500/40">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white">{style.name}</p>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">{style.description}</p>
                      {isReady && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-green-400 font-semibold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Cached
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Upgrade CTA */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/30">
              <p className="text-sm font-semibold text-white mb-2">Want unlimited generations?</p>
              <p className="text-xs text-white/70 mb-3">Upgrade to Creator for unlimited style switching</p>
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-cta text-white text-sm font-bold shadow-glow-purple hover:shadow-glow-purple transition">
                Upgrade - $9.99/mo
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER: Canvas Preview (Flexible) */}
        <main className="flex-1 p-8 flex flex-col items-center justify-start">
          <div className="w-full max-w-2xl mx-auto">
            {/* Canvas Preview */}
            <div
              className="relative rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-preview-bg shadow-2xl transition-all mx-auto"
              style={{
                aspectRatio: orientationMeta.ratio,
                maxHeight: orientation === 'vertical' ? '85vh' : undefined
              }}
            >
              {canRefreshPreview && currentStyle && (
                <button
                  type="button"
                  onClick={() => void startStylePreview(currentStyle, { force: true })}
                  className="absolute right-4 top-4 z-30 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Refresh Preview
                </button>
              )}

              {stylePreviewStatus !== 'idle' && (
                <StyleForgeOverlay
                  status={overlayStatus}
                  styleName={pendingStyleId ? styles.find((style) => style.id === pendingStyleId)?.name ?? 'Selected Style' : currentStyle?.name ?? 'Selected Style'}
                  message={stylePreviewMessage}
                  isError={stylePreviewStatus === 'error'}
                  errorMessage={stylePreviewError}
                />
              )}
              {/* Orientation changing overlay */}
              {orientationChanging && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    <p className="text-white text-sm font-medium">Updating orientation...</p>
                  </div>
                </div>
              )}

              {preview?.status === 'loading' && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                  <div className="absolute inset-0 preview-skeleton" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    <p className="text-white mt-4 text-sm">Creating your masterpiece...</p>
                  </div>
                </div>
              )}

              {preview?.status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-red-500/10 border-2 border-red-400/30">
                  <svg className="w-12 h-12 text-red-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-base font-semibold text-red-300">Preview generation failed</p>
                  <p className="text-sm text-white/60 mt-1">Try selecting a different style</p>
                </div>
              )}

              {preview?.data?.previewUrl || currentStyle?.preview ? (
                <img
                  src={preview?.data?.previewUrl ?? currentStyle?.preview}
                  alt="Canvas preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-center p-8">
                  <div>
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">Select a style from the left to see your transformed image</p>
                  </div>
                </div>
              )}

              <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 backdrop-blur">
                {orientationMeta.label}
              </div>

              {/* Ready Badge */}
              {preview?.status === 'ready' && (
                <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-purple-500/95 text-white text-sm font-semibold shadow-glow-soft backdrop-blur-sm animate-scaleIn">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ready to print
                  </span>
                </div>
              )}

              {/* Watermark overlay (mock) */}
              {preview?.status === 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="text-white/20 text-6xl font-bold tracking-wider"
                    style={{ transform: 'rotate(-45deg)' }}
                  >
                    WONDERTONE
                  </div>
                </div>
              )}
            </div>

            {/* Canvas In Room Preview */}
            <div className="w-full max-w-2xl mt-12 hidden sm:block">
              <div className="mb-6 text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  See It In Your Space
                </h3>
                <p className="text-sm text-white/60 max-w-md mx-auto">
                  Visualize how your canvas will look in a real living room
                </p>
              </div>
              <CanvasInRoomPreview enableHoverEffect={true} showDimensions={false} />
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Options + Order Summary (Fixed Width) */}
        <aside className="w-[420px]">
          <div className="sticky top-[57px] p-6">
            <StickyOrderRail />
          </div>
        </aside>
      </div>

      {/* Living Canvas Modal */}
      <LivingCanvasModal />
    </section>
  );
};

export default StudioConfigurator;
