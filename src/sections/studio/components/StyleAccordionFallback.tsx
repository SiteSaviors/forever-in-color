import { STYLE_TONE_DEFINITIONS, STYLE_TONES_IN_ORDER } from '@/config/styleCatalog';
import ToneSkeletonCard from './ToneSkeletonCard';

const SKELETONS_PER_TONE = 3;

export default function StyleAccordionFallback() {
  return (
    <div className="relative space-y-4">
      {STYLE_TONES_IN_ORDER.map((tone) => {
        const definition = STYLE_TONE_DEFINITIONS[tone];

        return (
          <div
            key={tone}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-[2px]"
          >
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.04em] text-white md:text-base font-display">
                  {definition.label}
                </h3>
              </div>
              <p className="mt-1 text-xs text-white/60 md:text-sm md:leading-relaxed">
                {definition.description}
              </p>
            </div>

            <div className="px-4 pb-5 pt-2 space-y-2">
              {Array.from({ length: SKELETONS_PER_TONE }).map((_, index) => (
                <ToneSkeletonCard key={index} tone={tone} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
