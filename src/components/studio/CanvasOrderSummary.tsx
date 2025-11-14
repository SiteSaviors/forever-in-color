import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import { Frame, Maximize2, Compass, Sparkles, Edit3 } from 'lucide-react';
import { useCanvasSelection } from '@/store/hooks/useCanvasConfigStore';
import { useUploadState } from '@/store/hooks/useUploadStore';
import { getCanvasSizeOption } from '@/utils/canvasSizes';
import { ORIENTATION_PRESETS } from '@/utils/smartCrop';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

type CanvasOrderSummaryProps = {
  total: number;
  onEditFrame: () => void;
  onEditSize: () => void;
  orientationPreviewPending?: boolean;
};

const CanvasOrderSummaryComponent = ({
  total,
  onEditFrame,
  onEditSize,
  orientationPreviewPending = false,
}: CanvasOrderSummaryProps) => {
  const { selectedCanvasSize, selectedFrame, enhancements } = useCanvasSelection();
  const { orientation } = useUploadState();

  const selectedSizeOption = useMemo(() => {
    if (!selectedCanvasSize) return null;
    return getCanvasSizeOption(selectedCanvasSize);
  }, [selectedCanvasSize]);

  const frameLabel = useMemo(() => {
    if (!selectedFrame || selectedFrame === 'none') return 'Gallery wrap';
    const formatted = `${selectedFrame.charAt(0).toUpperCase()}${selectedFrame.slice(1)}`;
    return `${formatted} floating frame`;
  }, [selectedFrame]);

  const orientationLabel = ORIENTATION_PRESETS[orientation].label;
  const enhancementsSummary = enhancements.filter((item) => item.enabled).map((item) => item.name);

  return (
    <section className="space-y-4 rounded-3xl border border-white/12 bg-gradient-to-br from-white/5 via-white/3 to-transparent p-6 transition hover:border-white/20">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Order Summary</p>

        <div className="space-y-3 text-sm">
          {/* Canvas Size */}
          <div className="flex items-center justify-between text-white/75">
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-purple-300/60" />
              <span>{selectedSizeOption ? `${selectedSizeOption.label} Canvas` : 'Size pending'}</span>
            </div>
            <button
              type="button"
              onClick={onEditSize}
              disabled={orientationPreviewPending}
              className={clsx(
                'flex items-center gap-1 text-xs font-semibold transition',
                orientationPreviewPending
                  ? 'cursor-not-allowed text-purple-300/40'
                  : 'text-purple-300 hover:text-purple-200'
              )}
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </button>
          </div>

          {/* Frame */}
          <div className="flex items-center justify-between text-white/75">
            <div className="flex items-center gap-2">
              <Frame className="h-4 w-4 text-purple-300/60" />
              <span>{frameLabel}</span>
            </div>
            <button
              type="button"
              onClick={onEditFrame}
              disabled={orientationPreviewPending}
              className={clsx(
                'flex items-center gap-1 text-xs font-semibold transition',
                orientationPreviewPending
                  ? 'cursor-not-allowed text-purple-300/40'
                  : 'text-purple-300 hover:text-purple-200'
              )}
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </button>
          </div>

          {/* Orientation */}
          <div className="flex items-center gap-2 text-white/75">
            <Compass className="h-4 w-4 text-purple-300/60" />
            <span>Orientation: {orientationLabel}</span>
          </div>

          {/* Enhancements */}
          {enhancementsSummary.length > 0 && (
            <div className="flex items-center gap-2 text-white/75">
              <Sparkles className="h-4 w-4 text-purple-300/60" />
              <span>Enhancements: {enhancementsSummary.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Total Price with Animation */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-sm font-semibold text-white/70">Total</span>
        <span
          key={total}
          className="font-display text-2xl font-bold text-white motion-safe:animate-[pulse_400ms_ease-in-out]"
        >
          {currency.format(total)}
        </span>
      </div>
    </section>
  );
};

const CanvasOrderSummary = memo(CanvasOrderSummaryComponent);

export default CanvasOrderSummary;
