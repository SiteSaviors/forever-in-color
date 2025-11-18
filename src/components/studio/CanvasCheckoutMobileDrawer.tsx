import { ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { clsx } from 'clsx';

interface CanvasCheckoutMobileDrawerProps {
  expanded: boolean;
  selectedSizeLabel?: string | null;
  totalLabel: string;
  triggerFrameShimmer: boolean;
  orientationPreviewPending: boolean;
  isSuccessStep: boolean;
  onToggle: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}

const CanvasCheckoutMobileDrawer = ({
  expanded,
  selectedSizeLabel,
  totalLabel,
  triggerFrameShimmer,
  orientationPreviewPending,
  isSuccessStep,
  onToggle,
  onPointerDown,
  children,
}: CanvasCheckoutMobileDrawerProps) => (
  <div className="lg:hidden">
    <button
      type="button"
      onClick={onToggle}
      onPointerDown={onPointerDown}
      className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-white/80 transition hover:border-white/40"
      aria-expanded={expanded}
    >
      <div>
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/45">
          Your Canvas
          {isSuccessStep && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
              Ordered
            </span>
          )}
        </p>
        <p className="text-base font-semibold text-white">{selectedSizeLabel ?? 'Select a size'}</p>
        <p className="text-xs text-white/60">{totalLabel}</p>
      </div>
      <span className={clsx('text-lg transition-transform', expanded && 'rotate-180')}>↓</span>
    </button>
    <div
      data-mobile-drawer
      className={clsx(
        'mt-3 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 transition-[max-height] duration-300 ease-out',
        expanded ? 'max-h-[420px]' : 'max-h-0 border-transparent'
      )}
      aria-hidden={!expanded}
    >
      <div className={clsx('p-3 transition-opacity duration-300 ease-out', expanded ? 'opacity-100' : 'opacity-0')}>
        <div className={clsx('relative', triggerFrameShimmer && 'frame-shimmer')}>
          {children}
          {orientationPreviewPending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-950/70 text-sm font-semibold text-white/80">
              Adapting preview…
            </div>
          )}
          {isSuccessStep && !orientationPreviewPending && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between rounded-3xl bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80 p-3 text-xs text-white/80">
              <span className="rounded-full bg-emerald-500/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                Ordered ✦
              </span>
              <span>Tracking emailed soon</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default CanvasCheckoutMobileDrawer;
