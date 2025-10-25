import { memo, useMemo } from 'react';
import type { Narrative } from '@/utils/storyLayer/copy';

type DiscoverGridProps = {
  narrative: Narrative;
};

const DiscoverGrid = ({ narrative }: DiscoverGridProps) => {
  const cards = useMemo(() => {
    const base = [
      {
        key: 'narrative',
        title: 'Narrative',
        body: narrative.paragraph,
      },
    ];
    return [
      ...base,
      ...narrative.bullets.map((bullet) => ({
        key: bullet.label.toLowerCase().replace(/\s+/g, '-'),
        title: bullet.label,
        body: bullet.value,
      })),
    ].slice(0, 4);
  }, [narrative]);

  if (!cards.length) return null;

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {cards.map((card, index) => (
        <article
          key={card.key}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-6 text-white shadow-[0_26px_80px_rgba(8,14,25,0.45)] transition-transform motion-safe:hover:-translate-y-1"
          style={{ transitionDelay: `${index * 40}ms` }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.12),transparent_60%)] opacity-70"
          />
          <div className="relative space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/55">{card.title}</p>
            <p className="text-sm leading-relaxed text-white/80">{card.body}</p>
          </div>
        </article>
      ))}
    </section>
  );
};

export default memo(DiscoverGrid);
