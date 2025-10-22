import { RefObject, useEffect, useRef, useState } from 'react';
import { Download, Lock, ShoppingBag } from 'lucide-react';
import { useFounderStore } from '@/store/useFounderStore';
import { trackDownloadCTAClick, trackCanvasCTAClick, trackCanvasPanelOpen } from '@/utils/telemetry';

type ActionRowProps = {
  onDownloadClick: () => void;
  onCanvasClick: () => void;
  downloadingHD: boolean;
  isPremiumUser: boolean;
  canvasConfigExpanded: boolean;
  downloadDisabled?: boolean;
  canvasButtonDisabled?: boolean;
  canvasLocked?: boolean;
  canvasButtonRef?: RefObject<HTMLButtonElement>;
};

export default function ActionRow({
  onDownloadClick,
  onCanvasClick,
  downloadingHD,
  isPremiumUser,
  canvasConfigExpanded,
  downloadDisabled = false,
  canvasButtonDisabled = false,
  canvasLocked = false,
  canvasButtonRef,
}: ActionRowProps) {
  const entitlements = useFounderStore((state) => state.entitlements);
  const remainingTokens = entitlements?.remainingTokens;
  const userTier = entitlements?.tier ?? 'free';
  const [isSticky, setIsSticky] = useState(false);
  const actionRowRef = useRef<HTMLDivElement>(null);

  const handleDownloadClick = () => {
    trackDownloadCTAClick(userTier, isPremiumUser);
    onDownloadClick();
  };

  const handleCanvasClick = () => {
    trackCanvasCTAClick(userTier);
    if (!canvasConfigExpanded) {
      trackCanvasPanelOpen(userTier);
    }
    onCanvasClick();
  };

  // Sticky mobile bar when scrolled past
  useEffect(() => {
    const handleScroll = () => {
      if (actionRowRef.current) {
        const rect = actionRowRef.current.getBoundingClientRect();
        setIsSticky(rect.top < 60); // Below mobile header
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div ref={actionRowRef} className="space-y-4">
        {/* Download Image Button - Secondary (Ghost) */}
        <button
          onClick={handleDownloadClick}
          disabled={downloadingHD || downloadDisabled}
          className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all bg-transparent border-2 border-white/20 hover:bg-white/5 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white/10">
            {isPremiumUser ? (
              <Download className="w-5 h-5 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-white/60" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Download Image</p>
              {isPremiumUser && typeof remainingTokens === 'number' && remainingTokens > 0 && (
                <span className="text-xs text-purple-300 font-semibold">
                  {remainingTokens} {remainingTokens === 1 ? 'token' : 'tokens'} left
                </span>
              )}
            </div>
            <p className="text-xs text-white/60">
              {isPremiumUser
                ? 'Instant 4K JPEG • Perfect for sharing'
                : 'Unlock watermark-free downloads • Upgrade to Creator'}
            </p>
          </div>
        </button>

        {/* Create Canvas Button - Primary (Gradient) */}
        <button
          onClick={handleCanvasClick}
          disabled={canvasButtonDisabled}
          ref={canvasButtonRef}
          aria-expanded={canvasConfigExpanded}
          aria-controls="canvas-options-panel"
          className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
            canvasConfigExpanded
              ? 'bg-gradient-cta text-white border-2 border-purple-400 shadow-glow-purple'
              : 'bg-gradient-cta/80 text-white border-2 border-purple-400/60 hover:bg-gradient-cta hover:border-purple-400 hover:shadow-glow-purple'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              canvasConfigExpanded ? 'bg-white/20 shadow-glow-soft' : 'bg-white/10'
            }`}
          >
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">Create Canvas</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-semibold">
                ⭐ 4.9 avg
              </span>
            </div>
            <p className="text-xs text-white/90">
              Turn this into wall art • Gallery-quality prints
            </p>
            {canvasLocked && (
              <span className="mt-1 inline-block text-[10px] uppercase tracking-[0.2em] text-white/70">
                Finalize your photo to unlock ordering
              </span>
            )}
          </div>
        </button>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Sticky mini-bar on mobile when scrolled past */}
      {isSticky && (
        <div
          className="lg:hidden fixed left-0 right-0 z-40 bg-slate-950/95 backdrop-blur border-b border-white/10 px-4 py-3 animate-slideDown"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
        >
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <button
              onClick={handleDownloadClick}
              disabled={downloadingHD || downloadDisabled}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPremiumUser ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              Download
            </button>
            <button
              onClick={handleCanvasClick}
              disabled={canvasButtonDisabled}
              aria-expanded={canvasConfigExpanded}
              aria-controls="canvas-options-panel"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-cta text-white text-sm font-semibold shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              Canvas
            </button>
          </div>
        </div>
      )}
    </>
  );
}
