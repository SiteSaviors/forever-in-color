import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useFounderStore } from '@/store/useFounderStore';
import { useAuthModal } from '@/store/useAuthModal';

const AccountDropdown = lazy(() => import('@/components/navigation/AccountDropdown'));

const NAV_LINKS = [
  { id: 'studio', label: 'STUDIO', to: '/create#studio', type: 'anchor' as const },
  { id: 'styles', label: 'STYLES', to: '/#styles', type: 'anchor' as const },
  { id: 'pricing', label: 'PRICING', to: '/pricing', type: 'route' as const },
  { id: 'support', label: 'SUPPORT', to: '/#support', type: 'anchor' as const },
];

const FounderNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartItemCount = useFounderStore(
    (state) => state.enhancements.filter((enhancement) => enhancement.enabled).length
  );
  const entitlements = useFounderStore((state) => state.entitlements);
  const sessionUser = useFounderStore((state) => state.sessionUser);
  const sessionHydrated = useFounderStore((state) => state.sessionHydrated);
  const signOut = useFounderStore((state) => state.signOut);
  const openAuthModal = useAuthModal((state) => state.openModal);
  const [isAtTop, setIsAtTop] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const heroElement = document.querySelector('[data-founder-hero]') as HTMLElement | null;
    if (!heroElement) {
      setHeroVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroVisible(entry.intersectionRatio > 0.15);
      },
      {
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, [location.pathname]);

  const tokensRemaining = useMemo(() => {
    const remaining = entitlements.remainingTokens;
    if (remaining == null) {
      return '∞';
    }
    const value = Math.max(0, remaining);
    if (value >= 1000) {
      return `${Math.floor(value / 100) / 10}k`;
    }
    return value.toString();
  }, [entitlements.remainingTokens]);

  const tierLabel = useMemo(() => {
    switch (entitlements.tier) {
      case 'creator':
        return 'Creator';
      case 'plus':
        return 'Plus';
      case 'pro':
        return 'Pro';
      case 'dev':
        return 'Wonder Lab';
      case 'free':
        return 'Free';
      default:
        return 'Guest';
    }
  }, [entitlements.tier]);

  const remainingTokenDisplay = useMemo(() => {
    const value = entitlements.remainingTokens;
    if (value == null) return '∞';
    return Math.max(0, value).toString();
  }, [entitlements.remainingTokens]);

  const accountInitial = sessionUser?.email?.charAt(0).toUpperCase() ?? '✦';
  const userEmail = sessionUser?.email ?? 'Wondertone Creator';
  const isAuthenticated = Boolean(sessionUser);
  const accountLabel = isAuthenticated ? 'Account menu' : 'Sign in';
  const accountFallback = (
    <button
      type="button"
      onClick={() => {
        if (isAuthenticated) {
          navigate('/studio/usage');
        } else {
          openAuthModal('signin');
        }
      }}
      className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-white transition-all duration-200 hover:scale-105 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80"
      aria-label={accountLabel}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent opacity-0 transition-opacity duration-200 hover:opacity-100" />
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-purple-500/40 via-indigo-500/40 to-blue-500/40 text-sm font-semibold text-white">
        {accountInitial}
      </span>
    </button>
  );

  return (
    <div
      className={clsx(
        'fixed inset-x-0 top-0 z-40 transition-all duration-500',
        heroVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="mx-auto max-w-[1820px] px-4 sm:px-6 lg:px-10 pt-4">
        <div
          className={clsx(
            'flex items-center justify-between gap-6 rounded-3xl border px-5 sm:px-8 py-4 sm:py-5 transition-all duration-500',
            'shadow-[0_22px_65px_rgba(0,0,0,0.45)]',
            isAtTop
              ? 'bg-black border-white/10'
              : 'bg-black/70 border-white/15 backdrop-blur-xl'
          )}
        >
          <Link to="/" className="flex items-center gap-3 text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 rounded-2xl">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 text-lg font-semibold tracking-tight">
              <span className="absolute inset-0 rounded-2xl bg-white/10 blur-xl" />
              <span className="relative">W</span>
            </span>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">
                Wondertone
              </span>
              <span className="text-xl font-semibold tracking-tight text-white">AI Studio</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex lg:gap-8" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="group relative inline-flex items-center text-xs font-semibold tracking-[0.55em] text-white/70 transition duration-200 ease-out hover:text-white"
                onClick={(event) => {
                  if (link.type === 'anchor') {
                    const anchor = document.querySelector<HTMLElement>(
                      `[data-founder-anchor="${link.id}"]`
                    );
                    if (anchor) {
                      event.preventDefault();
                      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
              >
                {link.label}
                <span className="pointer-events-none absolute inset-x-0 -bottom-2 mx-auto h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-transform duration-200 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-purple-500/60 via-indigo-500/70 to-blue-500/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-[0_14px_45px_rgba(99,102,241,0.35)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_18px_55px_rgba(99,102,241,0.5)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              </span>
              <span>Tokens {tokensRemaining}</span>
            </div>

            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all duration-200 hover:scale-105 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80"
              aria-label="View cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5h2l1.68 9.02c.12.66.7 1.15 1.37 1.15h8.9c.66 0 1.24-.47 1.37-1.13L19 7H6"
                />
                <circle cx="9" cy="19" r="1.2" />
                <circle cx="16" cy="19" r="1.2" />
              </svg>
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 px-1.5 text-[10px] font-semibold text-black shadow-[0_0_15px_rgba(249,115,22,0.45)]">
                {cartItemCount}
              </span>
            </button>

            <Suspense fallback={accountFallback}>
              <AccountDropdown
                accountInitial={accountInitial}
                sessionHydrated={sessionHydrated}
                isAuthenticated={isAuthenticated}
                userEmail={userEmail}
                tierLabel={tierLabel}
                remainingTokenDisplay={remainingTokenDisplay}
                onNavigate={(path) => navigate(path)}
                onOpenAuthModal={openAuthModal}
                onSignOut={signOut}
                canUpgrade={entitlements.tier !== 'pro'}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderNavigation;
