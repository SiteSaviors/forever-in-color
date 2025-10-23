import { useEffect, useMemo, useState } from 'react';
import { ORIENTATION_PRESETS, generateSmartCrop, SmartCropResult } from '@/utils/smartCrop';
import type { Orientation } from '@/utils/imageUtils';

interface SmartCropPreviewProps {
  originalImage: string;
  orientation: Orientation;
  onAccept: (result: SmartCropResult) => void;
  onAdjust: () => void;
  onReady?: (result: SmartCropResult) => void;
  onChangePhoto?: () => void;
}

const SmartCropPreview = ({
  originalImage,
  orientation,
  onAccept,
  onAdjust,
  onReady,
  onChangePhoto,
}: SmartCropPreviewProps) => {
  const [result, setResult] = useState<SmartCropResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  const metadata = useMemo(() => ORIENTATION_PRESETS[orientation], [orientation]);
  const previewBounds = useMemo(() => {
    // Mobile-first: Use more viewport space on small screens
    if (orientation === 'horizontal') {
      return { maxWidth: 'min(92vw, 48rem)', maxHeight: '50vh' };
    }
    if (orientation === 'vertical') {
      return {
        maxWidth: 'min(70vw, 22rem)',
        maxHeight: 'min(72vh, 620px)'
      };
    }
    return { maxWidth: 'min(88vw, 32rem)', maxHeight: '55vh' };
  }, [orientation]);

  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    generateSmartCrop(originalImage, orientation)
      .then((generated) => {
        if (!isMounted) return;
        setResult(generated);
        onReady?.(generated);
      })
      .catch(() => {
        if (!isMounted) return;
        const fallback: SmartCropResult = {
          orientation,
          dataUrl: originalImage,
          region: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          },
          imageDimensions: { width: 0, height: 0 },
          generatedAt: Date.now(),
          generatedBy: 'smart',
        };
        setResult(fallback);
        onReady?.(fallback);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [originalImage, orientation, onReady]);

  const handleAccept = () => {
    if (!result) return;
    onAccept(result);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="text-center space-y-2 sm:space-y-3">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white drop-shadow-lg">
          {isGenerating ? 'Optimizing Your Canvas...' : 'Smart Crop Applied'}
        </h2>
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto font-medium">
            {metadata.description}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-purple-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <span>AI-detected optimal orientation</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl sm:rounded-[2rem] border border-white/15 bg-white/5 p-3 sm:p-6 shadow-founder backdrop-blur">
        <div
          className="relative mx-auto overflow-hidden rounded-xl sm:rounded-[1.5rem] border border-white/10 bg-slate-900/40"
          style={{
            aspectRatio: metadata.ratio,
            width: '100%',
            maxWidth: previewBounds.maxWidth,
            maxHeight: previewBounds.maxHeight,
          }}
        >
          {result ? (
            <img src={result.dataUrl} alt="Smart crop preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/60 text-sm">
              Preparing preview...
            </div>
          )}

          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 rounded-full bg-purple-500/80 px-2 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-md backdrop-blur">
            {metadata.label}
          </div>
          {onChangePhoto && (
            <button
              type="button"
              onClick={onChangePhoto}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full border border-white/30 bg-black/30 px-2 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-white/90 shadow-md backdrop-blur transition hover:bg-black/50"
            >
              <span className="hidden sm:inline">Change Photo</span>
              <span className="inline sm:hidden">Change</span>
            </button>
          )}
        </div>
      </div>

      <div
        className="flex flex-col sm:flex-row gap-3"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={handleAccept}
          disabled={isGenerating || !result}
          className="flex-1 rounded-xl sm:rounded-[1.5rem] bg-gradient-cta px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-glow-purple transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? 'Analyzing…' : 'Perfect! Use This Crop'}
        </button>
        <button
          onClick={onAdjust}
          className="flex-1 rounded-xl sm:rounded-[1.5rem] border border-white/25 px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white/80 transition hover:bg-white/10"
        >
          Adjust Manually
        </button>
      </div>
    </div>
  );
};

export default SmartCropPreview;
