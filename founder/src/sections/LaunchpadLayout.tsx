import { useEffect, useState } from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { emitStepOneEvent } from '@/utils/telemetry';
import PhotoUploader from '@/components/launchpad/PhotoUploader';
import AccountPromptModal from '@/components/modals/AccountPromptModal';

const LaunchpadLayout = () => {
  const uploadedImage = useFounderStore((state) => state.uploadedImage);
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const cropReadyAt = useFounderStore((state) => state.cropReadyAt);
  const accountPromptShown = useFounderStore((state) => state.accountPromptShown);
  const accountPromptTriggerAt = useFounderStore((state) => state.accountPromptTriggerAt);
  const [showAccountModal, setShowAccountModal] = useState(false);

  useEffect(() => {
    emitStepOneEvent({ type: 'substep', value: 'upload' });
  }, []);

  useEffect(() => {
    if (!accountPromptTriggerAt) return;
    const delay = Math.max(0, accountPromptTriggerAt + 2000 - Date.now());
    const timer = window.setTimeout(() => setShowAccountModal(true), delay);
    return () => window.clearTimeout(timer);
  }, [accountPromptTriggerAt]);

  useEffect(() => {
    if (!accountPromptShown) {
      setShowAccountModal(false);
    }
  }, [accountPromptShown]);

  const hasImage = !!uploadedImage;
  const hasCrop = !!croppedImage;

  const scrollToStudio = () => {
    const studioSection = document.querySelector('[data-studio-section]');
    if (studioSection) {
      studioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="bg-slate-900 min-h-screen relative" id="launchpad">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-indigo" />
              <span className="text-sm text-brand-indigo uppercase tracking-[0.3em]">Launchpad</span>
            </div>
          </div>
          <div className="text-white/70 text-sm">
            {hasCrop ? 'Ready to customize' : hasImage ? 'Photo uploaded' : 'Upload your photo'}
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Start Your Masterpiece
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Upload your favorite photo and watch it transform into stunning art in seconds
          </p>
        </div>

        {/* Photo Uploader - Takes full focus */}
        <div className="mb-8">
          <PhotoUploader />
        </div>

        {/* Helper Text */}
        {!hasImage && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>JPG or PNG</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Max 10MB</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Instant previews</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">Drag & Drop or Click</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
            </div>
          </div>
        )}

        {/* Success State - After crop ready */}
        {hasCrop && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border border-emerald-400/30 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Photo ready!</p>
                  <p className="text-xs text-white/60 mt-0.5">Your image has been perfectly cropped and optimized</p>
                </div>
              </div>
              <button
                onClick={scrollToStudio}
                className="px-6 py-3 rounded-xl bg-gradient-cta text-white font-bold text-sm shadow-glow-purple hover:shadow-glow-purple hover:scale-105 transition-all"
              >
                Continue to Studio →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Prompt Modal */}
      <AccountPromptModal open={showAccountModal} onClose={() => setShowAccountModal(false)} />
    </section>
  );
};

export default LaunchpadLayout;
