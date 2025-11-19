import { memo, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { Package, Flag, Shield } from 'lucide-react';
import { useCanvasConfigState } from '@/store/hooks/useFounderCanvasStore';
import { useUploadState } from '@/store/hooks/useUploadStore';
import { USE_NEW_CTA_COPY } from '@/config/featureFlags';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface CheckoutFooterProps {
  onPrimaryCta: () => void;
  children?: ReactNode;
}

const CheckoutFooterComponent = ({ onPrimaryCta, children }: CheckoutFooterProps) => {
  const { selectedCanvasSize, computedTotal } = useCanvasConfigState((state) => ({
    selectedCanvasSize: state.selectedCanvasSize,
    computedTotal: state.computedTotal,
  }));
  const { orientationPreviewPending } = useUploadState();

  const total = computedTotal();
  const canvasReady = Boolean(selectedCanvasSize) && !orientationPreviewPending;
  const ctaCopy = USE_NEW_CTA_COPY ? 'Begin Production →' : 'Continue to Contact & Shipping →';
  const ctaAriaLabel = canvasReady
    ? `${ctaCopy} (${currency.format(total)})`
    : 'Select a canvas size to continue';

  return (
    <footer className="space-y-4 border-t border-white/10 pt-6 mt-8">
      <div className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/8 via-white/4 to-white/6 p-5 shadow-[0_0_24px_rgba(168,85,247,0.12)] transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_32px_rgba(168,85,247,0.18)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-emerald-500/8" />
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/12 via-transparent to-emerald-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-3 sm:divide-x sm:divide-white/15">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/15 shadow-[0_0_16px_rgba(168,85,247,0.2)] transition-transform duration-300 group-hover:scale-105">
              <Package className="h-6 w-6 text-purple-300" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="font-display text-base font-semibold text-white">Free Shipping</p>
              <p className="text-xs text-white/55">On all orders</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/15 shadow-[0_0_16px_rgba(59,130,246,0.2)] transition-transform duration-300 group-hover:scale-105">
              <Flag className="h-6 w-6 text-blue-300" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="font-display text-base font-semibold text-white">Made in USA</p>
              <p className="text-xs text-white/55">Handcrafted quality</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/15 shadow-[0_0_16px_rgba(52,211,153,0.2)] transition-transform duration-300 group-hover:scale-105">
              <Shield className="h-6 w-6 text-emerald-300" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="font-display text-base font-semibold text-white">Money-Back Guarantee</p>
              <p className="text-xs text-white/55">100-day protection</p>
            </div>
          </div>
        </div>
      </div>

      {children}

      <button
        type="button"
        onClick={onPrimaryCta}
        disabled={!canvasReady}
        aria-label={ctaAriaLabel}
        className={clsx(
          'w-full rounded-[26px] border border-purple-400 bg-gradient-to-r from-purple-500 via-purple-500 to-blue-500 py-4 text-base font-semibold text-white shadow-glow-purple transition',
          !canvasReady ? 'cursor-not-allowed opacity-40' : 'hover:shadow-glow-purple motion-safe:hover:scale-[1.01]'
        )}
      >
        {ctaCopy}
      </button>

      <div className="border-t border-white/10" aria-hidden="true" />
    </footer>
  );
};

export default memo(CheckoutFooterComponent);
