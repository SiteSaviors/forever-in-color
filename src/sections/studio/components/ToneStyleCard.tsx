import { Lock, Star, Sparkles, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import type { ToneSectionStyle } from '@/store/hooks/useToneSections';

type ToneStyleCardProps = {
  styleEntry: ToneSectionStyle;
  onSelect: () => void;
  showFavorite?: boolean; // Optional: enable when favorites UI is ready
};

export default function ToneStyleCard({
  styleEntry,
  onSelect,
  showFavorite = false,
}: ToneStyleCardProps) {
  const { option, gate, isSelected, isFavorite } = styleEntry;
  const isLocked = !gate.allowed;

  // Badge rendering helper
  const renderBadge = (badge: string) => {
    const badgeConfig: Record<string, { icon: React.ReactNode; className: string }> = {
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
          'inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded',
          config.className
        )}
      >
        {config.icon}
        {badge}
      </span>
    );
  };

  return (
    <button
      onClick={onSelect}
      aria-disabled={isLocked ? 'true' : 'false'}
      aria-label={
        isLocked
          ? `${option.name} - Locked - Requires ${gate.requiredTier?.toUpperCase()} tier`
          : option.name
      }
      className={clsx(
        'group w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',
        isSelected && !isLocked
          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400 shadow-lg shadow-purple-500/20'
          : isLocked
          ? 'bg-slate-800/40 border border-white/5 hover:border-purple-400/50 hover:shadow-md hover:shadow-purple-500/10 cursor-pointer'
          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-md'
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
        <img
          src={option.thumbnail}
          alt=""
          loading="lazy"
          decoding="async"
          className={clsx(
            'w-full h-full object-cover transition-all duration-200',
            isLocked && 'opacity-40 grayscale',
            !isLocked && 'group-hover:scale-105'
          )}
        />
        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <Lock className="w-5 h-5 text-purple-300 drop-shadow-lg" />
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
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p
            className={clsx(
              'text-sm font-semibold truncate',
              isLocked ? 'text-white/50' : 'text-white'
            )}
          >
            {option.name}
          </p>
          {/* Badges */}
          {option.badges && option.badges.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {option.badges.map((badge) => renderBadge(badge))}
            </div>
          )}
        </div>
        <p
          className={clsx(
            'text-xs mt-0.5 line-clamp-1',
            isLocked ? 'text-white/30' : 'text-white/60'
          )}
        >
          {option.description}
        </p>
        {/* Lock Message */}
        {isLocked && gate.requiredTier && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-purple-400 font-semibold">
            <Lock className="w-3 h-3" />
            {gate.requiredTier.toUpperCase()} required
          </span>
        )}
      </div>

      {/* Optional: Favorite Icon (for Phase 4) */}
      {showFavorite && isFavorite && (
        <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0 animate-in zoom-in-50 duration-200" />
      )}
    </button>
  );
}
