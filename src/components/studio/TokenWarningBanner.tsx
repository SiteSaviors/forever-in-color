import { X, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderStore, type EntitlementTier } from '@/store/useFounderStore';
import Button from '@/components/ui/Button';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import { useTransitionPresence } from '@/hooks/useTransitionPresence';
import { clsx } from 'clsx';
import './TokenWarningBanner.css';

const TIER_RECOMMENDATIONS: Record<EntitlementTier, { nextTier: string; quota: number; price: string } | null> = {
  free: { nextTier: 'Creator', quota: 50, price: '$9.99/mo' },
  creator: { nextTier: 'Plus', quota: 250, price: '$29.99/mo' },
  plus: { nextTier: 'Pro', quota: 500, price: '$59.99/mo' },
  pro: null,
  dev: null,
};

const TokenWarningBanner = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const entitlements = useFounderStore((state) => state.entitlements);
  const displayRemainingTokens = useFounderStore((state) => state.getDisplayableRemainingTokens());
  const prefersReducedMotion = usePrefersReducedMotion();

  const shouldShow = () => {
    if (dismissed || entitlements.status !== 'ready') return false;

    const { quota } = entitlements;
    if (displayRemainingTokens == null || quota == null) return false;

    const percentageRemaining = displayRemainingTokens / quota;
    return percentageRemaining <= 0.2 && percentageRemaining > 0;
  };

  const recommendation = TIER_RECOMMENDATIONS[entitlements.tier];
  const tokensRemaining = displayRemainingTokens ?? entitlements.remainingTokens ?? 0;

  const isVisible = shouldShow() && !!recommendation;
  const { mounted, state } = useTransitionPresence(isVisible, {
    enterDuration: 220,
    exitDuration: 200,
    reduceMotion: prefersReducedMotion,
  });

  if (!mounted || !recommendation) return null;

  return (
    <div
      className={clsx(
        'token-warning-banner',
        prefersReducedMotion && 'token-warning-banner--reduced'
      )}
      data-state={state}
    >
      <div className="token-warning-banner__inner">
        <div className="token-warning-banner__message">
          <div className="token-warning-banner__icon">
            <AlertTriangle className="h-4 w-4 text-amber-300" />
          </div>
          <div className="token-warning-banner__text">
            <p className="token-warning-banner__headline">
              You have{' '}
              <span className="token-warning-banner__tokens">
                {tokensRemaining} token{tokensRemaining === 1 ? '' : 's'}
              </span>{' '}
              left this period
            </p>
            <p className="token-warning-banner__subtext">
              Upgrade to <span className="font-semibold text-amber-200">{recommendation.nextTier}</span> for{' '}
              {recommendation.quota} tokens/month
            </p>
          </div>
        </div>

        <div className="token-warning-banner__actions">
          <Button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/90 to-orange-500/90 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(251,191,36,0.3)] transition-all hover:scale-105 hover:shadow-[0_12px_50px_rgba(251,191,36,0.5)]"
          >
            <TrendingUp className="h-4 w-4" />
            View Plans
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="token-warning-banner__dismiss"
            aria-label="Dismiss warning"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenWarningBanner;
