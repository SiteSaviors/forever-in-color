import { TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type EntitlementTier } from '@/store/useFounderStore';
import Button from '@/components/ui/Button';

type TierRecommendationProps = {
  currentTier: EntitlementTier;
};

type RecommendationData = {
  recommendedTier: string;
  currentQuota: number;
  recommendedQuota: number;
  price: string;
  reason: string;
  savings: string;
};

const TIER_RECOMMENDATIONS: Record<EntitlementTier, RecommendationData | null> = {
  anonymous: {
    recommendedTier: 'Free',
    currentQuota: 5,
    recommendedQuota: 10,
    price: '$0/month',
    reason: 'Sign up for a free account to double your monthly tokens',
    savings: 'Get 5 more tokens per month',
  },
  free: {
    recommendedTier: 'Creator',
    currentQuota: 10,
    recommendedQuota: 50,
    price: '$9.99/month',
    reason: 'Based on your usage, upgrade to Creator for 5x more tokens and watermark-free previews',
    savings: 'Save time with no watermarks',
  },
  creator: {
    recommendedTier: 'Plus',
    currentQuota: 50,
    recommendedQuota: 250,
    price: '$29.99/month',
    reason: 'You\'re using tokens consistently. Plus gives you 5x more with batch export tools',
    savings: 'Ideal for client work',
  },
  plus: {
    recommendedTier: 'Pro',
    currentQuota: 250,
    recommendedQuota: 500,
    price: '$59.99/month',
    reason: 'Scale to Pro for 500 tokens/month and white-glove concierge support',
    savings: 'Best for studios & teams',
  },
  pro: null,
  dev: null,
};

const TierRecommendation = ({ currentTier }: TierRecommendationProps) => {
  const navigate = useNavigate();
  const recommendation = TIER_RECOMMENDATIONS[currentTier];

  if (!recommendation) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10">
      <div className="border-b border-purple-400/40 bg-purple-500/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-400/40">
            <Sparkles className="h-5 w-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Smart Recommendation</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300">
                <TrendingUp className="h-3 w-3" />
                Optimized for you
              </span>
            </div>
            <p className="text-sm text-white/70">{recommendation.reason}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Current vs Recommended */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Current</p>
              <p className="mt-1 text-3xl font-bold text-white">{recommendation.currentQuota}</p>
              <p className="text-xs text-white/60">tokens/month</p>
            </div>

            <div className="flex h-12 items-center">
              <svg
                className="h-6 w-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                {recommendation.recommendedTier}
              </p>
              <p className="mt-1 text-3xl font-bold text-white">{recommendation.recommendedQuota}</p>
              <p className="text-xs text-white/60">{recommendation.price}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={() => navigate(`/pricing?tier=${recommendation.recommendedTier.toLowerCase()}`)}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-[0_20px_60px_rgba(139,92,246,0.5)] transition-all hover:scale-105 hover:shadow-[0_25px_70px_rgba(139,92,246,0.6)]"
            >
              Upgrade to {recommendation.recommendedTier}
            </Button>
            <p className="text-xs text-white/50">{recommendation.savings}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierRecommendation;
