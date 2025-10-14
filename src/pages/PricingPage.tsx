import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FounderNavigation from '@/components/navigation/FounderNavigation';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useFounderStore } from '@/store/useFounderStore';
import { useAuthModal } from '@/store/useAuthModal';
import { createCheckoutSession } from '@/utils/checkoutApi';

type TierId = 'free' | 'creator' | 'plus' | 'pro';

type Tier = {
  id: TierId;
  name: string;
  tagline: string;
  description: string;
  price: string;
  priceDetail: string;
  tokensPerMonth: string;
  features: string[];
  gradient: string;
  badge?: string;
};

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Wondertone Free',
    tagline: 'Perfect for exploring styles and testing ideas',
    description: '10 watermarked generations per month, access to all core styles, and Living Canvas previews.',
    price: '$0',
    priceDetail: 'Forever',
    tokensPerMonth: '10 tokens',
    features: [
      'Watermarked previews',
      'Living Canvas demo access',
      'Smart style recommendations',
      'Community momentum feed',
    ],
    gradient: 'from-slate-800 via-slate-900 to-slate-950',
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'Turn milestone memories into ready-to-print art',
    description: 'Unlock watermark-free previews, download-ready exports, and elevated social proof modules.',
    price: '$9.99',
    priceDetail: 'per month',
    tokensPerMonth: '50 tokens',
    features: [
      'Watermark-free previews & downloads',
      '50 premium generations per month',
      'Living Canvas AR downloads',
      'Priority in Wondertone queues',
      'Creator badge in Studio & marketplace',
    ],
    gradient: 'from-purple-500/70 via-indigo-500/70 to-blue-500/70',
    badge: 'Most Loved',
  },
  {
    id: 'plus',
    name: 'Plus',
    tagline: 'For artist studios and memory pros managing multiple clients',
    description: 'High-throughput generations, batch downloads, and concierge support for mobile pop-ups or live events.',
    price: '$29.99',
    priceDetail: 'per month',
    tokensPerMonth: '250 tokens',
    features: [
      '250 premium generations / month',
      'Batch watermarked & clean exports',
      'Dedicated live preview operator tools',
      'Priority queue (2× speed boost)',
      'Shared brand assets & style kits',
    ],
    gradient: 'from-blue-500/80 via-cyan-500/80 to-emerald-500/80',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Scale-ready plan for franchise studios & enterprise gifting',
    description: 'Unlock Wondertone concierge, white-label experiences, and 500 tokens for large activations.',
    price: '$59.99',
    priceDetail: 'per month',
    tokensPerMonth: '500 tokens',
    features: [
      '500 premium generations / month',
      'Wondertone concierge team & white-label support',
      'Real-time teleprompter prompts for live events',
      'Priority queue (3× speed boost)',
      'Guaranteed Living Canvas production in 48h',
    ],
    gradient: 'from-amber-400/80 via-orange-500/80 to-rose-500/80',
    badge: 'Studio Favorite',
  },
];

const PricingPage = () => {
  const entitlements = useFounderStore((state) => state.entitlements);
  const sessionUser = useFounderStore((state) => state.sessionUser);
  const accessToken = useFounderStore((state) => state.accessToken);
  const hydrateEntitlements = useFounderStore((state) => state.hydrateEntitlements);
  const openAuthModal = useAuthModal((state) => state.openModal);
  const location = useLocation();
  const navigate = useNavigate();

  const [loadingTier, setLoadingTier] = useState<TierId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('checkout');
    if (status === 'success') {
      setSuccessMessage('Checkout complete! We are upgrading your studio…');
      void hydrateEntitlements();
    } else if (status === 'cancelled') {
      setErrorMessage('Checkout cancelled. Feel free to try again when you’re ready.');
    }

    if (status) {
      params.delete('checkout');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.pathname, location.search, navigate, hydrateEntitlements]);

  const currentTier = entitlements.tier;

  const handleSelectTier = async (tier: TierId) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (tier === 'free') {
      navigate('/create');
      return;
    }

    if (!sessionUser) {
      openAuthModal('signup');
      return;
    }

    try {
      setLoadingTier(tier);
      const { url } = await createCheckoutSession({
        tier,
        accessToken,
        successUrl: `${window.location.origin}/pricing?checkout=success`,
        cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
      });
      window.location.href = url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start checkout. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoadingTier(null);
    }
  };

  const renderTierCard = (tier: Tier) => {
    const isCurrent = tier.id === currentTier;
    const isLoading = loadingTier === tier.id;

    return (
      <Card
        key={tier.id}
        glass
        className={
          tier.id === 'free'
            ? 'relative border-white/10 bg-white/5'
            : `relative border-transparent bg-gradient-to-br ${tier.gradient}`
        }
      >
        {tier.badge && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            {tier.badge}
          </span>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
            <p className="text-sm text-white/70">{tier.tagline}</p>
          </div>
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-4xl font-semibold">{tier.price}</span>
            <span className="text-sm text-white/60">{tier.priceDetail}</span>
          </div>
          <p className="text-sm text-white/70">{tier.description}</p>
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <p className="font-semibold">{tier.tokensPerMonth}</p>
            <ul className="space-y-1 text-white/70">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs text-white/80">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <Button
            className="w-full"
            disabled={isCurrent || isLoading}
            onClick={() => handleSelectTier(tier.id)}
          >
            {isCurrent ? 'Current plan' : isLoading ? 'Preparing checkout…' : tier.id === 'free' ? 'Start creating' : 'Upgrade with Wondertone' }
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <FounderNavigation />
      <main className="pt-32 pb-24">
        <Section className="space-y-16">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h1 className="text-4xl font-semibold md:text-5xl">Choose the Wondertone plan that fits your story</h1>
            <p className="text-lg text-white/70">
              Scale from personal keepsakes to live pop-up studios with membership tiers designed for emotion-rich art. All plans include Wondertone&apos;s Living Canvas engine, curated style library, and social momentum intelligence.
            </p>
            {successMessage && (
              <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mx-auto max-w-2xl rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TIERS.map(renderTierCard)}
          </div>

          <div className="mx-auto max-w-4xl space-y-6 rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950/80 p-10 text-left shadow-[0_35px_100px_rgba(76,29,149,0.35)]">
            <h2 className="text-2xl font-semibold text-white">Every Wondertone membership unlocks:</h2>
            <ul className="grid gap-4 text-sm text-white/70 md:grid-cols-2">
              <li>✨ Guided studio flow with Living Canvas AR previews</li>
              <li>📦 Concierge production with archival-grade materials</li>
              <li>🧠 Smart style recommendations tuned by Wondertone analysts</li>
              <li>📈 Social momentum console to drive word-of-mouth in seconds</li>
            </ul>
            <p className="text-xs text-white/40">
              Prices shown in USD. Stripe handles all payments securely. Cancel anytime. Tokens renew monthly based on your tier and reset at the beginning of each billing cycle.
            </p>
          </div>
        </Section>
      </main>
    </div>
  );
};

export default PricingPage;
