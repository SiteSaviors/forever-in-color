import { ChevronDown, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import type { ToneSection as ToneSectionType } from '@/store/hooks/useToneSections';
import { TONE_GRADIENTS } from '@/config/toneGradients';
import ToneStyleCard from './ToneStyleCard';

type ToneSectionProps = {
  section: ToneSectionType;
  onStyleSelect: (styleId: string, meta: { tone: string }) => void;
  isExpanded: boolean;
  onToggle: () => void;
};

export default function ToneSection({
  section,
  onStyleSelect,
  isExpanded,
  onToggle,
}: ToneSectionProps) {
  const { tone, definition, styles, locked } = section;
  const gradientConfig = TONE_GRADIENTS[tone];

  return (
    <div
      className={clsx(
        'relative rounded-xl overflow-hidden border border-white/10',
        'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        'backdrop-blur-sm',
        // Tone-specific gradient wash
        isExpanded
          ? `bg-gradient-to-br ${gradientConfig.expanded}`
          : `bg-gradient-to-br ${gradientConfig.collapsed}`,
        // Z-lift animation on expand
        isExpanded && [
          'scale-[1.02]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]',
          'will-change-transform'
        ]
      )}
    >
      {/* Tone Header (clickable to expand/collapse) */}
      <button
        onClick={onToggle}
        className={clsx(
          'w-full flex flex-col items-center justify-center p-5 relative',
          'transition-all duration-300',
          'hover:bg-white/5',
          !isExpanded && 'hover:scale-[1.005]', // Subtle invite on hover when collapsed
          // Neon glow on Trending hover
          tone === 'trending' && !isExpanded && 'hover:shadow-[0_0_30px_rgba(245,158,11,0.4),0_0_60px_rgba(245,158,11,0.2)]'
        )}
        aria-expanded={isExpanded}
        aria-controls={`tone-section-${tone}`}
      >
        {/* Centered Content */}
        <div className="flex flex-col items-center gap-2 w-full">
          {/* Icon + Title Row */}
          <div className="flex items-center gap-2">
            <span className="text-xl flex-shrink-0" aria-hidden="true">
              {definition.icon}
            </span>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              {definition.label}
            </h3>
            {/* Lock badge - only for Signature Tones, right-aligned, smaller */}
            {locked && tone === 'signature' && (
              <Lock className="w-3 h-3 text-purple-300 ml-1" aria-hidden="true" />
            )}
          </div>

          {/* Description - allow wrapping */}
          <p className="text-xs text-white/60 text-center leading-relaxed max-w-xs">
            {definition.description}
          </p>
        </div>

        {/* Chevron - absolute positioned bottom right */}
        <ChevronDown
          className={clsx(
            'w-5 h-5 text-white/60 transition-transform duration-200 absolute right-4 top-1/2 -translate-y-1/2',
            isExpanded && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Collapsible Style List */}
      {isExpanded && (
        <div
          id={`tone-section-${tone}`}
          className="p-2 space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-200"
          role="region"
          aria-label={`${definition.label} styles`}
        >
          {styles.length > 0 ? (
            styles.map((styleEntry) => (
              <ToneStyleCard
                key={styleEntry.option.id}
                styleEntry={styleEntry}
                onSelect={() => onStyleSelect(styleEntry.option.id, { tone })}
              />
            ))
          ) : (
            <div className="text-center py-6 text-white/40 text-sm">
              No styles available in this category
            </div>
          )}
        </div>
      )}
    </div>
  );
}
