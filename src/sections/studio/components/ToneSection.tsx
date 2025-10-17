import { ChevronDown, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import type { ToneSection as ToneSectionType } from '@/store/hooks/useToneSections';
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

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/40 backdrop-blur-sm">
      {/* Tone Header (clickable to expand/collapse) */}
      <button
        onClick={onToggle}
        className={clsx(
          'w-full flex flex-col items-center justify-center p-5 transition-all duration-200 relative',
          locked && tone === 'signature'
            ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/15 hover:to-blue-500/15'
            : 'bg-white/5 hover:bg-white/10',
          isExpanded && 'bg-white/10'
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
