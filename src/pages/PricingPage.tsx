import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FounderNavigation from '@/components/navigation/FounderNavigation';
import Section from '@/components/layout/Section';
import TierCard from '@/components/ui/TierCard';
import PricingBenefitsStrip from '@/components/ui/PricingBenefitsStrip';
import FloatingOrbs from '@/components/ui/FloatingOrbs';
import { useAuthModal } from '@/store/useAuthModal';
import { useEntitlementsActions, useEntitlementsState } from '@/store/hooks/useEntitlementsStore';
import { useSessionState } from '@/store/hooks/useSessionStore';
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

const FREE_TIER: Tier = {
  id: 'free',
  name: 'Wondertone Free',
  tagline: 'Perfect for exploring styles and testing ideas',
  description: 'Begin your creative journey with 10 watermarked generations per month and full access to our core features.',
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
};

const PREMIUM_TIERS: Tier[] = [
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'Turn milestone memories into ready-to-print art',
    description: 'Unlock watermark-free previews, download-ready exports, and elevated social proof modules.',
    price: '$7.99',
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
    price: '$19.99',
    priceDetail: 'per month',
    tokensPerMonth: 150,
    tokensLabel: 'Tokens',
    features: [
      '150 premium generations / month',
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
    price: '$49.99',
    priceDetail: 'per month',
    tokensPerMonth: 400,
    tokensLabel: 'Tokens',
    features: [
      '400 premium generations / month',
      'Wondertone concierge team & white-label support',
      'Real-time teleprompter prompts for live events',
      'Priority queue (3× speed boost)',
      'Guaranteed Living Canvas production in 48h',
    ],
    gradient: 'from-[#ffa62e]/85 via-[#ff6b45]/85 to-[#f63b81]/85',
  },
];

const PricingPage = () => {
  const PENDING_CHECKOUT_TIER_KEY = 'wt_pending_checkout_tier';
  const { entitlements } = useEntitlementsState();
  const { sessionUser, accessToken } = useSessionState();
  const { hydrateEntitlements } = useEntitlementsActions();
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

  const startCheckout = useCallback(async (tier: TierId) => {
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
  }, [accessToken]);

  const handleSelectTier = useCallback(async (tier: TierId) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (tier === 'free') {
      navigate('/create');
      return;
    }

    if (!sessionUser) {
      try {
        window.sessionStorage.setItem(PENDING_CHECKOUT_TIER_KEY, tier);
      } catch {
        // ignore storage issues
      }
      openAuthModal('signup', { source: 'pricing' });
      return;
    }

    await startCheckout(tier);
  }, [navigate, openAuthModal, sessionUser, startCheckout]);

  useEffect(() => {
    if (!sessionUser || !accessToken) return;
    let pendingTier: TierId | null = null;
    try {
      const stored = window.sessionStorage.getItem(PENDING_CHECKOUT_TIER_KEY);
      pendingTier = stored ? (stored as TierId) : null;
    } catch {
      pendingTier = null;
    }
    if (pendingTier) {
      try {
        window.sessionStorage.removeItem(PENDING_CHECKOUT_TIER_KEY);
      } catch {
        // ignore
      }
      void handleSelectTier(pendingTier);
    }
  }, [sessionUser, accessToken, handleSelectTier]);


  return (
    <div className="noise-texture relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#0a0520_0%,#1a0d4d_35%,#0d1b3a_70%,#041628_100%)] text-white">
      {/* Base gradient overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(116,62,255,0.4),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,rgba(9,211,239,0.3),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_65%)]" />

      {/* Floating orbs background */}
      <FloatingOrbs />

      {/* Navigation */}
      <FounderNavigation />

      <main className="relative pb-24 pt-32">
        <Section className="space-y-20">
          {/* Hero section */}
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            {/* Badge for logged-in users */}
            {sessionUser && currentTier && currentTier !== 'free' && (
              <div className="animate-fadeIn inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-purple-200 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
                </span>
                Current: {currentTier} tier
              </div>
            )}

            {/* Main headline with gradient */}
            <h1 className="animate-scaleIn text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-white via-purple-100 to-cyan-100 bg-clip-text text-transparent">
                Choose the plan
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                that fits your story
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/75 md:text-xl">
              Scale from personal keepsakes to live pop-up studios with membership tiers designed for emotion-rich art.
              All plans include Wondertone&apos;s{' '}
              <span className="font-semibold text-purple-300">Living Canvas engine</span>,{' '}
              <span className="font-semibold text-cyan-300">curated style library</span>, and{' '}
              <span className="font-semibold text-pink-300">social momentum intelligence</span>.
            </p>

            {/* Status messages */}
            {successMessage && (
              <div className="animate-scaleIn mx-auto max-w-2xl rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✓</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="animate-scaleIn mx-auto max-w-2xl rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-200 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚠</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Hero: Free Tier */}
          <div className="mx-auto max-w-[900px]">
            <TierCard
              key={FREE_TIER.id}
              id={FREE_TIER.id}
              name={FREE_TIER.name}
              tagline={FREE_TIER.tagline}
              description={FREE_TIER.description}
              price={FREE_TIER.price}
              priceDetail={FREE_TIER.priceDetail}
              tokensPerMonth={FREE_TIER.tokensPerMonth}
              tokensLabel={FREE_TIER.tokensLabel}
              features={FREE_TIER.features}
              gradient={FREE_TIER.gradient}
              isCurrent={FREE_TIER.id === currentTier}
              isLoading={loadingTier === FREE_TIER.id}
              onSelect={() => handleSelectTier(FREE_TIER.id)}
              variant="wide"
            />
          </div>

          {/* Premium Tiers: 3-column grid */}
          <div className="mx-auto grid max-w-[1400px] gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {PREMIUM_TIERS.map((tier, index) => (
              <TierCard
                key={tier.id}
                id={tier.id}
                name={tier.name}
                tagline={tier.tagline}
                description={tier.description}
                price={tier.price}
                priceDetail={tier.priceDetail}
                tokensPerMonth={tier.tokensPerMonth}
                tokensLabel={tier.tokensLabel}
                features={tier.features}
                gradient={tier.gradient}
                isCurrent={tier.id === currentTier}
                isLoading={loadingTier === tier.id}
                onSelect={() => handleSelectTier(tier.id)}
                animationDelay={index * 100}
              />
            ))}
          </div>

          {/* Benefits strip */}
          <PricingBenefitsStrip />
        </Section>
      </main>
    </div>
  );
};

export default PricingPage;
