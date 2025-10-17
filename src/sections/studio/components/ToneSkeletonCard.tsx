import { clsx } from 'clsx';
import { TONE_GRADIENTS } from '@/config/toneGradients';
import type { StyleTone } from '@/config/styleCatalog';

type ToneSkeletonCardProps = {
  tone: StyleTone;
};

/**
 * Tone-colored skeleton loading state for style cards
 * Maintains visual language with tone-specific shimmer
 */
export default function ToneSkeletonCard({ tone }: ToneSkeletonCardProps) {
  const gradientConfig = TONE_GRADIENTS[tone];

  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-white/10 animate-pulse">
      {/* Thumbnail skeleton with tone-colored shimmer */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700/50">
        {/* Tone-colored base */}
        <div className={clsx(
          'absolute inset-0',
          `bg-gradient-to-br ${gradientConfig.collapsed}`
        )} />

        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-skeleton-shimmer"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent, ${gradientConfig.accent}20, transparent)`,
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      {/* Text placeholder */}
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-slate-700/50" />
        <div className="h-2 w-full rounded bg-slate-700/30" />
      </div>
    </div>
  );
}
