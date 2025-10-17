import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import type { GateResult } from '@/utils/entitlementGate';
import type { StylePreviewStatus, StyleOption } from '@/store/useFounderStore';

type StyleSidebarProps = {
  styles: StyleOption[];
  selectedStyleId: string | null;
  pendingStyleId: string | null;
  stylePreviewStatus: StylePreviewStatus;
  evaluateStyleGate: (styleId: string | null) => GateResult;
  entitlements: {
    tier: string;
    status: string;
    remainingTokens: number | null;
    quota: number | null;
  };
  previews: Record<string, { status: string } | undefined>;
  hasCroppedImage: boolean;
  onStyleSelect: (styleId: string) => void;
};

const StyleSidebar = ({
  styles,
  selectedStyleId,
  pendingStyleId,
  stylePreviewStatus,
  evaluateStyleGate,
  entitlements,
  previews,
  hasCroppedImage,
  onStyleSelect,
}: StyleSidebarProps) => {
  const remainingLabel = entitlements.status === 'ready'
    ? entitlements.remainingTokens == null
      ? '∞'
      : Math.max(0, entitlements.remainingTokens)
    : '—';
  const quotaLabel = entitlements.quota == null ? '∞' : entitlements.quota;
  const globalGate = evaluateStyleGate(null);

  return (
    <aside
      className={clsx(
        'hidden lg:block lg:w-80 bg-slate-950/50 border-r border-white/10 lg:h-screen lg:sticky lg:top-[57px] overflow-y-auto transition-opacity duration-200',
        !hasCroppedImage && 'pointer-events-none opacity-40 saturate-50'
      )}
      aria-disabled={!hasCroppedImage}
    >
      <div className="p-6 space-y-6">
        {!hasCroppedImage && (
          <div className="rounded-xl border border-white/12 bg-white/5 p-4 text-sm text-white/70">
            Upload your photo above to unlock style previews.
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-white">All Styles</h3>
          <p className="text-xs text-white/60 mt-1">Click to preview</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-white/70 mb-1">Generations Remaining</p>
          <p className="text-2xl font-bold text-white">{remainingLabel} left</p>
          <p className="text-xs text-white/60 mt-2">Tier: {entitlements.tier.toUpperCase()} · Quota {quotaLabel}</p>
          <Link
            to="/studio/usage"
            className="mt-3 block text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
          >
            View Usage History →
          </Link>
        </div>

        <div className="space-y-3">
          {styles.map((style) => {
            const isSelected = style.id === selectedStyleId;
            const stylePreview = previews[style.id];
            const isReady = stylePreview?.status === 'ready';
            const gate = globalGate.allowed ? evaluateStyleGate(style.id) : globalGate;
            const isLocked =
              Boolean(pendingStyleId && pendingStyleId !== style.id) ||
              (stylePreviewStatus === 'error' && pendingStyleId !== style.id) ||
              !gate.allowed;

            return (
              <button
                key={style.id}
                onClick={() => onStyleSelect(style.id)}
                disabled={isLocked}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
                    : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={style.thumbnail} alt={style.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-purple-500/40">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-white">{style.name}</p>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">{style.description}</p>
                  {isReady && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-green-400 font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Cached
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/30">
          <p className="text-sm font-semibold text-white mb-2">Want unlimited generations?</p>
          <p className="text-xs text-white/70 mb-3">Upgrade to Creator for unlimited style switching</p>
          <button className="w-full px-4 py-2 rounded-lg bg-gradient-cta text-white text-sm font-bold shadow-glow-purple hover:shadow-glow-purple transition">
            Upgrade - $9.99/mo
          </button>
        </div>
      </div>
    </aside>
  );
};

export default StyleSidebar;
