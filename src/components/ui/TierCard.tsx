import { clsx } from 'clsx';
import Button from './Button';

type TierId = 'free' | 'creator' | 'plus' | 'pro';

type TierCardProps = {
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
  isCurrent: boolean;
  isLoading: boolean;
  onSelect: () => void;
  variant?: 'standard' | 'wide';
  animationDelay?: number;
};

// Tier-specific glow effects
const tierGlowClasses: Record<TierId, string> = {
  free: '',
  creator: 'hover:shadow-[0_0_40px_rgba(108,61,242,0.4)]',
  plus: 'hover:shadow-[0_0_40px_rgba(49,168,255,0.4)]',
  pro: 'hover:shadow-[0_0_40px_rgba(255,166,46,0.4)]',
};

// Tier-specific accent colors for current badge
const tierAccentClasses: Record<TierId, string> = {
  free: 'from-slate-500/80 to-slate-600/80 border-slate-400/40',
  creator: 'from-purple-500/80 to-indigo-500/80 border-purple-400/40',
  plus: 'from-cyan-500/80 to-blue-500/80 border-cyan-400/40',
  pro: 'from-orange-500/80 to-pink-500/80 border-orange-400/40',
};

const TierCard = ({
  id,
  name,
  tagline,
  description,
  price,
  priceDetail,
  tokensPerMonth,
  tokensLabel = 'tokens',
  features,
  gradient,
  isCurrent,
  isLoading,
  onSelect,
  variant = 'standard',
  animationDelay = 0,
}: TierCardProps) => {
  const isWide = variant === 'wide';

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-[32px] transition-all duration-500',
        isWide ? 'hover:scale-[1.01]' : 'hover:scale-[1.03]',
        tierGlowClasses[id]
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Outer glow ring - tier specific */}
      {id !== 'free' && (
        <div
          className={clsx(
            'pointer-events-none absolute inset-0 rounded-[32px] opacity-0 transition-opacity duration-500 group-hover:opacity-100',
            id === 'creator' && 'bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-transparent blur-xl',
            id === 'plus' && 'bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-transparent blur-xl',
            id === 'pro' && 'bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-transparent blur-xl'
          )}
        />
      )}

      {/* Main card container */}
      <div
        className={clsx(
          'relative h-full overflow-hidden rounded-[32px] border border-white/15 backdrop-blur-xl transition-all duration-300',
          id === 'free' ? 'bg-[#1d2035]/80' : `bg-gradient-to-br ${gradient}`
        )}
      >
        {/* Shimmer effect on hover */}
        <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />

        {/* Inner glass panel */}
        <div
          className={clsx(
            'relative flex h-full rounded-[inherit] border border-white/10 bg-black/20 px-10 py-10',
            isWide ? 'min-h-[420px] flex-col md:flex-row md:items-center md:gap-12' : 'min-h-[580px] flex-col'
          )}
        >
          {/* Current plan badge */}
          {isCurrent && (
            <div
              className={clsx(
                'absolute rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider',
                'bg-gradient-to-r shadow-lg',
                tierAccentClasses[id],
                isWide ? 'right-8 top-8' : 'right-6 top-6'
              )}
            >
              <span className="relative z-10 text-white">Current Plan</span>
            </div>
          )}

          {/* Left section (or top section for standard) - Header & Description */}
          <div className={clsx('space-y-4', isWide && 'md:w-2/5 md:flex-shrink-0')}>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold leading-tight text-white md:text-3xl">{name}</h3>
              <p className="text-sm leading-[1.6] text-white/70">{tagline}</p>
            </div>

            {/* Price display */}
            <div className="flex items-baseline gap-2 py-2">
              <span
                className={clsx(
                  'text-5xl font-bold tracking-tight',
                  id === 'free' ? 'text-white' : 'bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent'
                )}
              >
                {price}
              </span>
              <span className="text-sm text-white/50">{priceDetail}</span>
            </div>

            <p className="text-sm leading-[1.625] text-white/65">{description}</p>
          </div>

          {/* Right section (or bottom section for standard) - Token Panel & Features */}
          <div className={clsx('flex flex-col', isWide ? 'mt-8 md:mt-0 md:flex-1' : 'mt-8 flex-1')}>
            {/* Token allowance panel */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-7 shadow-inner backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
                  Monthly Tokens
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={clsx(
                      'text-3xl font-bold transition-all duration-300',
                      id === 'free' ? 'text-white' : 'bg-gradient-to-r bg-clip-text text-transparent',
                      id === 'creator' && 'from-purple-300 to-indigo-300',
                      id === 'plus' && 'from-cyan-300 to-blue-300',
                      id === 'pro' && 'from-orange-300 to-pink-300'
                    )}
                  >
                    {tokensPerMonth}
                  </span>
                  <span className="text-xs font-medium uppercase text-white/50">{tokensLabel}</span>
                </div>
              </div>
            </div>

            {/* Features list */}
            <ul className="mt-6 space-y-3.5 text-sm">
              {features.map((feature, index) => (
                <li key={index} className="group/feature flex items-start gap-3 transition-all hover:translate-x-1">
                  {/* Check icon with gradient */}
                  <span
                    className={clsx(
                      'mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-all',
                      id === 'free'
                        ? 'border-white/20 bg-white/15 text-white/70'
                        : 'border-white/30 bg-gradient-to-br text-white shadow-sm',
                      id === 'creator' && 'from-purple-400/30 to-indigo-400/30',
                      id === 'plus' && 'from-cyan-400/30 to-blue-400/30',
                      id === 'pro' && 'from-orange-400/30 to-pink-400/30',
                      'group-hover/feature:scale-110'
                    )}
                  >
                    ✓
                  </span>
                  <span className="leading-[1.625] text-white/75 group-hover/feature:text-white/90">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="mt-auto pt-8">
              <Button
                className={clsx(
                  'relative flex w-full items-center justify-center overflow-hidden rounded-full py-4 text-sm font-semibold shadow-2xl transition-all duration-300',
                  id === 'free'
                    ? 'bg-white text-slate-900 shadow-[0_20px_60px_rgba(255,255,255,0.15)] hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(255,255,255,0.2)]'
                    : 'bg-white text-slate-900 hover:-translate-y-2',
                  id === 'creator' &&
                    'shadow-[0_20px_60px_rgba(108,61,242,0.5)] hover:shadow-[0_25px_70px_rgba(108,61,242,0.6)]',
                  id === 'plus' &&
                    'shadow-[0_20px_60px_rgba(49,168,255,0.5)] hover:shadow-[0_25px_70px_rgba(49,168,255,0.6)]',
                  id === 'pro' &&
                    'shadow-[0_20px_60px_rgba(255,166,46,0.5)] hover:shadow-[0_25px_70px_rgba(255,166,46,0.6)]',
                  'disabled:translate-y-0 disabled:opacity-70'
                )}
                disabled={isCurrent || isLoading}
                onClick={onSelect}
              >
                {/* Loading shimmer overlay */}
                {isLoading && (
                  <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                )}
                <span className="relative z-10">
                  {isCurrent
                    ? 'Current plan'
                    : isLoading
                      ? 'Preparing checkout…'
                      : id === 'free'
                        ? 'Start creating'
                        : 'Upgrade with Wondertone'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierCard;
