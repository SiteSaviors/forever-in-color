import { memo, useMemo } from 'react';
import clsx from 'clsx';
import type { StyleOption } from '@/store/useFounderStore';
import { STUDIO_V2_COPY } from '@/config/studioV2Copy';
import { getPalette } from '@/utils/storyLayer/copy';
import { expandPaletteSwatches } from '@/utils/studioV2/palette';

type StoryTeaserProps = {
  highlightedStyle: StyleOption | null;
  stage: 'pre-upload' | 'post-upload';
};

const PALETTE_SIZE = 6;

const StoryTeaser = ({ highlightedStyle, stage }: StoryTeaserProps) => {
  const palette = useMemo(() => {
    if (!highlightedStyle) return null;
    try {
      return getPalette(highlightedStyle);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[StoryTeaser] palette lookup failed', error);
      }
      return null;
    }
  }, [highlightedStyle]);

  const paletteChips = useMemo(() => {
    if (!palette || palette.length === 0) return null;
    return expandPaletteSwatches(palette, PALETTE_SIZE);
  }, [palette]);

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
            Select an art style to discover the magic behind the art.
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

      {hasStyle ? (
        <article className="relative overflow-hidden rounded-[28px] border border-white/18 bg-white/[0.06] p-6 shadow-[0_30px_90px_rgba(12,18,33,0.45)]">
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
              {stage === 'pre-upload' ? 'Preview Glimpse' : 'Story Preview'}
            </div>
            <div className="space-y-3">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-white">
                {`Why ${highlightedStyle?.name ?? ''} feels special`}
              </h3>
              <p className="text-sm leading-relaxed text-white/80">
                {highlightedStyle?.description}
              </p>
            </div>

            {paletteChips ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                  Palette Glimpse
                </p>
                <ul className="grid grid-cols-6 gap-2">
                  {paletteChips.map((swatch, index) => (
                    <li key={`${swatch.id}-${index}`} className="space-y-1 text-center">
                      <div
                        className="mx-auto h-10 w-10 rounded-full border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
                        style={{ backgroundColor: swatch.hex }}
                        aria-label={`${swatch.label} swatch`}
                      />
                      <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">
                        {swatch.label}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <footer>
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">
                {STUDIO_V2_COPY.storyTeaserFooter}
              </p>
            </footer>
          </div>
        </article>
      ) : (
        null
      )}
    </section>
  );
};

export default memo(StoryTeaser);
