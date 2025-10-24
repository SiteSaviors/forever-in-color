import { memo } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

type ConfidenceFooterProps = {
  onUnlock: () => void;
  onCreateCanvas: () => void;
};

const ConfidenceFooter = ({ onUnlock, onCreateCanvas }: ConfidenceFooterProps) => {
  return (
    <div className="rounded-[2.75rem] border border-white/12 bg-slate-950/60 px-6 py-7 sm:px-10 sm:py-8 shadow-[0_18px_60px_rgba(16,27,45,0.45)]">
      <div className="flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm text-white/75">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
          <span>Printed on museum-grade canvas · Ships in 5 days · 100% guarantee</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex items-center gap-2 rounded-full bg-gradient-cta px-1 py-1 shadow-glow-purple">
            <button
              type="button"
              onClick={onUnlock}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black/60 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black/75"
            >
              <Sparkles className="h-4 w-4" />
              Unlock Full Studio
            </button>
            <button
              type="button"
              onClick={onCreateCanvas}
              className="inline-flex items-center justify-center rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/25"
            >
              Create Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ConfidenceFooter);
