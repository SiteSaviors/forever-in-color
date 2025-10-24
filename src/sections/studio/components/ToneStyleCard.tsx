import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock, Star, Sparkles, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import type { ToneSectionStyle } from '@/store/hooks/useToneSections';
import { TONE_GRADIENTS } from '@/config/toneGradients';
import { toneCardSpring } from '../motion/toneAccordionMotion';
import './ToneStyleCard.css';

type ToneStyleCardProps = {
  styleEntry: ToneSectionStyle;
  onSelect: () => void;
  showFavorite?: boolean; // Optional: enable when favorites UI is ready
  layout?: 'default' | 'hero';
  heroDescription?: string;
  prefersReducedMotion?: boolean;
};

export default function ToneStyleCard({
  styleEntry,
  onSelect,
  showFavorite = false,
  layout = 'default',
  heroDescription,
  prefersReducedMotion: prefersReducedMotionProp,
}: ToneStyleCardProps) {
  const { option, gate, isSelected, isFavorite, metadataTone } = styleEntry;
  const isLocked = !gate.allowed;
  const [isAnimating, setIsAnimating] = useState(false);
  const isHero = layout === 'hero';
  const reduceMotionFromContext = useReducedMotion();
  const prefersReducedMotion = prefersReducedMotionProp ?? reduceMotionFromContext;
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingParallaxRef = useRef<{ x: number; y: number } | null>(null);

  // Get tone accent color for ink ripple effect
  const toneAccentColor = TONE_GRADIENTS[metadataTone]?.accent || '#8b5cf6';
  const toneKeyline = TONE_GRADIENTS[metadataTone]?.keyline || 'rgba(147, 197, 253, 0.45)';

  const toRgba = (color: string, alpha: number): string => {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (color.startsWith('rgba')) {
      const parts = color.match(/rgba\(([^)]+)\)/)?.[1].split(',').map((part) => part.trim());
      if (parts && parts.length >= 3) {
        const [r, g, b] = parts;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
    if (color.startsWith('rgb')) {
      const parts = color.match(/rgb\(([^)]+)\)/)?.[1].split(',').map((part) => part.trim());
      if (parts && parts.length === 3) {
        const [r, g, b] = parts;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
    return color;
  };

  const glowColor = toRgba(toneAccentColor, 0.35);
  const glowSoftColor = toRgba(toneAccentColor, 0.18);

  const handleSelect = () => {
    if (!isLocked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    onSelect();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const scheduleParallaxUpdate = (next: { x: number; y: number }) => {
    pendingParallaxRef.current = next;
    if (rafRef.current != null) {
      return;
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingParallaxRef.current) {
        setParallax(pendingParallaxRef.current);
      }
    });
  };

  const handlePointerMove: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    if (prefersReducedMotion || isLocked) return;
    if (!cardRef.current) return;
    if (!rectRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
    const rect = rectRef.current;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const intensity = isHero ? 12 : 8;
    scheduleParallaxUpdate({
      x: x * intensity,
      y: y * (isHero ? 8 : 5),
    });
  };

  const resetParallax = () => {
    if (!prefersReducedMotion) {
      pendingParallaxRef.current = { x: 0, y: 0 };
      rectRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setParallax({ x: 0, y: 0 });
    }
  };

  // Badge rendering helper
  const renderBadge = (badge: string) => {
    const badgeConfig: Record<string, { icon: ReactNode; className: string }> = {
      new: {
        icon: <Sparkles className="w-3 h-3" />,
        className: 'bg-green-500/20 text-green-300',
      },
      trending: {
        icon: <TrendingUp className="w-3 h-3" />,
        className: 'bg-purple-500/20 text-purple-300',
      },
      popular: {
        icon: <Star className="w-3 h-3 fill-current" />,
        className: 'bg-yellow-500/20 text-yellow-300',
      },
      exclusive: {
        icon: <Lock className="w-3 h-3" />,
        className: 'bg-blue-500/20 text-blue-300',
      },
    };

    const config = badgeConfig[badge.toLowerCase()];
    if (!config) return null;

    return (
      <span
        key={badge}
        className={clsx(
          'relative overflow-hidden',
          'inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded',
          config.className,
          // Shimmer effect
          'before:absolute before:inset-0 before:translate-x-[-100%]',
          'before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent',
          'before:animate-badge-shimmer'
        )}
      >
        {config.icon}
        {badge}
      </span>
    );
  };

  const hoverMotion = !prefersReducedMotion && !isLocked
    ? {
        y: isHero ? -6 : -4,
        scale: isHero ? 1.007 : 1.012,
      }
    : undefined;

  const tapMotion = !prefersReducedMotion && !isLocked
    ? {
        scale: 0.97,
      }
    : undefined;

  const thumbnailStyle: CSSProperties =
    !prefersReducedMotion && !isLocked
      ? {
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
        }
      : {};

  const hoverEnabled = !isLocked && !isSelected;
  const cardClassName = clsx(
    'tone-style-card group relative w-full rounded-xl overflow-hidden transition-all duration-200',
    isHero
      ? 'flex flex-col gap-5 bg-white/10 border border-white/15 px-5 py-5 md:flex-row md:items-center'
      : 'flex items-center gap-4 rounded-lg px-4 py-3.5 md:py-4',
    'focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',
    isSelected && !isLocked
      ? 'bg-gradient-border-selected border-2 border-transparent shadow-lg shadow-purple-500/20'
      : isLocked
      ? 'bg-slate-800/40 border border-white/5 hover:border-purple-400/50 hover:shadow-md hover:shadow-purple-500/10 cursor-pointer'
      : isHero
      ? 'border border-white/20 hover:border-white/30 hover:bg-white/10'
      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]',
    hoverEnabled && 'hover-enabled',
    isLocked && 'locked',
    isSelected && 'selected'
  );

  const cardStyle = {
    '--tone-glow': glowColor,
    '--tone-glow-soft': glowSoftColor,
  } as CSSProperties;

  return (
    <motion.button
      ref={cardRef}
      onClick={handleSelect}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
      onPointerDown={resetParallax}
      onPointerUp={resetParallax}
      aria-disabled={isLocked ? 'true' : 'false'}
      aria-label={
        isLocked
          ? `${option.name} - Locked - Requires ${gate.requiredTier?.toUpperCase()} tier`
          : option.name
      }
      className={cardClassName}
      style={cardStyle}
      whileHover={hoverMotion}
      whileTap={tapMotion}
      transition={toneCardSpring}
    >
      {/* Ink blot ripple effect on selection */}
      {isAnimating && !isLocked && (
        <div
          className="absolute inset-0 pointer-events-none z-20 animate-ink-ripple"
          style={{
            background: `radial-gradient(circle, ${toneAccentColor}40 0%, transparent 70%)`,
          }}
        />
      )}
      {/* Thumbnail */}
      <div
        className={clsx(
          'relative overflow-hidden flex-shrink-0 shadow-lg',
          isHero ? 'h-28 w-full rounded-2xl md:h-28 md:w-28' : 'h-16 w-16 rounded-2xl md:h-[72px] md:w-[72px]'
        )}
        style={{ ...thumbnailStyle, aspectRatio: isHero ? 'auto' : '1' }}
      >
        <picture>
          {option.thumbnailAvif && (
            <source srcSet={option.thumbnailAvif} type="image/avif" />
          )}
          {option.thumbnailWebp && (
            <source srcSet={option.thumbnailWebp} type="image/webp" />
          )}
          <img
            src={option.thumbnail}
            alt=""
            width={isHero ? 112 : 64}
            height={isHero ? 112 : 64}
            loading="lazy"
            decoding="async"
            className={clsx(
              'h-full w-full object-cover transition-all duration-200',
              isLocked && 'opacity-60',
              !isLocked && 'group-hover:scale-105'
            )}
            style={{ aspectRatio: '1', contentVisibility: 'auto' }}
          />
        </picture>
        {/* Glass overlay with gold border for locked styles */}
        {isLocked && (
          <div
            className={clsx(
              'absolute inset-0 z-10 rounded-lg flex items-center justify-center',
              'bg-gradient-to-br from-slate-900/45 to-slate-900/70 backdrop-blur-md',
              'border border-transparent bg-gradient-border-gold',
              'transition-all duration-300'
            )}
          >
            {/* Shimmer effect on hover */}
            <div
              className={clsx(
                'absolute inset-0 bg-gradient-to-r from-transparent via-white/16 to-transparent translate-x-[-120%]',
                prefersReducedMotion ? '' : 'group-hover:translate-x-[120%] animate-premium-shimmer'
              )}
            />

            {/* Lock icon with pulsing glow */}
            <Lock className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse-slow relative z-10" />
          </div>
        )}
        {/* Selected Checkmark */}
        {isSelected && !isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-500/40 backdrop-blur-[1px] animate-in fade-in-0 zoom-in-50 duration-200">
            <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Style Info */}
      <div
        className={clsx(
          'flex-1 min-w-0 text-left',
          isHero ? 'flex flex-col gap-2' : 'flex flex-col gap-1.5'
        )}
      >
        <div
          className={clsx(
            'flex flex-wrap items-center gap-2',
            isHero ? 'mb-1.5' : 'mb-1'
          )}
        >
          <div
            className={clsx(
              'flex w-full flex-col gap-2',
              isHero ? 'md:flex-row md:items-center md:justify-between md:gap-4' : 'sm:flex-row sm:items-center sm:gap-2'
            )}
          >
            <p
              className={clsx(
                'font-display drop-shadow-[0_1px_6px_rgba(10,15,35,0.45)]',
                isHero
                  ? 'text-lg uppercase tracking-[0.14em] md:text-xl'
                  : 'text-lg tracking-[0.08em] text-left',
                isLocked ? 'text-white/55' : 'text-white'
              )}
              style={
                isHero
                  ? {
                      borderBottom: `1px solid ${toneKeyline}`,
                      paddingBottom: '0.25rem',
                      letterSpacing: '0.08em',
                    }
                  : undefined
              }
            >
              {option.name}
            </p>
            {gate.requiredTier && (
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-semibold tracking-[0.25em] text-white/80">
                {gate.requiredTier.toUpperCase()}
              </span>
            )}
          </div>
          {/* Badges */}
          {option.badges && option.badges.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {option.badges.map((badge) => renderBadge(badge))}
            </div>
          )}
        </div>
        <p
          className={clsx(
            isHero
              ? 'text-sm text-left md:text-base md:leading-relaxed'
              : 'mt-0.5 text-sm text-left leading-snug line-clamp-2',
            isLocked ? 'text-white/35' : 'text-white/70'
          )}
          style={{
            textShadow: '0 1px 4px rgba(8, 13, 30, 0.45)',
          }}
        >
          {isHero ? heroDescription : option.description}
        </p>
        {/* Lock Message */}
        {isLocked && gate.requiredTier && (
          <span
            className={clsx(
              'inline-flex items-center gap-2 text-[10px] font-semibold text-purple-200/90',
              isHero ? 'mt-2' : 'mt-1.5'
            )}
          >
            <Lock className="w-3 h-3" />
            Unlock with {gate.requiredTier.toUpperCase()} plan
          </span>
        )}
      </div>

      {/* Optional: Favorite Icon (for Phase 4) */}
      {showFavorite && isFavorite && (
        <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0 animate-in zoom-in-50 duration-200" />
      )}
    </motion.button>
  );
}
