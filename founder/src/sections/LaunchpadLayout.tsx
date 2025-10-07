import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { useFounderStore } from '@/store/useFounderStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { emitStepOneEvent } from '@/utils/telemetry';
import PhotoUploader from '@/components/launchpad/PhotoUploader';
import ConfettiBurst from '@/components/launchpad/ConfettiBurst';
import AccountPromptModal from '@/components/modals/AccountPromptModal';

const LaunchpadLayout = () => {
  const styles = useFounderStore((state) => state.styles);
  const selectStyle = useFounderStore((state) => state.selectStyle);
  const generatePreviews = useFounderStore((state) => state.generatePreviews);
  const previewStatus = useFounderStore((state) => state.previewStatus);
  const previews = useFounderStore((state) => state.previews);
  const celebrationAt = useFounderStore((state) => state.celebrationAt);
  const uploadedImage = useFounderStore((state) => state.uploadedImage);
  const [confettiActive, setConfettiActive] = useState(false);
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const accountPromptShown = useFounderStore((state) => state.accountPromptShown);
  const shouldShowAccountPrompt = useFounderStore((state) => state.shouldShowAccountPrompt);
  const setAccountPromptShown = useFounderStore((state) => state.setAccountPromptShown);
  const incrementGenerationCount = useFounderStore((state) => state.incrementGenerationCount);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleStyleSelect = (id: string) => {
    selectStyle(id);
    emitStepOneEvent({ type: 'preview', styleId: id, status: 'generating' });

    // Increment generation counter when user selects a style
    incrementGenerationCount();

    void generatePreviews([id]).then(() => {
      emitStepOneEvent({ type: 'preview', styleId: id, status: 'ready' });

      // After generation completes, check if we should show account prompt
      // Delay by 2 seconds to not interrupt the WOW moment
      if (shouldShowAccountPrompt()) {
        setTimeout(() => {
          setAccountPromptShown(true);
          setShowAccountModal(true);
        }, 2000);
      }
    });
  };

  const previewTiles = useMemo(() => styles.slice(0, 4), [styles]);
  const currentPreviewState = currentStyle ? previews[currentStyle.id] : undefined;
  const statusLabel = currentPreviewState?.status === 'ready'
    ? 'Preview ready'
    : currentPreviewState?.status === 'loading' || previewStatus === 'generating'
      ? 'Generating…'
      : 'Awaiting upload';

  const lastStyleIdRef = useRef<string | null>(null);
  const lastPreviewStatusRef = useRef(previewStatus);

  useEffect(() => {
    emitStepOneEvent({ type: 'substep', value: 'upload' });
  }, []);

  useEffect(() => {
    if (currentStyle?.id && lastStyleIdRef.current !== currentStyle.id) {
      emitStepOneEvent({ type: 'substep', value: 'style-selection' });
      lastStyleIdRef.current = currentStyle.id;
    }
  }, [currentStyle?.id]);

  useEffect(() => {
    if (previewStatus === 'ready' && lastPreviewStatusRef.current !== 'ready') {
      emitStepOneEvent({ type: 'substep', value: 'complete' });
    }
    lastPreviewStatusRef.current = previewStatus;
  }, [previewStatus]);

  useEffect(() => {
    if (!celebrationAt) return;
    setConfettiActive(true);
    const timer = window.setTimeout(() => setConfettiActive(false), 1500);
    return () => window.clearTimeout(timer);
  }, [celebrationAt]);

  return (
    <Section id="launchpad">
      <div className="flex items-center gap-3 text-sm text-brand-indigo uppercase tracking-[0.3em] mb-6">
        <span className="w-2 h-2 rounded-full bg-brand-indigo" /> Launchpad
      </div>
      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold">Step 1 • Upload & Choose Style</h2>
          <p className="text-white/70 text-lg max-w-3xl">
            The launchpad keeps upload, crop, and style exploration in one split view. As soon as you tap a style, the
            preview rail streams results with blur skeletons to eliminate dead time.
          </p>
          <div className="grid lg:grid-cols-2 gap-6">
            <PhotoUploader />
            <Card glass className="space-y-6 relative overflow-hidden">
              <ConfettiBurst active={confettiActive} />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Choose Your Style</h3>
                <p className="text-base text-white/80">
                  Watch your photo transform in real-time. Tap any style to see the magic happen.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {previewTiles.map((style) => {
                  const isSelected = currentStyle?.id === style.id;
                  const isReady = previews[style.id]?.status === 'ready';
                  const isLoading = previews[style.id]?.status === 'loading';
                  const isError = previews[style.id]?.status === 'error';

                  return (
                    <button
                      key={style.id}
                      onClick={() => handleStyleSelect(style.id)}
                      className={`relative h-48 rounded-2xl bg-gradient-preview-bg border-2 transition-all duration-300 overflow-hidden group ${
                        isSelected
                          ? 'border-purple-400 shadow-glow-purple scale-[1.02]'
                          : 'border-white/20 hover:border-white/40 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        {isLoading && (
                          <div className="absolute inset-0 preview-skeleton" />
                        )}
                        <div className="relative z-10 text-center">
                          <p className="text-base font-semibold text-white mb-1">{style.name}</p>
                          {isReady && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/80 text-white text-xs font-medium animate-scaleIn">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Ready
                            </span>
                          )}
                          {isLoading && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs">
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Transforming...
                            </span>
                          )}
                          {isError && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/80 text-white text-xs font-medium">
                              Error
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-purple-400 rounded-2xl animate-pulseGlow pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
              {previewStatus === 'ready' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 animate-fadeIn">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-glow-soft">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Your preview is ready!</p>
                    <p className="text-xs text-white/70">Continue to customize and checkout</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
        <aside className="glass-card backdrop-blur-md space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Your Creation</h3>
            <p className="text-sm text-white/70">Ready to bring your art to life</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/70">Photo</span>
              <span className="text-sm font-medium text-white">
                {uploadedImage ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Uploaded
                  </span>
                ) : (
                  'Awaiting upload'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/70">Style</span>
              <span className="text-sm font-medium text-white">{currentStyle?.name ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white/70">Status</span>
              <span className="text-sm font-medium text-white">{statusLabel}</span>
            </div>
          </div>
          <button
            className={`w-full px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 ${
              previewStatus === 'ready'
                ? 'bg-gradient-cta text-white shadow-glow-purple hover:shadow-glow-purple hover:scale-[1.02]'
                : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
            }`}
            disabled={previewStatus !== 'ready'}
            onClick={() => emitStepOneEvent({ type: 'cta', value: 'continue-to-studio' })}
          >
            {previewStatus === 'ready' ? 'Customize Your Art →' : 'Generate Preview First'}
          </button>
          {previewStatus === 'ready' && (
            <div className="flex items-center gap-2 text-xs text-white/60 animate-fadeIn">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Continue to add enhancements and checkout
            </div>
          )}
        </aside>
      </div>

      {/* Account Prompt Modal - Shows after 3rd generation */}
      <AccountPromptModal
        open={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </Section>
  );
};

export default LaunchpadLayout;
