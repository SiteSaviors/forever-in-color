import { memo } from 'react';
import clsx from 'clsx';
import type { StyleOption } from '@/store/useFounderStore';
import { STUDIO_V2_COPY } from '@/config/studioV2Copy';

type StoryTeaserProps = {
  highlightedStyle: StyleOption | null;
  stage: 'pre-upload' | 'post-upload';
};

const StoryTeaser = ({ highlightedStyle, stage }: StoryTeaserProps) => {
  const hasStyle = stage === 'post-upload' && Boolean(highlightedStyle);
  const headline =
    stage === 'post-upload' && highlightedStyle
      ? STUDIO_V2_COPY.storyHeader(highlightedStyle.name)
      : STUDIO_V2_COPY.insightsHeadline;

  if (!hasStyle && stage === 'pre-upload') {
    return (
      <section className="text-white">
        <div className="rounded-[32px] border border-white/25 bg-gradient-to-br from-[#111a38] via-[#182552] to-[#0a132f] px-8 py-10 shadow-[0_32px_96px_rgba(8,14,32,0.55)]">
          <p className="text-xs uppercase tracking-[0.42em] text-white/60">Wondertone Story</p>
          <h2 className="font-display text-[32px] leading-tight tracking-[-0.01em] text-white mt-4">
            Discover Your Style
          </h2>
          <p className="text-base text-white/75 mt-4 max-w-xs">
            Discover the magic that makes style_name unique.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.42em] text-white/50">
          Wondertone Story
        </p>
        <h2
          className={clsx(
            'font-display text-3xl tracking-[-0.01em] text-white lg:text-[34px]',
            'font-semibold'
          )}
        >
          {headline}
        </h2>
        <p className="text-sm text-white/65 lg:text-base">{STUDIO_V2_COPY.insightsSubtext}</p>
      </header>
    </section>
  );
};

export default memo(StoryTeaser);
