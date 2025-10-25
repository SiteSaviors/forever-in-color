import { memo } from 'react';
import type { Narrative } from '@/utils/storyLayer/copy';

type StoryHeaderProps = {
  styleName: string;
  narrative: Narrative;
};

const ICONS: Record<'sparkle' | 'home' | 'brush', string> = {
  sparkle: '✨',
  home: '🏡',
  brush: '🎨',
};

const StoryHeader = ({ styleName, narrative }: StoryHeaderProps) => {
  return (
    <section className="space-y-6 rounded-[32px] border border-white/12 bg-gradient-to-br from-white/[0.05] via-white/[0.04] to-white/[0.02] p-8 text-white shadow-[0_32px_120px_rgba(10,18,36,0.45)]">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.42em] text-white/45">Wondertone Story</p>
        <h3 className="font-display text-[30px] font-semibold leading-tight tracking-[-0.01em] md:text-[34px]">
          {`Wondertone Story — ${styleName}`}
        </h3>
        <p className="text-sm text-white/70 md:text-base">{narrative.headline}</p>
      </header>

      <p className="text-base leading-relaxed text-white/80 md:text-lg">{narrative.paragraph}</p>

      <dl className="grid gap-4 md:grid-cols-3">
        {narrative.bullets.map((bullet) => (
          <div
            key={bullet.label}
            className="rounded-2xl border border-white/12 bg-white/[0.06] p-4 text-sm text-white/80 transition-transform motion-safe:hover:-translate-y-1"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/55">
              <span aria-hidden="true">{ICONS[bullet.icon]}</span>
              {bullet.label}
            </div>
            <p className="mt-2 text-base font-semibold text-white">{bullet.value}</p>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default memo(StoryHeader);
