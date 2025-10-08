import { useEffect, useMemo, useState } from 'react';
import { ORIENTATION_PRESETS, generateSmartCrop, SmartCropResult } from '@/utils/smartCrop';
import type { Orientation } from '@/utils/imageUtils';

interface SmartCropPreviewProps {
  originalImage: string;
  orientation: Orientation;
  onAccept: (result: SmartCropResult) => void;
  onAdjust: () => void;
  onReady?: (result: SmartCropResult) => void;
}

const SmartCropPreview = ({ originalImage, orientation, onAccept, onAdjust, onReady }: SmartCropPreviewProps) => {
  const [result, setResult] = useState<SmartCropResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  const metadata = useMemo(() => ORIENTATION_PRESETS[orientation], [orientation]);

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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-white drop-shadow-lg">
          {isGenerating ? 'Optimizing Your Canvas...' : 'Smart Crop Applied'}
        </h2>
        <p className="text-white/70 max-w-xl mx-auto">
          {metadata.description}
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/15 bg-white/5 p-6 shadow-founder backdrop-blur">
        <div
          className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/40"
          style={{ aspectRatio: metadata.ratio }}
        >
          {result ? (
            <img
              src={result.dataUrl}
              alt="Smart crop preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/60 text-sm">
              Preparing preview...
            </div>
          )}

          <div className="absolute top-4 left-4 rounded-full bg-purple-500/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-md backdrop-blur">
            {metadata.label}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAccept}
          disabled={isGenerating || !result}
          className="flex-1 rounded-[1.5rem] bg-gradient-cta px-6 py-4 text-base font-semibold text-white shadow-glow-purple transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? 'Analyzing…' : 'Perfect! Use This Crop'}
        </button>
        <button
          onClick={onAdjust}
          className="flex-1 rounded-[1.5rem] border border-white/25 px-6 py-4 text-base font-semibold text-white/80 transition hover:bg-white/10"
        >
          Adjust Manually
        </button>
      </div>
    </div>
  );
};

export default SmartCropPreview;
