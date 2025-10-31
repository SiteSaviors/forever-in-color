import { useEffect, useMemo, useState } from 'react';
import { Download, Bookmark, BookmarkCheck, Crop, ShoppingBag } from 'lucide-react';
import { trackDownloadCTAClick } from '@/utils/telemetry';
import { useEntitlementsState } from '@/store/hooks/useEntitlementsStore';

type ActionGridProps = {
  onDownload: () => void;
  onCreateCanvas: () => void;
  onChangeOrientation: () => void;
  onSaveToGallery: () => void;
  downloading: boolean;
  downloadDisabled: boolean;
  createCanvasDisabled: boolean;
  orientationDisabled: boolean;
  orientationDisabledReason?: string;
  savingToGallery: boolean;
  savedToGallery: boolean;
  isPremiumUser: boolean;
  orientationLabel?: string | null;
};

const gradientButton =
  'rounded-[22px] border-2 border-purple-400 bg-gradient-to-r from-purple-500 via-purple-500 to-blue-500 text-white shadow-glow-purple transition hover:shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed';

const outlineButton =
  'rounded-[22px] border border-white/30 bg-black/75 text-white transition hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed';

export function ActionGrid({
  onDownload,
  onCreateCanvas,
  onChangeOrientation,
  onSaveToGallery,
  downloading,
  downloadDisabled,
  createCanvasDisabled,
  orientationDisabled,
  orientationDisabledReason,
  savingToGallery,
  savedToGallery,
  isPremiumUser,
  orientationLabel,
}: ActionGridProps) {
  const [pulseActive, setPulseActive] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  const { userTier } = useEntitlementsState();

  useEffect(() => {
    if (!createCanvasDisabled && !hasPulsed) {
      setPulseActive(true);
      setHasPulsed(true);
      const timer = window.setTimeout(() => setPulseActive(false), 1800);
      return () => window.clearTimeout(timer);
    }
    setPulseActive(false);
    return undefined;
  }, [createCanvasDisabled, hasPulsed]);

  const orientationSubtitle = useMemo(() => {
    if (!orientationLabel) return 'Adjust crop & layout';
    return `${orientationLabel} • Adjust crop`;
  }, [orientationLabel]);

  const handleDownload = () => {
    trackDownloadCTAClick(userTier, isPremiumUser);
    onDownload();
  };

  return (
    <div className="w-full">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || downloadDisabled}
          className={`${gradientButton} flex items-center gap-3 px-5 py-4`}
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/20 shadow-glow-soft">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex flex-1 flex-col text-left">
            <span className="text-sm font-semibold leading-tight">Download Image</span>
            <span className="text-xs text-white/70">
              {isPremiumUser ? '4K JPEG' : 'Upgrade for HD'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onCreateCanvas}
          disabled={createCanvasDisabled}
          title={createCanvasDisabled ? 'Upload & crop a photo first' : 'Open canvas configurator'}
          className={`${gradientButton} flex items-center gap-3 px-5 py-4 ${
            pulseActive ? 'motion-safe:animate-[pulse_1.2s_ease-in-out]' : ''
          }`}
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/20 shadow-glow-soft">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-1 flex-col text-left">
            <span className="text-sm font-semibold leading-tight">Create Canvas Art</span>
            <span className="text-xs text-white/70">Gallery-quality prints</span>
          </div>
        </button>

        <button
          type="button"
          onClick={onChangeOrientation}
          disabled={orientationDisabled}
          title={
            orientationDisabled
              ? orientationDisabledReason ?? 'Complete crop adjustments to change orientation'
              : 'Adjust crop & layout'
          }
          className={`${outlineButton} flex items-center gap-3 px-5 py-4`}
          aria-disabled={orientationDisabled ? 'true' : 'false'}
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/60">
            <Crop className="h-5 w-5" />
          </div>
          <div className="flex flex-1 flex-col text-left">
            <span className="text-sm font-semibold leading-tight">Change Orientation</span>
            <span className="text-xs text-white/60">{orientationSubtitle}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={onSaveToGallery}
          disabled={savingToGallery}
          title={savedToGallery ? 'Already saved to your gallery' : 'Save this preview'}
          className={`${outlineButton} flex items-center gap-3 px-5 py-4`}
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/60">
            {savedToGallery ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </div>
          <div className="flex flex-1 flex-col text-left">
            <span className="text-sm font-semibold leading-tight">
              {savedToGallery ? 'Saved to Gallery' : savingToGallery ? 'Saving…' : 'Save to Gallery'}
            </span>
            <span className="text-xs text-white/60">
              {savedToGallery ? 'Ready to revisit anytime' : 'Keep this preview handy'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default ActionGrid;
