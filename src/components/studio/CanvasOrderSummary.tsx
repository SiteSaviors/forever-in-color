import { memo, useMemo } from 'react';
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
};

const CanvasOrderSummaryComponent = ({ total, onEditFrame, onEditSize }: CanvasOrderSummaryProps) => {
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
          <div className="flex items-center justify-between text-white/75">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-white/45">Canvas</span>
              <span>{selectedSizeOption ? selectedSizeOption.label : 'Size pending'}</span>
            </div>
            <button type="button" onClick={onEditSize} className="text-xs font-semibold text-purple-300 transition hover:text-purple-200">
              Edit
            </button>
          </div>

          <div className="flex items-center justify-between text-white/75">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-white/45">Frame</span>
              <span>{frameLabel}</span>
            </div>
            <button type="button" onClick={onEditFrame} className="text-xs font-semibold text-purple-300 transition hover:text-purple-200">
              Edit
            </button>
          </div>

          <div className="flex items-center gap-2 text-white/75">
            <span className="text-xs uppercase tracking-[0.3em] text-white/45">Orientation</span>
            <span>{orientationLabel}</span>
          </div>

          <div className="flex items-start gap-2 text-white/75">
            <span className="text-xs uppercase tracking-[0.3em] text-white/45">Enhancements</span>
            <span>{enhancementsSummary.length ? enhancementsSummary.join(', ') : 'None'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-sm font-semibold text-white/70">Total</span>
        <span className="font-display text-2xl font-bold text-white">{currency.format(total)}</span>
      </div>
    </section>
  );
};

const CanvasOrderSummary = memo(CanvasOrderSummaryComponent);

export default CanvasOrderSummary;
