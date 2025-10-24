import { RefObject, useEffect, useRef, useState } from 'react';
import { Download, Lock, ShoppingBag, Bookmark, BookmarkCheck } from 'lucide-react';
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
  // SaveToGallery props
  onSaveToGallery: () => void;
  savingToGallery: boolean;
  savedToGallery: boolean;
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
  onSaveToGallery,
  savingToGallery,
  savedToGallery,
}: ActionRowProps) {
  const userTier = useFounderStore((state) => state.entitlements?.tier ?? 'free');
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
      <div ref={actionRowRef} className="mx-auto space-y-3">
        {/* Top Row: Download + Create Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Download Image Button */}
          <button
            onClick={handleDownloadClick}
            disabled={downloadingHD || downloadDisabled}
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-cta text-white border-2 border-purple-400 shadow-glow-purple hover:shadow-glow-purple"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 shadow-glow-soft">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold whitespace-nowrap">Download</p>
              <p className="text-xs text-white/70 whitespace-nowrap">
                {isPremiumUser ? '4K JPEG' : 'Upgrade for HD'}
              </p>
            </div>
          </button>

          {/* Create Canvas Button */}
          <button
            onClick={handleCanvasClick}
            disabled={canvasButtonDisabled}
            ref={canvasButtonRef}
            aria-expanded={canvasConfigExpanded}
            aria-controls="canvas-options-panel"
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-cta text-white border-2 border-purple-400 shadow-glow-purple hover:shadow-glow-purple"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 shadow-glow-soft">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold whitespace-nowrap">Create Canvas</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-semibold whitespace-nowrap">
                  ⭐ 4.9
                </span>
              </div>
              <p className="text-xs text-white/70 whitespace-nowrap">
                {canvasLocked ? 'Finalize photo' : 'Gallery-quality prints'}
              </p>
            </div>
          </button>
        </div>

        {/* Bottom Row: Save to Gallery (Centered) */}
        <div className="flex justify-center">
          <button
            onClick={onSaveToGallery}
            disabled={savingToGallery}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold transition-all w-full md:w-auto md:min-w-[280px] ${
              savedToGallery
                ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50'
                : 'bg-black hover:bg-slate-950 text-white border-2 border-white/30 hover:border-white/40'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              {savedToGallery ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold whitespace-nowrap">
                {savedToGallery ? 'Saved to Gallery' : savingToGallery ? 'Saving...' : 'Save to Gallery'}
              </p>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Sticky mini-bar on mobile when scrolled past */}
      {isSticky && (
        <div
          className="lg:hidden fixed left-0 right-0 z-40 bg-slate-950/95 backdrop-blur border-b border-white/10 px-4 py-3 animate-slideDown"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
        >
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <button
              onClick={onSaveToGallery}
              disabled={savingToGallery}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                savedToGallery
                  ? 'bg-emerald-500/20 border border-emerald-400/50'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              {savedToGallery ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{savedToGallery ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={handleDownloadClick}
              disabled={downloadingHD || downloadDisabled}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                isPremiumUser
                  ? 'bg-gradient-cta border border-purple-400 shadow-glow-purple'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              {isPremiumUser ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handleCanvasClick}
              disabled={canvasButtonDisabled}
              aria-expanded={canvasConfigExpanded}
              aria-controls="canvas-options-panel"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg bg-gradient-cta text-white text-xs font-semibold shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Canvas</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
