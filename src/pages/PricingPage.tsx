import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
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
  tokensPerMonth: number;
  tokensLabel?: string;
  features: string[];
  gradient: string;
};

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Wondertone Free',
    tagline: 'Perfect for exploring styles and testing ideas',
    description: '10 watermarked generations per month, access to all core styles, and Living Canvas previews.',
    price: '$0',
    priceDetail: 'Forever',
    tokensPerMonth: 10,
    tokensLabel: 'Tokens',
    features: [
      'Watermarked previews',
      'Living Canvas demo access',
      'Smart style recommendations',
      'Community momentum feed',
    ],
    gradient: 'from-[#1f243b] via-[#1a1f38] to-[#171a2f]',
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'Turn milestone memories into ready-to-print art',
    description: 'Unlock watermark-free previews, download-ready exports, and elevated social proof modules.',
    price: '$9.99',
    priceDetail: 'per month',
    tokensPerMonth: 50,
    tokensLabel: 'Tokens',
    features: [
      'Watermark-free previews & downloads',
      '50 premium generations per month',
      'Living Canvas AR downloads',
      'Priority in Wondertone queues',
      'Creator badge in Studio & marketplace',
    ],
    gradient: 'from-[#6c3df2]/85 via-[#4a50ff]/85 to-[#1ca7ff]/85',
  },
  {
    id: 'plus',
    name: 'Plus',
    tagline: 'For artist studios and memory pros managing multiple clients',
    description: 'High-throughput generations, batch downloads, and concierge support for mobile pop-ups or live events.',
    price: '$29.99',
    priceDetail: 'per month',
    tokensPerMonth: 250,
    tokensLabel: 'Tokens',
    features: [
      '250 premium generations / month',
      'Batch watermarked & clean exports',
      'Dedicated live preview operator tools',
      'Priority queue (2× speed boost)',
      'Shared brand assets & style kits',
    ],
    gradient: 'from-[#31a8ff]/85 via-[#09d3ef]/80 to-[#26f0b9]/80',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Scale-ready plan for franchise studios & enterprise gifting',
    description: 'Unlock Wondertone concierge, white-label experiences, and 500 tokens for large activations.',
    price: '$59.99',
    priceDetail: 'per month',
    tokensPerMonth: 500,
    tokensLabel: 'Tokens',
    features: [
      '500 premium generations / month',
      'Wondertone concierge team & white-label support',
      'Real-time teleprompter prompts for live events',
      'Priority queue (3× speed boost)',
      'Guaranteed Living Canvas production in 48h',
    ],
    gradient: 'from-[#ffa62e]/85 via-[#ff6b45]/85 to-[#f63b81]/85',
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
        className={clsx(
          'relative overflow-hidden rounded-[28px] border border-white/15 backdrop-blur-xl',
          tier.id === 'free' ? 'bg-[#1d2035]/80' : `bg-gradient-to-br ${tier.gradient}`
        )}
      >
        <div className="relative flex h-full flex-col rounded-[inherit] border border-white/10 bg-black/20 px-7 py-9">
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
              <p className="text-sm text-white/65">{tier.tagline}</p>
            </div>
            <div className="flex items-baseline gap-2 text-white">
              <span className="text-4xl font-semibold">{tier.price}</span>
              <span className="text-sm text-white/60">{tier.priceDetail}</span>
            </div>
            <p className="text-sm text-white/65">{tier.description}</p>
          </div>
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 text-sm text-white/80">
            <div className="flex items-baseline justify-between text-xs uppercase tracking-[0.45em] text-white/60">
              <span>Monthly Tokens</span>
              <span className="text-xl font-semibold tracking-normal text-white">
                {tier.tokensPerMonth}
                <span className="ml-1 text-xs font-medium uppercase text-white/60">{tier.tokensLabel ?? 'tokens'}</span>
              </span>
            </div>
            <ul className="space-y-2 text-white/72">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-white/15 text-[10px] text-white/80">
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto pt-6">
            <Button
              className={clsx(
                'w-full rounded-full py-3 text-sm font-semibold transition-transform duration-200',
                tier.id === 'free'
                  ? 'bg-white text-slate-900 shadow-[0_20px_55px_rgba(15,23,42,0.35)] hover:-translate-y-[2px]'
                  : 'bg-white text-slate-900 shadow-[0_22px_60px_rgba(76,29,149,0.45)] hover:-translate-y-[2px]'
              )}
              disabled={isCurrent || isLoading}
              onClick={() => handleSelectTier(tier.id)}
            >
              {isCurrent
                ? 'Current plan'
                : isLoading
                  ? 'Preparing checkout…'
                  : tier.id === 'free'
                    ? 'Start creating'
                    : 'Upgrade with Wondertone'}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#120a3b_0%,#1f1680_45%,#032758_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(116,62,255,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,rgba(9,211,239,0.25),transparent_60%)]" />
      <FounderNavigation />
      <main className="relative pt-32 pb-24">
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

          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {TIERS.map(renderTierCard)}
          </div>

          <div className="mx-auto max-w-5xl space-y-6 rounded-[36px] border border-white/10 bg-gradient-to-br from-[#14152d]/90 via-[#101226]/90 to-[#13182c]/90 p-10 text-left shadow-[0_45px_110px_rgba(76,29,149,0.4)] backdrop-blur-xl">
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
