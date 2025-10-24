import { memo } from 'react';
import { Sparkles, Home, Brush } from 'lucide-react';
import type { Narrative } from '@/utils/storyLayer/copy';

type StoryCardProps = {
  previewUrl: string;
  narrative: Narrative;
  styleName: string;
};

const bulletIconMap = {
  sparkle: Sparkles,
  home: Home,
  brush: Brush,
} as const;

const StoryCard = ({ previewUrl, narrative, styleName }: StoryCardProps) => {
  return (
    <div className="rounded-[2.75rem] border border-white/12 bg-slate-950/65 backdrop-blur-lg px-6 py-8 sm:px-10 sm:py-12 shadow-[0_25px_80px_rgba(15,23,42,0.45)]">
      <div className="grid items-stretch gap-8 md:gap-12 md:grid-cols-[minmax(0,360px)_1fr]">
        <div className="relative flex h-full w-full overflow-hidden rounded-[2.25rem] border border-white/10 bg-slate-900/65 shadow-[0_40px_80px_rgba(30,41,59,0.45)]">
          <img
            src={previewUrl}
            alt={`${styleName} preview`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute top-4 left-4 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/80 backdrop-blur">
            Studio Preview
          </div>
        </div>
        <div className="flex h-full flex-col justify-center gap-5 text-white">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.45em] text-white/55">Narrative</p>
            <h3 className="text-3xl font-display leading-tight sm:text-[2.5rem]">{narrative.headline}</h3>
            <p className="text-sm text-white/70 md:text-base leading-relaxed max-w-xl">{narrative.paragraph}</p>
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:gap-6 md:grid-cols-3">
        {narrative.bullets.map((bullet) => {
          const Icon = bulletIconMap[bullet.icon];
          return (
            <div
              key={bullet.label}
              className="flex flex-col gap-2 rounded-[1.75rem] border border-white/12 bg-white/6 px-5 py-4 shadow-[0_20px_55px_rgba(24,35,52,0.45)] backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
                <Icon className="h-3.5 w-3.5 text-white/70" />
                <span>{bullet.label}</span>
              </div>
              <p className="text-sm font-medium text-white/90 leading-relaxed">{bullet.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(StoryCard);
