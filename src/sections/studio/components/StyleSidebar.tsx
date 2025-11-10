import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import OriginalImageCard from './OriginalImageCard';
import StyleAccordionFallback from './StyleAccordionFallback';
import './StyleSidebar.css';

const StyleAccordion = lazy(() => import('./StyleAccordion'));

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
        'hidden lg:block lg:w-[390px] lg:flex-shrink-0 bg-slate-950/50 border-r border-white/10 lg:sticky lg:top-[57px] lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto transition-opacity duration-200',
        !hasCroppedImage && 'opacity-80 saturate-75'
      )}
    >
      <div className="style-sidebar-shell relative px-6 pt-6 pb-0">
        {/* Header */}
        <div className="relative space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.38em] text-white/50">Studio Curations</p>
          <h3 className="font-display text-3xl tracking-[-0.01em] text-white lg:text-[34px] font-semibold">Wondertone Styles</h3>
          <p className="text-xs text-white/75 md:text-sm">Choose your artistic tone</p>
        </div>

        {/* Token Counter */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-white/5 p-5 shadow-inner mt-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-10 opacity-40 blur-2xl"
            style={{
              background:
                'radial-gradient(120% 80% at 0% 0%, rgba(79, 70, 229, 0.35), transparent 60%), radial-gradient(100% 80% at 100% 100%, rgba(14, 165, 233, 0.25), transparent 70%)',
            }}
          />
          <p className="text-xs uppercase tracking-[0.32em] text-white/60">Remaining Generations</p>
          <p className="mt-2 text-3xl font-display tracking-wider text-white">{remainingLabel}</p>
          <p className="mt-3 text-xs text-white/70">
            Tier{' '}
            <span className="font-semibold text-purple-300">
              {entitlements.tier.toUpperCase()}
            </span>{' '}
            · Quota {quotaLabel}
          </p>
          <Link
            to="/studio/usage"
            className="mt-4 inline-flex text-xs font-semibold text-purple-300 transition hover:text-purple-200"
          >
            View Usage History →
          </Link>
        </div>

        {/* ✅ NEW: Original Image always visible (not a style, just your photo) */}
        <div className="mt-6">
          <OriginalImageCard />
        </div>

        {/* ✅ Accordion with tone-based styles */}
        <div className="mt-6">
          <Suspense fallback={<StyleAccordionFallback />}>
            <StyleAccordion hasCroppedImage={hasCroppedImage} />
          </Suspense>
        </div>

        {/* Upgrade CTA */}
        <div className="p-4 mt-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/30 shadow-lg">
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
