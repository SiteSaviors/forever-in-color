import { memo } from 'react';
import { clsx } from 'clsx';
import type { Narrative } from '@/utils/storyLayer/copy';

type PreviewShowcaseProps = {
  previewUrl: string | null;
  orientation: 'vertical' | 'square' | 'horizontal';
  styleName: string | null;
  narrative?: Narrative | null;
  ready: boolean;
};

const orientationRatio: Record<PreviewShowcaseProps['orientation'], string> = {
  vertical: '3 / 4',
  square: '1 / 1',
  horizontal: '16 / 9',
};

const PreviewShowcase = ({
  previewUrl,
  orientation,
  styleName,
  narrative,
  ready,
}: PreviewShowcaseProps) => {
  const ratio = orientationRatio[orientation] ?? '1 / 1';

  const headline = ready && narrative ? narrative.headline : 'Your Wondertone preview is moments away';
  const paragraph =
    ready && narrative
      ? narrative.paragraph
      : 'Upload a photo to generate a personalized Wondertone story, complete with curated talking points for your space.';

  const bullets =
    ready && narrative
      ? narrative.bullets.slice(0, 3).map((bullet) => ({
          label: bullet.label,
          value: bullet.value,
        }))
      : [
          {
            label: 'Photo Tip',
            value: 'Choose a crisp photo with soft, even lighting for the richest transformation.',
          },
          {
            label: 'Style Tip',
            value: 'Hover any style to preview the palette and vibes before you commit.',
          },
          {
            label: 'Canvas Tip',
            value: 'Portrait, square, or landscape—Wondertone adapts layouts to fit your walls.',
          },
        ];

  return (
    <section className="rounded-[32px] border border-white/12 bg-slate-950/65 px-6 py-7 shadow-[0_24px_70px_rgba(8,14,32,0.45)] backdrop-blur">
      <div
        className={clsx(
          'flex flex-col gap-6',
          'md:gap-7'
        )}
      >
        <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-slate-900/60 shadow-[0_30px_70px_rgba(15,23,42,0.45)]">
          <div
            className="w-full"
            style={{
              aspectRatio: ratio,
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={styleName ? `${styleName} preview` : 'Wondertone preview'}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-900/70 text-center text-sm text-white/60 px-6">
                Upload a photo to see Wondertone render a tailored preview here.
              </div>
            )}
          </div>
          <div className="absolute top-3 left-3 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/75 backdrop-blur-sm">
            {ready ? 'Live Preview' : 'Awaiting Upload'}
          </div>
        </div>
        <div className="space-y-4 text-white">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.42em] text-white/50">Wondertone Narrative</p>
            <h3 className="text-2xl font-display leading-tight">{headline}</h3>
            <p className="text-sm text-white/70 leading-relaxed">{paragraph}</p>
          </div>
          <div className="grid gap-3">
            {bullets.map((bullet) => (
              <div
                key={`${bullet.label}-${bullet.value.slice(0, 12)}`}
                className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white/85 leading-relaxed shadow-[0_18px_55px_rgba(15,23,42,0.35)] backdrop-blur-sm"
              >
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/55 mb-1">{bullet.label}</p>
                <p className="font-medium text-white/90">{bullet.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(PreviewShowcase);
