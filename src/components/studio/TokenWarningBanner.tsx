import { X, AlertTriangle, TrendingUp, ShieldOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderStore, type EntitlementTier } from '@/store/useFounderStore';
import Button from '@/components/ui/Button';

const TIER_RECOMMENDATIONS: Record<EntitlementTier, { nextTier: string; quota: number; price: string } | null> = {
  anonymous: { nextTier: 'Free', quota: 10, price: '$0' },
  free: { nextTier: 'Creator', quota: 50, price: '$9.99/mo' },
  creator: { nextTier: 'Plus', quota: 250, price: '$29.99/mo' },
  plus: { nextTier: 'Pro', quota: 500, price: '$59.99/mo' },
  pro: null,
  dev: null,
};

const TokenWarningBanner = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [fingerprintDismissed, setFingerprintDismissed] = useState(false);
  const entitlements = useFounderStore((state) => state.entitlements);
  const fingerprintStatus = useFounderStore((state) => state.fingerprintStatus);
  const fingerprintError = useFounderStore((state) => state.fingerprintError);
  const displayRemainingTokens = useFounderStore((state) => state.getDisplayableRemainingTokens());

  if (fingerprintStatus === 'error' && !fingerprintDismissed) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="sticky top-[57px] z-20 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/30 to-orange-400/30 border border-amber-400/40">
                <ShieldOff className="h-4 w-4 text-amber-300" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-white">
                  Please enable browser features to continue generating previews.
                </p>
                <p className="text-xs text-white/70">
                  {fingerprintError ?? 'Fingerprinting powers free tokens. Browser privacy settings are blocking it.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFingerprintDismissed(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss fingerprint warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const shouldShow = () => {
    if (dismissed || entitlements.status !== 'ready') return false;

    const { quota } = entitlements;
    if (displayRemainingTokens == null || quota == null) return false;

    const percentageRemaining = displayRemainingTokens / quota;
    return percentageRemaining <= 0.2 && percentageRemaining > 0;
  };

  const recommendation = TIER_RECOMMENDATIONS[entitlements.tier];
  const tokensRemaining = displayRemainingTokens ?? entitlements.remainingTokens ?? 0;

  if (!shouldShow() || !recommendation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="sticky top-[57px] z-20 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-6 py-3">
          {/* Left: Icon + Message */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/30 to-orange-400/30 border border-amber-400/40">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-white">
                You have{' '}
                <span className="text-amber-300">{tokensRemaining} token{tokensRemaining === 1 ? '' : 's'}</span>{' '}
                left this period
              </p>
              <p className="text-xs text-white/70">
                Upgrade to <span className="font-semibold text-amber-200">{recommendation.nextTier}</span> for{' '}
                {recommendation.quota} tokens/month
              </p>
            </div>
          </div>

          {/* Right: CTA + Dismiss */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/90 to-orange-500/90 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(251,191,36,0.3)] transition-all hover:scale-105 hover:shadow-[0_12px_50px_rgba(251,191,36,0.5)]"
            >
              <TrendingUp className="h-4 w-4" />
              View Plans
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TokenWarningBanner;
