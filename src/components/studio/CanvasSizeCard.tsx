import { memo } from 'react';
import { clsx } from 'clsx';
import type { CanvasSizeOption } from '@/utils/canvasSizes';
import { getCanvasSizeContextCopy } from '@/utils/canvasSizes';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface CanvasSizeCardProps {
  option: CanvasSizeOption;
  isSelected: boolean;
  isRecommended: boolean;
  isMostPopular: boolean;
  onSelect: () => void;
  showSocialProof?: boolean;
  _enableCountAnimation?: boolean; // Prefixed with _ as it's reserved for future use
}

/**
 * Canvas Size Selection Card
 * Displays canvas size option with badges, context copy, and pricing
 *
 * Features:
 * - "Best Match" badge for recommended sizes (based on image resolution)
 * - "Collector Favorite" badge for popular sizes
 * - Room-placement context copy
 * - Museum-grade quality indicator
 * - Optional social proof with live collector count
 */
export const CanvasSizeCardComponent: React.FC<CanvasSizeCardProps> = ({
  option,
  isSelected,
  isRecommended,
  isMostPopular,
  onSelect,
  showSocialProof = false,
  _enableCountAnimation = false,
}) => {
  const contextCopy = getCanvasSizeContextCopy(option.id);

  // Badge priority: Recommended > Most Popular
  const badgeText = isRecommended
    ? 'Best Match'
    : isMostPopular && !isRecommended
    ? 'Collector Favorite'
    : null;

  const badgeIsRecommended = isRecommended;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'relative rounded-2xl border px-4 py-4 text-left transition-all duration-200',
        // Base states
        isSelected
          ? 'border-purple-400 bg-purple-500/15 text-white shadow-glow-purple'
          : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10',
        // Recommended enhancement (when NOT selected)
        isRecommended && !isSelected && [
          'border-purple-400/70',
          'bg-purple-500/5',
          'shadow-[0_4px_24px_rgba(168,85,247,0.25)]',
        ],
        // Hover transforms
        isRecommended && !isSelected
          ? 'hover:scale-[1.015]'
          : !isSelected && 'hover:scale-[1.01]',
        // CRITICAL: Allow badge overflow
        'overflow-visible'
      )}
    >
      {/* Badge */}
      {badgeText && (
        <span
          className={clsx(
            'absolute -top-2 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg',
            badgeIsRecommended
              ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white'
              : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900',
            // Shimmer animation on first appearance
            'badge-shimmer-once'
          )}
          style={{
            // Use filter drop-shadow for proper shadow outside parent
            filter: badgeIsRecommended
              ? 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))'
              : 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.6))',
          }}
        >
          {badgeIsRecommended && '✨ '}
          {badgeText}
        </span>
      )}

      {/* Card Content */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{option.label}</p>
          {option.nickname && (
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">
              {option.nickname}
            </p>
          )}
          {contextCopy && (
            <p className="text-[11px] text-white/60 leading-snug">{contextCopy}</p>
          )}
        </div>
        <div className="text-right space-y-0.5">
          <span className="block text-sm font-semibold text-white/80">
            {currency.format(option.price)}
          </span>
          <p className="text-[10px] uppercase tracking-wider text-purple-300/60">
            Museum-Grade
          </p>
        </div>
      </div>

      {/* Social Proof (MVP: static text, count animation disabled by default) */}
      {showSocialProof && (
        <p className="mt-2 text-[10px] text-white/45 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
          Collector Favorite
        </p>
      )}
    </button>
  );
};

const CanvasSizeCard = memo(CanvasSizeCardComponent);

export default CanvasSizeCard;
