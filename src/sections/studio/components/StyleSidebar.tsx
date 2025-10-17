import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import OriginalImageCard from './OriginalImageCard';
import StyleAccordion from './StyleAccordion';

type StyleSidebarProps = {
  entitlements: {
    tier: string;
    status: string;
    remainingTokens: number | null;
    quota: number | null;
  };
  hasCroppedImage: boolean;
};

const StyleSidebar = ({
  entitlements,
  hasCroppedImage,
}: StyleSidebarProps) => {
  const remainingLabel = entitlements.status === 'ready'
    ? entitlements.remainingTokens == null
      ? '∞'
      : Math.max(0, entitlements.remainingTokens)
    : '—';
  const quotaLabel = entitlements.quota == null ? '∞' : entitlements.quota;

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

        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-white">Wondertone Styles</h3>
          <p className="text-xs text-white/60 mt-1">Choose your artistic tone</p>
        </div>

        {/* Token Counter */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg">
          <p className="text-sm text-white/70 mb-1">Generations Remaining</p>
          <p className="text-2xl font-bold text-white">{remainingLabel} left</p>
          <p className="text-xs text-white/60 mt-2">
            Tier: <span className="text-purple-300 font-semibold">{entitlements.tier.toUpperCase()}</span> · Quota {quotaLabel}
          </p>
          <Link
            to="/studio/usage"
            className="mt-3 block text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
          >
            View Usage History →
          </Link>
        </div>

        {/* ✅ NEW: Original Image always visible (not a style, just your photo) */}
        <OriginalImageCard />

        {/* ✅ Accordion with tone-based styles */}
        <StyleAccordion hasCroppedImage={hasCroppedImage} />

        {/* Upgrade CTA */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/30 shadow-lg">
          <p className="text-sm font-semibold text-white mb-2">Want unlimited generations?</p>
          <p className="text-xs text-white/70 mb-3">Upgrade to Creator for unlimited style switching</p>
          <Link
            to="/pricing"
            className="block w-full px-4 py-2 rounded-lg bg-gradient-cta text-white text-sm font-bold shadow-glow-purple hover:shadow-glow-purple transition text-center"
          >
            Upgrade - $9.99/mo
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default StyleSidebar;
